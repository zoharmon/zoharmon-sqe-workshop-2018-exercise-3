import * as esprima from 'esprima';


let codeToParse;
let recordsTable = [];
export {recordsTable,codeToParse};

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true, range:true});
};

export {parseCode};

function dataTypeParser (data) {
    for (let i = 0; i < data.length; i++ )
        dataParser[data[i].type](data[i]);
}



const dataParser = {
    'VariableDeclaration' : variableDeclarationParser,
    'VariableDeclarator' : variableDeclaratorParser,
    'FunctionDeclaration' : functionDeclarationParser,
    'Identifier' : identifierParser,
    'ExpressionStatement' : expressionStatementParser,
    'WhileStatement' : whileStatementParser,
    'IfStatement' : ifStatementParser,
    'ReturnStatement' : returnStatementParser,
    'ForStatement' : forStatementParse
};

function variableDeclarationParser(data) {
    dataTypeParser(data.declarations);
}

function variableDeclaratorParser(data) {
    if(data.init == null)
        recordsTable.push({
            line: data.loc.start.line,
            type: 'variable declaration',
            name: data.id.name,
            condition: '',
            value: ''
        });
    else
        recordsTable.push({
            line: data.loc.start.line,
            type: 'variable declaration',
            name: data.id.name,
            condition: '',
            value: codeToParse.substring(data.init.range[0],data.init.range[1])
        });
}

function functionDeclarationParser(data) {
    recordsTable.push({line: data.loc.start.line, type: 'function declaration', name: data.id.name, condition: '', value: ''});
    dataTypeParser(data.params);
    dataTypeParser(data.body.body);
}

function identifierParser(data) {
    recordsTable.push({line: data.loc.start.line, type: 'variable declaration', name: data.name, condition: '', value: ''});
}

function expressionStatementParser(data) {
    if(data.expression.type == 'UpdateExpression')
        recordsTable.push({
            line: data.loc.start.line,
            type: 'assignment expression',
            name: data.expression.argument.name,
            condition: '',
            value: codeToParse.substring(data.expression.range[0],data.expression.range[1])
        });
    else
        recordsTable.push({
            line: data.loc.start.line,
            type: 'assignment expression',
            name: codeToParse.substring(data.expression.left.range[0],data.expression.left.range[1]),
            condition: '',
            value: codeToParse.substring(data.expression.right.range[0],data.expression.right.range[1])
        });
}

function whileStatementParser(data) {
    recordsTable.push({
        line: data.loc.start.line,
        type: 'while statement',
        name: '',
        condition: codeToParse.substring(data.test.range[0],data.test.range[1]),
        value: ''
    });
    if(data.body.type == 'BlockStatement')
        dataTypeParser(data.body.body);
    else
        dataTypeParser([data.body]);
}

function ifStatementParser(data) {
    recordsTable.push({
        line: data.loc.start.line,
        type: 'if statement',
        name: '',
        condition: codeToParse.substring(data.test.range[0], data.test.range[1]),
        value: ''
    });
    checkConsequent(data);
    checkElse(data);
    if (data.alternate != null && data.alternate.type === 'IfStatement') {//else-if
        elseIfStatementParser(data.alternate);
    }
}

function elseIfStatementParser(data) {
    recordsTable.push({
        line: data.loc.start.line,
        type: 'else-if statement',
        name: '',
        condition: codeToParse.substring(data.test.range[0],data.test.range[1]),
        value: ''
    });
    checkConsequent(data);
    checkElse(data);
    if(data.alternate != null && data.alternate.type === 'IfStatement')//else-if
        elseIfStatementParser(data.alternate);
}

function checkConsequent(data) {
    if (data.consequent.type === 'BlockStatement')
        dataTypeParser(data.consequent.body);
    else
        dataTypeParser([data.consequent]);
}

function checkElse(data) {
    if (data.alternate != null && data.alternate.type !== 'IfStatement') {//else only
        if (data.alternate.type === 'BlockStatement')
            dataTypeParser(data.alternate.body);
        else
            dataTypeParser([data.alternate]);
    }
}

function returnStatementParser(data) {
    recordsTable.push({
        line: data.loc.start.line,
        type: 'return statement',
        name: '',
        condition: '',
        value: codeToParse.substring(data.argument.range[0],data.argument.range[1])
    });
}

function forStatementParse(data){
    recordsTable.push({
        line: data.loc.start.line,
        type: 'for statement',
        name: '',
        condition: codeToParse.substring(data.init.range[0],data.init.range[1]).concat(codeToParse.substring(data.test.range[0],data.test.range[1])).concat(';').concat(codeToParse.substring(data.update.range[0],data.update.range[1])),
        value: ''
    });
    if(data.body.type == 'BlockStatement')
        dataTypeParser(data.body.body);
    else
        dataTypeParser([data.body]);
}

function setCodeToParse(string) {
    codeToParse = string;
}

function clear(arr) {
    arr.length = 0;
}


export {dataTypeParser,setCodeToParse,clear};