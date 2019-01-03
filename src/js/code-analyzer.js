import * as esprima from 'esprima';

let codeToParse;
let recordsTable = [];
let binding = [];
let globalBinding = [];
let args = [];
let needToBeGreen = true;
let blockString = '';
let nodeString = '';
let flowString = '';
let index = 1;
//let ifFlag = true;
let whileFlag = true;
let counter = 1;

export {recordsTable,codeToParse};

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true, range:true});
};

export {parseCode};

function dataTypeParser (data) {
    for (let i = 0; i < data.length; i++ )
        dataParser[data[i].type](data[i]);
}

function dataTypeParser2 (data) {
    for (let i = 0; i < data.length; i++ )
        dataParser2[data[i].type](data[i]);
}

const dataParser = {
    'VariableDeclaration' : variableDeclarationParser1,
    'VariableDeclarator' : variableDeclaratorParser1,
    'FunctionDeclaration' : functionDeclarationParser,
};

const dataParser2 = {
    'VariableDeclaration' : variableDeclarationParser,
    'VariableDeclarator' : variableDeclaratorParser,
    'ExpressionStatement' : expressionStatementParser,
    'WhileStatement' : whileStatementParser,
    'IfStatement' : ifStatementParser,
    'ReturnStatement' : returnStatementParser
};

const assignment = {
    'BinaryExpression' : binaryOrLogicExpressionParse,
    'Identifier' : identifierParse,
    'LogicalExpression' : binaryOrLogicExpressionParse,
    'Literal' : literalParse,
    'MemberExpression' : memberExpressionParse
};

const assignmentGlobals = {
    'BinaryExpression' : binaryOrLogicExpressionParse_glob,
    'Identifier' : identifierParse_glob,
    'LogicalExpression' : binaryOrLogicExpressionParse_glob,
    'Literal' : literalParse
};

function variableDeclarationParser1(data){
    blockString = blockString + codeToParse.substring(data.range[0],data.range[1]-1).replace('let','') + '\n';
    dataTypeParser(data.declarations);

}

function variableDeclaratorParser1(data) {
    if(data.init == null) {
        globalBinding.push({key: data.id.name, val: ''});
    }
    else {
        if(data.init.type === 'ArrayExpression'){
            let arr = '';
            for (let i = 0; i < data.init.elements.length; i++) {
                globalBinding.push({name: data.id.name.concat('[').concat(i.toString()).concat(']'), val: data.init.elements[i].raw});
                arr = arr.concat(data.init.elements[i].raw).concat(',');
            }
            arr = ('['.concat(arr.substring(0, arr.length - 1))).concat(']');
            globalBinding.push({name: data.id.name, val: arr});
        } else {
            let value = assignmentGlobals[data.init.type](data.init);
            globalBinding.push({key: data.id.name, val: value});
        }
    }

}
function variableDeclarationParser(data) {
    blockString = blockString + codeToParse.substring(data.range[0],data.range[1]-1).replace('let','') + '\n';
    dataTypeParser2(data.declarations);
}

function variableDeclaratorParser(data) {
    if(data.init == null){
        binding.push({key: data.id.name, val: ''});}
    else{
        if(data.init.type === 'ArrayExpression'){
            let str = '';
            for(let i=0; i<data.init.elements.length-1;i++){
                str += data.init.elements[i].raw.concat(',');
                binding.push({key: data.id.name.concat('[').concat(i.toString()).concat(']'), val: data.init.elements[i].raw});
            }
            str += data.init.elements[data.init.elements.length-1].raw;//the last
            binding.push({key: data.id.name.concat('[').concat((data.init.elements.length-1).toString()).concat(']'), val: data.init.elements[data.init.elements.length-1].raw});
            str = '['.concat(str).concat(']');
            binding.push({key: data.id.name, val: str});
        }else{
            let value = assignment[data.init.type](data.init);
            binding.push({key: data.id.name, val: value});
        }}
}

function binaryOrLogicExpressionParse(data) {
    let left = assignment[data.left.type](data.left);
    let right = assignment[data.right.type](data.right);
    return '( '.concat(left.concat(' '.concat(data.operator.concat(' '.concat(right)))).concat(' )'));

}

function binaryOrLogicExpressionParse_glob(data) {
    let left = assignmentGlobals[data.left.type](data.left);
    let right = assignmentGlobals[data.right.type](data.right);
    return left.concat(' '.concat(data.operator.concat(' '.concat(right))));
}

function identifierParse(data) {
    for(let index = 0; index < binding.length; index++){
        if(data.name === binding[index].key)
            return binding[index].val;
    }
    return data.name;
}

function identifierParse_glob(data) {
    for(let index = 0; index < globalBinding.length; index++){
        if(data.name === globalBinding[index].key)
            return globalBinding[index].val;
    }
}

function literalParse(data){
    return data.raw;
}

function memberExpressionParse(data) {
    let arrName = data.object.name;
    let place = assignment[data.property.type](data.property);
    if(!checkGlobal(place)){
        let str = arrName.concat('[').concat(eval(place)).concat(']');
        for(let i=0;i<binding.length;i++){
            if(str === binding[i].key)
                return binding[i].val;
        }
    }
    let v = addIfTable(place);
    let val = getVal(arrName.concat('[').concat(v).concat(']'));
    place = (place.split(' ')).join('');
    globalBinding.push({key:arrName.concat('[').concat(place).concat(']'),val:val});
    return arrName.concat('[').concat(place).concat(']');
}

function getVal(str) {
    for(let i =0;i<binding.length;i++){
        if(str === binding[i].key)
            return binding[i].val;
    }
    for(let i =0;i<globalBinding.length;i++){
        if(str === globalBinding[i].key)
            return globalBinding[i].val;
    }

}
function functionDeclarationParser(data) {
    if(blockString !== ''){
        let row = index + '=>operation: ' + '#' + counter + '\n' + blockString + ' |green\n';
        nodeString = nodeString + row ;
        flowString = flowString + '->' + index ;
        blockString = '';
        index++;
        counter++;
    }
    enterParams(data.params);
    dataTypeParser2(data.body.body);
}

function enterParams(params) {
    for(let i=0; i< params.length;i++) {
        if(args[i].charAt(0) === '[' && args[i].charAt(args[i].length-1) === ']'){
            let temp = args[i].substring(1,args[i].length-1);
            let arr = temp.split(',');
            for(let j=0;j<arr.length;j++)
                globalBinding.push({key: params[i].name.concat('['.concat(j.toString()).concat(']')), val: arr[j]});
        }

        globalBinding.push({key: params[i].name, val: args[i]});
    }
}

function arrHendler(data,left,i) {
    if(data.expression.right.type === 'ArrayExpression'){
        let str = '';
        for(let j=0; j<data.expression.right.elements.length-1;j++){
            str += data.expression.right.elements[j].raw.concat(',');
            binding.push({key: left.concat('[').concat(j.toString()).concat(']'), val: data.expression.right.elements[j].raw});
        }
        str += data.expression.right.elements[data.expression.right.elements.length-1].raw;//the last
        binding.push({key: left.concat('[').concat((data.expression.right.elements.length-1).toString()).concat(']'), val: data.expression.right.elements[data.expression.right.elements.length-1].raw});
        str = '['.concat(str).concat(']');
        binding[i].val=str;
    }else{
        let right = assignment[data.expression.right.type](data.expression.right);
        binding[i].val = replaceGlob(right);
    }

}

function arrGlobalHandler(data,left) {
    for(let i=0;i<globalBinding.length;i++){
        if(left === globalBinding[i].key) {
            if(data.expression.right.type === 'ArrayExpression'){
                let str = '';
                for(let j=0; j<data.expression.right.elements.length-1;j++){
                    str += data.expression.right.elements[j].raw.concat(',');
                    globalBinding.push({key: left.concat('[').concat(j.toString()).concat(']'), val: data.expression.right.elements[j].raw});
                }
                str += data.expression.right.elements[data.expression.right.elements.length-1].raw;//the last
                globalBinding.push({key: left.concat('[').concat((data.expression.right.elements.length-1).toString()).concat(']'), val: data.expression.right.elements[data.expression.right.elements.length-1].raw});
                str = '['.concat(str).concat(']');
                globalBinding[i].val=str;
            }else {
                let right1 = assignment[data.expression.right.type](data.expression.right);
                globalBinding[i].val = replaceGlob(right1);
            }}}
}


function expressionStatementParser(data) {
    blockString = blockString + codeToParse.substring(data.expression.range[0],data.expression.range[1]) + '\n';
    let left = codeToParse.substring(data.expression.left.range[0],data.expression.left.range[1]);
    for(let i=0;i<binding.length;i++) {
        if (left === binding[i].key) {
            arrHendler(data,left,i);
            return;
        }}
    arrGlobalHandler(data,left);
}

function replaceGlob(str) {
    let arr = str.split(' ');
    for(let i=0;i<arr.length;i++){
        for(let j=0;j<globalBinding.length;j++) {
            if (arr[i] === globalBinding[j].key)
                arr[i] = globalBinding[j].val;
        }
    }
    return arr.join(' ');
}

function whileStatementParser(data) {
    let temp = clone(binding);
    let temp1 = clone(globalBinding);
    let test = assignment[data.test.type](data.test);
    addCodeBeforeStatment();
    let seveIndexMargePoint = index;
    margePointWhile();
    let conditionIndex = index;
    addCondition(data);
    index++;
    whileFlag = needToBeGreen;
    if(needToBeGreen)
        needToBeGreen = addIfTable(test);
    checkBody(data);
    addCodeBeforeStatment();
    flowString = flowString + '->' + seveIndexMargePoint + '\n' ;
    flowString = flowString + conditionIndex + '(no)' ;
    setBack(temp, temp1); globalBinding = clone(temp1); needToBeGreen = whileFlag;
}

function checkBody(data){
    if (data.body.type === 'BlockStatement')
        dataTypeParser2(data.body.body);
    else
        dataTypeParser2([data.body]);
}


function margePointWhile() {
    if(needToBeGreen) {
        nodeString = nodeString + index + '=>end: `| green\n';
        flowString = flowString + '->' + index;
    }
    else {
        nodeString = nodeString + index + '=>end: `\n';
        flowString = flowString + '->' + index;
    }
    index++;
}


function ifStatementParser(data) {
    let temp = clone(binding); let temp1 = clone(globalBinding);
    let test = assignment[data.test.type](data.test);
    addCodeBeforeStatment();
    addCondition(data);
    let seveIndexIf = index;
    index++;
    let ifFlag = needToBeGreen;
    if(needToBeGreen)
        needToBeGreen = addIfTable(test);
    let seveIndexCont = index;
    margePoint(ifFlag);
    checkIfBody(data,seveIndexCont);
    addCodeBeforeStatment();
    flowString = flowString + '->' + seveIndexCont + '\n';
    if(ifFlag)
        needToBeGreen = !needToBeGreen;
    setBack(temp,temp1); elseAfterIf(data,seveIndexIf,seveIndexCont);
    needToBeGreen = ifFlag;
}

function setBack(temp,temp1){
    binding = clone(temp);
    globalBinding = clone(temp1);
}

function checkIfBody(data,seveIndexCont) {
    if (data.consequent.type === 'BlockStatement') {
        if(data.consequent.body.length === 1 && data.consequent.body[0].type === 'IfStatement')
            elseIfStatment(data.consequent.body[0],seveIndexCont);
        else
            dataTypeParser2(data.consequent.body);
    } else {
        if(data.consequent.type === 'IfStatement')
            elseIfStatment(data.consequent,seveIndexCont);
        else
            dataTypeParser2([data.consequent]);
    }
}

function elseIfStatment(data,seveIndexCont) {
    let temp = clone(binding);
    let temp1 = clone(globalBinding);
    let test = assignment[data.test.type](data.test);
    addCodeBeforeStatment();
    addCondition(data);
    let seveIndexIf = index; index++;
    let ifFlag = needToBeGreen;
    if(needToBeGreen)
        needToBeGreen = addIfTable(test);
    checkIfBody(data,seveIndexCont);
    addCodeBeforeStatment();
    flowString = flowString + '->' + seveIndexCont + '\n';
    if(ifFlag)
        needToBeGreen = !needToBeGreen;
    setBack(temp,temp1);
    elseAfterIf(data,seveIndexIf,seveIndexCont);
    needToBeGreen = ifFlag;
}

function elseAfterIf(data,seveIndexIf,seveIndexCont) {
    let temp = clone(binding);
    let temp1 = clone(globalBinding);
    flowString = flowString + seveIndexIf + '(no)';
    check(data,seveIndexCont);
    addCodeBeforeStatment();
    flowString = flowString + '->' + seveIndexCont + '\n' + seveIndexCont;
    binding = clone(temp);
    globalBinding = clone(temp1);
}

function check(data,seveIndexCont) {
    if (data.alternate != null && data.alternate.type === 'BlockStatement')
        checkIfNested1(data,seveIndexCont);
    else if(data.alternate != null)
        checkIfNested2(data,seveIndexCont);
}

function checkIfNested1(data,seveIndexCont) {
    if(data.alternate.body.length === 1 && data.alternate.body[0].type === 'IfStatement')
        elseIfStatment(data.alternate.body[0],seveIndexCont);
    else
        dataTypeParser2(data.alternate.body);
}

function checkIfNested2(data,seveIndexCont) {
    if(data.alternate.type === 'IfStatement')
        elseIfStatment(data.alternate,seveIndexCont);
    else
        dataTypeParser2([data.alternate]);
}

function addCondition(data) {
    if(needToBeGreen) {
        let row = index + '=>condition: ' + '#' + counter + '\n' + codeToParse.substring(data.test.range[0],data.test.range[1]) + ' |green\n';
        nodeString = nodeString + row;
        flowString = flowString + '->' + index + '->\n' + index + '(yes)';
    }else{
        let row = index + '=>condition: ' + '#' + counter + '\n' + codeToParse.substring(data.test.range[0],data.test.range[1]) + ' \n';
        nodeString = nodeString + row;
        flowString = flowString + '->' + index + '->\n' + index + '(yes)';
    }
    counter++;
}

function margePoint(ifFlag) {
    if(needToBeGreen)
        nodeString = nodeString + index + '=>end: `| green\n';
    else {
        if (ifFlag)
            nodeString = nodeString + index + '=>end: `| green\n';
        else
            nodeString = nodeString + index + '=>end: `\n';
    }
    index++;
}

function addCodeBeforeStatment() {
    if(blockString !== '' ){
        if(needToBeGreen) {
            let row = index + '=>operation: ' + '#'+ counter + '\n' + blockString + ' |green\n';
            nodeString = nodeString + row;
            flowString = flowString + '->' + index;
        }else{
            let row = index + '=>operation: ' + '#'+ counter + '\n' + blockString + ' \n';
            nodeString = nodeString + row;
            flowString = flowString + '->' + index;
        }
        index++;
        counter++;
        blockString = '';
    }
}

function returnStatementParser(data) {
    addCodeBeforeStatment();
    if(needToBeGreen){
        let row = index + '=>operation: ' + '#' + counter + '\n' + codeToParse.substring(data.range[0],data.range[1]-1) + ' |green\n';
        nodeString = nodeString + row;
        flowString = flowString + '->' + index;
    }else{
        let row = index + '=>operation: ' + '#' + counter + '\n' + codeToParse.substring(data.range[0],data.range[1]-1) + ' \n';
        nodeString = nodeString + row;
        flowString = flowString + '->' + index;}
    index = index + 1;

}

function setCodeToParse(string) {
    codeToParse = string;
}

function setArguments(str) {
    args = str.split(' ');
}

function checkGlobal(test) {
    let temp = test.split(' ');
    for(let i=0;i<temp.length;i++) {
        for(let j=0;j<globalBinding.length;j++){
            if (temp[i] === globalBinding[j].key)
                return true;
        }
    }
    return false;
}

function addIfTable(test) {
    let temp = test.split(' ');
    for(let i=0;i<temp.length;i++) {
        for(let j=0;j<globalBinding.length;j++){
            if (temp[i] === globalBinding[j].key)
                temp[i] = globalBinding[j].val;
        }
    }
    let str = temp.join(' ');
    return eval(str);
}

function clone(arr){
    let temp = [];
    for(let i=0; i<arr.length;i++)
        temp.push({key:arr[i].key, val: arr[i].val});
    return temp;
}
function clean() {

    codeToParse = '';
    recordsTable = [];
    binding = [];
    globalBinding = [];
    args = [];
    needToBeGreen = true;
    blockString = '';
    nodeString = '';
    flowString = '';
    index = 1;
    //ifFlag = true;
    whileFlag = true;
    counter = 1;
}

function getCode() {
    return nodeString + '\n' +flowString.substring(2);
}


export {dataTypeParser,setCodeToParse,clean,setArguments,getCode};