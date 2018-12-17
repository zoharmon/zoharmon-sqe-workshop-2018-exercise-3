import * as esprima from 'esprima';

let codeToParse;
let recordsTable = [];
let symbolicString = '';
let binding = [];
let globalBinding = [];
let args = [];
let flag = false;
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
    'ExpressionStatement' : expressionStatementParser1,
    'FunctionDeclaration' : functionDeclarationParser,
    'WhileStatement' : whileStatementParser1,
    'IfStatement' : ifStatementParser1
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

function variableDeclarationParser1(data) {
    symbolicString = symbolicString.concat(codeToParse.substring(data.range[0],data.range[1]).concat('\n'));
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
        }
        else
            globalBinding.push({key: data.id.name, val: data.init.raw});
    }

}
function variableDeclarationParser(data) {
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
            //let value = replaceGlob(assignment[data.init.type](data.init));
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
    enterParams(data.params);
    let params = '';
    for(let i=0; i< data.params.length;i++) {
        //globalBinding.push({key:data.params[i].name, val:args[i]});
        if(i === data.params.length-1)
            params = params.concat(data.params[i].name);
        else
            params = params.concat(data.params[i].name.concat(', '));
    }
    let func = 'function '.concat(data.id.name.concat('('.concat(params.concat('){\n'))));
    symbolicString = symbolicString.concat(func);
    dataTypeParser2(data.body.body);
    symbolicString = symbolicString.concat('\n}');
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
    let left = codeToParse.substring(data.expression.left.range[0],data.expression.left.range[1]);
    for(let i=0;i<binding.length;i++) {
        if (left === binding[i].key) {
            arrHendler(data,left,i);
            return;
        }}
    if(data.expression.right.type === 'ArrayExpression') {
        let tmp = codeToParse.substring(data.expression.right.range[0],data.expression.right.range[1]);
        symbolicString = symbolicString.concat('\n'.concat(left.concat(' '.concat(data.expression.operator.concat(' '.concat(tmp)))))).concat(';');
    }else {
        let right = assignment[data.expression.right.type](data.expression.right);
        symbolicString = symbolicString.concat('\n'.concat(left.concat(' '.concat(data.expression.operator.concat(' '.concat(right)))))).concat(';');
    }
    arrGlobalHandler(data,left);
}

function expressionStatementParser1(data){
    let left = codeToParse.substring(data.expression.left.range[0],data.expression.left.range[1]);
    let right = codeToParse.substring(data.expression.right.range[0],data.expression.right.range[1]);
    let right1 = assignmentGlobals[data.expression.right.type](data.expression.right);
    symbolicString = symbolicString.concat('\n'.concat(left.concat(' '.concat(data.expression.operator.concat(' '.concat(right)))))).concat(';');

    for(let i=0;i<globalBinding.length;i++){
        if(left === globalBinding[i].key)
            globalBinding[i].val = right1;
    }
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

function whileStatementParser1(data) {
    if(data.body.type === 'BlockStatement') {
        symbolicString = symbolicString.concat('while('.concat(codeToParse.substring(data.test.range[0],data.test.range[1]).concat('){\n')));
        dataTypeParser(data.body.body);
        symbolicString = symbolicString.concat('}\n');
    }
    else{
        symbolicString = symbolicString.concat('while('.concat(codeToParse.substring(data.test.range[0],data.test.range[1]).concat(')\n')));
        dataTypeParser([data.body]);
    }
}

function whileStatementParser(data) {
    let temp = clone(binding);
    let temp1 = clone(globalBinding);
    let test = assignment[data.test.type](data.test);
    if(data.body.type === 'BlockStatement'){
        symbolicString = symbolicString.concat('\n'.concat('while('.concat(test.concat('){'))));
        dataTypeParser2(data.body.body);
        symbolicString = symbolicString.concat('\n}');
    }
    else{
        symbolicString = symbolicString.concat('\n'.concat('while('.concat(test.concat(')'))));
        dataTypeParser2([data.body]);
    }
    binding = clone(temp);
    globalBinding = clone(temp1);
}

function ifStatementParser1(data) {
    symbolicString = symbolicString.concat(codeToParse.substring(data.range[0],data.range[1]).concat('\n'));
}

function ifStatementParser(data) {
    let temp = clone(binding);
    let temp1 = clone(globalBinding);
    let test = assignment[data.test.type](data.test);
    if (data.consequent.type === 'BlockStatement'){
        let ifExpr = 'if('.concat(test.concat(')'.concat('{')));
        let str = color(test,ifExpr);
        symbolicString = symbolicString.concat(str);
        dataTypeParser2(data.consequent.body);
        symbolicString = symbolicString.concat('\n}');
    } else{
        let ifExpr = 'if('.concat(test.concat(')'));
        let str = color(test,ifExpr);
        symbolicString = symbolicString.concat('\n'.concat(str));
        dataTypeParser2([data.consequent]);
    }
    binding = clone(temp);
    globalBinding = clone(temp1);
    elseAfterIf(data);
}



function color(test,ifExpr) {
    let str = '';
    if(addIfTable(test)) {
        if(flag) {
            symbolicString= symbolicString.substring(0,symbolicString.length-5);
            str = '<mark class = "green" id=" green">'.concat('else '.concat(ifExpr.concat('</mark>')));
            flag = false;
        }else
            str = '<mark class = "green" id=" green">'.concat(ifExpr.concat('</mark>'));
    }
    else {
        if(flag){
            symbolicString= symbolicString.substring(0,symbolicString.length-5);
            str = '<mark class = "red" id=" red">'.concat('else '.concat(ifExpr.concat('</mark>')));
            flag = false;
        }
        else
            str = '<mark class = "red" id=" red">'.concat(ifExpr.concat('</mark>'));}
    return str;
}

function elseAfterIf(data) {
    let temp = clone(binding);
    let temp1 = clone(globalBinding);
    if(data.alternate != null && data.alternate.type === 'BlockStatement'){
        symbolicString = symbolicString.concat('\nelse{');
        dataTypeParser2(data.alternate.body);
        symbolicString = symbolicString.concat('\n}');
    }
    else if(data.alternate != null){
        checkIfAfter(data.alternate);
        symbolicString = symbolicString.concat('\nelse ');
        dataTypeParser2([data.alternate]);
    }
    binding = clone(temp);
    globalBinding = clone(temp1);
}

function checkIfAfter(data) {
    if(data.type === 'IfStatement')
        flag = true;
    else
        flag = false;
}
function returnStatementParser(data) {
    if(data.argument != null){
        let ret = assignment[data.argument.type](data.argument);
        symbolicString = symbolicString.concat('\n'.concat('return '.concat(ret.concat(';'))));
    }
    else{
        symbolicString = symbolicString.concat('\n'.concat('return '.concat(';')));
    }
}

function setCodeToParse(string) {
    codeToParse = string;
}

function getSymbolic() {
    return symbolicString;
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
    symbolicString = '';
    binding = [];
    globalBinding = [];
    args = [];
    flag = false;
}
export {dataTypeParser,setCodeToParse,clean,setArguments,getSymbolic};