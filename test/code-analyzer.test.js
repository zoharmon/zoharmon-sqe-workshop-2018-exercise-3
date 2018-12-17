import assert from 'assert';
import {clean, getSymbolic, parseCode, setArguments} from '../src/js/code-analyzer';
import {setCodeToParse} from '../src/js/code-analyzer';
//import {setArguments} from '../src/js/code-analyzer';
import {dataTypeParser} from '../src/js/code-analyzer';
import {codeToParse} from '../src/js/code-analyzer';
/*
it('is parsing an empty function correctly', () => {
    assert.equal(
        JSON.stringify(parseCode('')),
        '{"type":"Program","body":[],"sourceType":"script","range":[0,0],"loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
    );
});
*/
it('test number 1', () => {
    setCodeToParse('let x = 1;\nfunction foo(){\nlet a = 2;\nreturn x;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let x = 1;\nfunction foo(){\n\nreturn x;\n}';
    assert.equal(actual, expected);
    clean();
});



it('test number 2 ', () => {
    setCodeToParse('function foo(x, y, z){\nlet a = x + 1;\nlet b = a + y;\nlet c = 0;\nif (b < z) {\nc = c + 5;\nreturn x + y + z + c;\n} else if (b < z * 2) {\nc = c + x + 5;\nreturn x + y + z + c;\n} else {\nc = c + z + 5;\nreturn x + y + z + c;\n}\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'function foo(x, y, z){\n<mark class = "red" id=" red">if(( ( ( x + 1 ) + y ) < z )){</mark>\nreturn ( ( ( x + y ) + z ) + ( 0 + 5 ) );\n}\n<mark class = "green" id=" green">else if(( ( ( x + ' +
        '1 ) + y ) < ( z * 2 ) )){</mark>\nreturn ( ( ( x + y ) + z ) + ( ( 0 + 1 ) + 5 ) );\n}\nelse{\nreturn ( ( ( x + y ) + z ) + ( ( 0 + 3 ) + 5 ) );\n}\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 3', () => {
    setCodeToParse('function foo(y,z){\nlet a=y;\nwhile(true){\ny=y+1;\n}\nreturn z;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'function foo(y, z){\n\nwhile(true){\ny = ( y + 1 );\n}\nreturn z;\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 4', () => {
    setCodeToParse('let x=0;\nwhile(true){\nx=x+1;\n}\nfunction foo(y,z){\nlet a=y;\nwhile(true){\ny=y+1;\n}\nreturn z;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let x=0;\nwhile(true){\n\nx = x+1;}\nfunction foo(y, z){\n\nwhile(true){\ny = ( y + 1 );\n}\nreturn z;\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 5', () => {
    setCodeToParse('function foo(x){\nif(x==1){\nreturn x;\n}\nelse\nreturn 1;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'function foo(x){\n<mark class = "green" id=" green">if(( x == 1 )){</mark>\nreturn x;\n}\nelse \nreturn 1;\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 6', () => {
    setCodeToParse('let p;\nfunction foo(x){\nlet a = [1,2];\nlet b;\nif(a[0] == 3){}\nreturn a[0];\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let p;\nfunction foo(x){\n<mark class = "red" id=" red">if(( 1 == 3 )){</mark>\n}\nreturn 1;\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 7', () => {
    setCodeToParse('function foo(){\nlet a;\na = [1,2];\nreturn 1;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'function foo(){\n\nreturn 1;\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 8', () => {
    setCodeToParse('function foo(x){\nlet a = [1,2];\nif(a[x] == 1)\nreturn 1;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'function foo(x){\n\n<mark class = "red" id=" red">if(( a[x] == 1 ))</mark>\nreturn 1;\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 9', () => {
    setCodeToParse('let x=1;\nfunction foo(y){\nlet a = y[1];\nreturn a;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('[1,2]');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let x=1;\nfunction foo(y){\n\nreturn y[1];\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 10', () => {
    setCodeToParse('function foo(x,y,z){\nlet a = [1,2];\nlet b = 1;\nwhile(x[y] < 5)\nz=a[b+y] + 1;\nreturn 0;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'function foo(x, y, z){\n\nwhile(( x[y] < 5 ))\nz = ( a[(1+y)] + 1 );\nreturn 0;\n}';
    assert.equal(actual, expected);
    clean();
});


it('test number 11', () => {
    setCodeToParse('if(true){}\nfunction foo(){\nreturn true;\n}');
    let parsedCode = parseCode(codeToParse);
    //setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'if(true){}\nfunction foo(){\n\nreturn true;\n}';
    assert.equal(actual, expected);
    clean();
});


it('test number 12', () => {
    setCodeToParse('while(true)\nfunction foo(){\nif(true){}\nelse if(false){}\nreturn ;\n}');
    let parsedCode = parseCode(codeToParse);
    //setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'while(true)\nfunction foo(){\n<mark class = "green" id=" green">if(true){</mark>\n}\n<mark class = "red" id=" red">else if(false){</mark>\n}\nreturn ;\n}';
    assert.equal(actual, expected);
    clean();
});


it('test number 13', () => {
    setCodeToParse('let x=0;\nfunction foo(){\nx=[1,2];\nreturn;\n}');
    let parsedCode = parseCode(codeToParse);
    //setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let x=0;\nfunction foo(){\n\nx = [1,2];\nreturn ;\n}';
    assert.equal(actual, expected);
    clean();
});

it('test number 14', () => {
    setCodeToParse('let x=0;');
    let parsedCode = parseCode(codeToParse);
    //setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let x=0;\n';
    assert.equal(actual, expected);
    clean();
});

it('test number 15', () => {
    setCodeToParse('let y=1;\nlet x=2;\nlet z;\nz=x;');
    let parsedCode = parseCode(codeToParse);
    //setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let y=1;\nlet x=2;\nlet z;\n\nz = x;';
    assert.equal(actual, expected);
    clean();
});


it('test number 16', () => {
    setCodeToParse('function foo(){\nlet a = [1,2,3];\nlet b = a[2];\nreturn b;\n}');
    let parsedCode = parseCode(codeToParse);
    //setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'function foo(){\n\nreturn 3;\n}';
    assert.equal(actual, expected);
    clean();
});


it('test number 17', () => {
    setCodeToParse('let a = [1,2];');
    let parsedCode = parseCode(codeToParse);
    //setArguments('[1,2] 0 1');
    dataTypeParser(parsedCode.body);
    let actual = getSymbolic();
    let expected = 'let a = [1,2];\n';
    assert.equal(actual, expected);
    clean();
});
