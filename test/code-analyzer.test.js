import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {setCodeToParse} from '../src/js/code-analyzer';
import {clear} from '../src/js/code-analyzer';
import {dataTypeParser} from '../src/js/code-analyzer';
import {recordsTable} from '../src/js/code-analyzer';
import {codeToParse} from '../src/js/code-analyzer';

it('is parsing an empty function correctly', () => {
    assert.equal(
        JSON.stringify(parseCode('')),
        '{"type":"Program","body":[],"sourceType":"script","range":[0,0],"loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
    );
});

it('test number 1 - Variable Declaration', () => {
    setCodeToParse('let a = 1;');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = to_String(recordsTable[0]);
    let expected = '{line:1, type:variable declaration, name:a, condition:, value:1}';
    assert.equal(actual, expected);
    clear(recordsTable);
});

it('test number 2 - Variable Declaration', () => {
    setCodeToParse('let a = 1+1;');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = to_String(recordsTable[0]);
    let expected = '{line:1, type:variable declaration, name:a, condition:, value:1+1}';
    assert.equal(actual, expected);
    clear(recordsTable);
});

it('test number 3 - assignment expression', () => {
    setCodeToParse('\nlow = n-1;');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = to_String(recordsTable[0]);
    let expected = '{line:2, type:assignment expression, name:low, condition:, value:n-1}';
    assert.equal(actual, expected);
    clear(recordsTable);
});

it('test number 4 - while statement', () => {
    setCodeToParse('while(true){\nlow = n-1;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual_line1 = to_String(recordsTable[0]);
    let expected_line1 = '{line:1, type:while statement, name:, condition:true, value:}';
    let actual_line2 = to_String(recordsTable[1]);
    let expected_line2 = '{line:2, type:assignment expression, name:low, condition:, value:n-1}';
    assert.equal(actual_line1, expected_line1);
    assert.equal(actual_line2, expected_line2);
    clear(recordsTable);
});

it('test number 5 - while statement', () => {
    setCodeToParse('while(x>arr[0]){\nwhile(true)\nwhile(false)\nx = a+b;}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:while statement, name:, condition:x>arr[0], value:}');
    assert.equal(to_String(recordsTable[1]), '{line:2, type:while statement, name:, condition:true, value:}');
    assert.equal(to_String(recordsTable[2]),'{line:3, type:while statement, name:, condition:false, value:}');
    assert.equal(to_String(recordsTable[3]),'{line:4, type:assignment expression, name:x, condition:, value:a+b}');
    clear(recordsTable);
});

it('test number 6 - for statement', () => {
    setCodeToParse('for(let i=0; i<4; i++){\narr[i] = i;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:for statement, name:, condition:let i=0;i<4;i++, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:2, type:assignment expression, name:arr[i], condition:, value:i}');
    clear(recordsTable);
});

it('test number 7 - for statement', () => {
    setCodeToParse('for(let i=0; i<10;i++)\nx = 1;');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:for statement, name:, condition:let i=0;i<10;i++, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:2, type:assignment expression, name:x, condition:, value:1}');
    clear(recordsTable);
});

it('test number 8 - if statement', () => {
    setCodeToParse('if (X < V[mid])\nhigh = mid - 1;\nelse if (X > V[mid])\nlow = mid + 1;\nelse\nlow = mid + 1;');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:if statement, name:, condition:X < V[mid], value:}');
    assert.equal(to_String(recordsTable[1]), '{line:2, type:assignment expression, name:high, condition:, value:mid - 1}');
    assert.equal(to_String(recordsTable[2]), '{line:3, type:else-if statement, name:, condition:X > V[mid], value:}');
    assert.equal(to_String(recordsTable[3]), '{line:4, type:assignment expression, name:low, condition:, value:mid + 1}');
    assert.equal(to_String(recordsTable[4]), '{line:6, type:assignment expression, name:low, condition:, value:mid + 1}');
    clear(recordsTable);
});

it('test number 9 - if statement', () => {
    setCodeToParse('if(1<2)\nx=y;\nelse\ny=x');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:if statement, name:, condition:1<2, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:2, type:assignment expression, name:x, condition:, value:y}');
    assert.equal(to_String(recordsTable[2]), '{line:4, type:assignment expression, name:y, condition:, value:x}');
    clear(recordsTable);
});

it('test number 9 - if statement', () => {
    setCodeToParse('if(1<2)\nx=y;\nelse\ny=x');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:if statement, name:, condition:1<2, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:2, type:assignment expression, name:x, condition:, value:y}');
    assert.equal(to_String(recordsTable[2]), '{line:4, type:assignment expression, name:y, condition:, value:x}');
    clear(recordsTable);
});

it('test number 10 - if statement', () => {
    setCodeToParse('if(true)\nx=1\nelse if(true)\nx=2\nelse if(true)\nx=3\n');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:if statement, name:, condition:true, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:2, type:assignment expression, name:x, condition:, value:1}');
    assert.equal(to_String(recordsTable[2]), '{line:3, type:else-if statement, name:, condition:true, value:}');
    assert.equal(to_String(recordsTable[3]), '{line:4, type:assignment expression, name:x, condition:, value:2}');
    assert.equal(to_String(recordsTable[4]), '{line:5, type:else-if statement, name:, condition:true, value:}');
    assert.equal(to_String(recordsTable[5]), '{line:6, type:assignment expression, name:x, condition:, value:3}');
    clear(recordsTable);
});

it('test number 11 - function declaration', () => {
    setCodeToParse('function binarySearch(X){\nreturn -1;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:function declaration, name:binarySearch, condition:, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:1, type:variable declaration, name:X, condition:, value:}');
    assert.equal(to_String(recordsTable[2]), '{line:2, type:return statement, name:, condition:, value:-1}');
    clear(recordsTable);
});

it('test number 12 - variable Declarator', () => {
    setCodeToParse('let x;');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:variable declaration, name:x, condition:, value:}');
    clear(recordsTable);
});

it('test number 13 - if statement', () => {
    setCodeToParse('if(true){x=1}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:if statement, name:, condition:true, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:1, type:assignment expression, name:x, condition:, value:1}');
    clear(recordsTable);
});

it('test number 14 - if statement', () => {
    setCodeToParse('if(true){x=1}else{x=2}\n');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:if statement, name:, condition:true, value:}');
    assert.equal(to_String(recordsTable[1]), '{line:1, type:assignment expression, name:x, condition:, value:1}');
    assert.equal(to_String(recordsTable[2]), '{line:1, type:assignment expression, name:x, condition:, value:2}');
    clear(recordsTable);
});

it('test number 14 - if statement', () => {
    setCodeToParse('i++');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    assert.equal(to_String(recordsTable[0]), '{line:1, type:assignment expression, name:i, condition:, value:i++}');
    clear(recordsTable);
});


function to_String(map) {
    return '{line:'+map.line+', type:'+map.type+', name:'+map.name+', condition:'+map.condition+', value:'+map.value+'}';
}