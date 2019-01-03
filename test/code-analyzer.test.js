import assert from 'assert';
import {clean, parseCode, setArguments,getCode} from '../src/js/code-analyzer';
import {setCodeToParse} from '../src/js/code-analyzer';
import {dataTypeParser} from '../src/js/code-analyzer';
import {codeToParse} from '../src/js/code-analyzer';


it('test number 1', () => {
    setCodeToParse('function foo(x, y, z){\nlet a = x + 1;\nreturn c;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n a = x + 1\n |green\n2=>operation: #2\nreturn c |green\n\n1->2';
    assert.equal(actual, expected);
    clean();
});


it('test number 2', () => {
    setCodeToParse('function foo(x, y, z){\nlet a = x + 1;\nlet b = a + y;\nb = b + 5;\nreturn b;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n a = x + 1\n b = a + y\nb = b + 5\n |green' +
        '\n2=>operation: #2\nreturn b |green\n\n1->2';
    assert.equal(actual, expected);
    clean();
});

it('test number 3', () => {
    setCodeToParse('function foo(x, y, z){\nlet a = x[1] + 1;\nlet b = y;\nreturn b;\n}\n');
    let parsedCode = parseCode(codeToParse);
    setArguments('[1,2] "hello" 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected ='1=>operation: #1\n a = x[1] + 1\n b = y\n |green\n2=>operation: #2\nreturn b |green\n\n1->2';
    assert.equal(actual, expected);
    clean();
});

it('test number 4', () => {
    setCodeToParse('function foo(x, y){\nlet a = 1;\nlet b = y[x + a];\nreturn;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 ["true", "false", "hello"]');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected ='1=>operation: #1\n a = 1\n b = y[x + a]\n |green\n2=>operation: #2\nreturn |green' +
        '\n\n1->2';
    assert.equal(actual, expected);
    clean();
});

it('test number 5 - while', () => {
    setCodeToParse('function foo(){\nlet c;\nwhile(true)\nc = 5;\nreturn c;\n}\n');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n c\n |green\n2=>end: `| green\n3=>condition: #2\ntrue |green' +
        '\n4=>operation: #3\nc = 5\n |green\n5=>operation: #4\nreturn c |green\n\n1->2->3->' +
        '\n3(yes)->4->2\n3(no)->5';
    assert.equal(actual, expected);
    clean();
});


it('test number 6 - while', () => {
    setCodeToParse('function foo(x){\nlet a = x;\nwhile(false){\nx = 5;\n}\nreturn c;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n a = x\n |green\n2=>end: `| green' +
        '\n3=>condition: #2\nfalse |green\n4=>operation: #3\nx = 5\n \n5=>operation: #4\nreturn c |green' +
        '\n\n1->2->3->\n3(yes)->4->2\n3(no)->5';
    assert.equal(actual, expected);
    clean();
});

it('test number 7 - while', () => {
    setCodeToParse('function foo(){\nlet x = 1\nwhile(false){\nif(true)\nreturn 5;\n}\nreturn;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n x = \n |green\n2=>end: `| green' +
        '\n3=>condition: #2\nfalse |green\n4=>condition: #3\ntrue \n5=>end: `\n6=>operation: #4\nreturn 5 \n7=>operation: #4\nreturn |green' +
        '\n\n1->2->3->\n3(yes)->4->\n4(yes)->6->5\n4(no)->5\n5->2\n3(no)->7';
    assert.equal(actual, expected);
    clean();
});

it('test number 8 - if', () => {
    setCodeToParse('function foo(x, y){\nif(x[0] === "hello")\ny = y + 7;\nreturn;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('[\'hello\'] 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\nx[0] === "hello" |green\n2=>end: `| green' +
        '\n3=>operation: #2\ny = y + 7\n |green\n4=>operation: #3\nreturn |green' +
        '\n\n1->\n1(yes)->3->2\n1(no)->2\n2->4';
    assert.equal(actual, expected);
    clean();
});

it('test number 9 - if', () => {
    setCodeToParse('function foo(x){\nif(x == 10)\nx = x + 1;\nelse\nx = x + 2;\nreturn x;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('10');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\nx == 10 |green\n2=>end: `| green' +
        '\n3=>operation: #2\nx = x + 1\n |green' +
        '\n4=>operation: #3\nx = x + 2\n \n5=>operation: #4\nreturn x |green' +
        '\n\n1->\n1(yes)->3->2\n1(no)->4->2\n2->5';
    assert.equal(actual, expected);
    clean();
});

it('test number 10 - if', () => {
    setCodeToParse('function foo(x){\nif(x == 10)\nx = x + 1;\nelse\nx = x + 2;\nreturn x;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\nx == 10 |green\n2=>end: `| green' +
        '\n3=>operation: #2\nx = x + 1\n \n4=>operation: #3\nx = x + 2\n |green' +
        '\n5=>operation: #4\nreturn x |green\n\n1->\n1(yes)->3->2\n1(no)->4->2\n2->5';
    assert.equal(actual, expected);
    clean();
});


it('test number 11 - if', () => {
    setCodeToParse('function foo(x, y, z){\nlet c = 0;\nif (x < z){\nc = c + 5;' +
        '\n} else if (y < z * 2) {\nc = c + x + 5;\n} else {\nc = c + z + 5;\n}\nreturn c;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n c = 0\n |green\n2=>condition: #2' +
        '\nx < z |green\n3=>end: `| green\n4=>operation: #3\nc = c + 5\n |green' +
        '\n5=>condition: #4\ny < z * 2 \n6=>operation: #5\nc = c + x + 5\n ' +
        '\n7=>operation: #6\nc = c + z + 5\n \n8=>operation: #7\nreturn c |green' +
        '\n\n1->2->\n2(yes)->4->3\n2(no)->5->\n5(yes)->6->3\n5(no)->7->3\n3->3\n3->8';
    assert.equal(actual, expected);
    clean();
});

it('test number 12 - if', () => {
    setCodeToParse('function foo(x, y, z){\nlet c = 0;\nif (x > z){\nc = c + 5;' +
        '\n} else if (y < z * 2) {\nc = c + x + 5;\n} else {\nc = c + z + 5;\n}\nreturn c;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n c = 0\n |green' +
        '\n2=>condition: #2\nx > z |green\n3=>end: `| green' +
        '\n4=>operation: #3\nc = c + 5\n \n5=>condition: #4\ny < z * 2 |green' +
        '\n6=>operation: #5\nc = c + x + 5\n |green\n7=>operation: #6\nc = c + z + 5\n ' +
        '\n8=>operation: #7\nreturn c |green' +
        '\n\n1->2->\n2(yes)->4->3\n2(no)->5->\n5(yes)->6->3\n5(no)->7->3\n3->3\n3->8';
    assert.equal(actual, expected);
    clean();
});

it('test number 13 - if and while', () => {
    setCodeToParse('function foo(x, y, z){\nif(true){\nwhile(x == 1)\ny = 9;\n}\nreturn y;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\ntrue |green\n2=>end: `| green\n3=>end: `| green' +
        '\n4=>condition: #2\nx == 1 |green\n5=>operation: #3\ny = 9\n |green\n6=>operation: #4' +
        '\nreturn y |green\n\n1->\n1(yes)->3->4->\n4(yes)->5->3\n4(no)->2\n1(no)->2\n2->6';
    assert.equal(actual, expected);
    clean();
});

it('test number 14 - if and while', () => {
    setCodeToParse('function foo(x, y, z){\nif(true){\nwhile(false)\ny = 9;\n}\nreturn y;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\ntrue |green\n2=>end: `| green' +
        '\n3=>end: `| green\n4=>condition: #2\nfalse |green\n5=>operation: #3\ny = 9\n ' +
        '\n6=>operation: #4\nreturn y |green\n\n1->\n1(yes)->3->4->\n4(yes)->5->3\n' +
        '4(no)->2\n1(no)->2\n2->6';
    assert.equal(actual, expected);
    clean();
});

it('test number 15 - if and while', () => {
    setCodeToParse('function foo(x, y, z){\nif(x == 2){\nwhile(false)\ny = 9;\n}\nreturn y;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\nx == 2 |green\n2=>end: `| green\n3=>end: `\n4=>condition: #2' +
        '\nfalse \n5=>operation: #3\ny = 9\n \n6=>operation: #4\nreturn y |green' +
        '\n\n1->\n1(yes)->3->4->\n4(yes)->5->3\n4(no)->2\n1(no)->2\n2->6';
    assert.equal(actual,expected);
    clean();
});

it('test number 16 - globals', () => {
    setCodeToParse('let p = 1;\nfunction foo(){\nlet a = p;\nif(a > 0)\na = a + 1;\nreturn a;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n p = 1\n |green' +
        '\n2=>operation: #2\n a = p\n |green' +
        '\n3=>condition: #3\na > 0 |green\n4=>end: `| green\n5=>operation: #4\na = a + 1\n |green' +
        '\n6=>operation: #5\nreturn a |green\n\n1->2->3->\n3(yes)->5->4\n3(no)->4\n4->6';
    assert.equal(actual, expected);
    clean();
});


it('test number 17 - globals', () => {
    setCodeToParse('let t;\nlet b = [1,2];\nfunction foo(){\nlet a = 1;\nif(a > 0)\na = a + 1;\nreturn a;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n t\n b = [1,2]\n |green' +
        '\n2=>operation: #2\n a = 1\n |green\n3=>condition: #3\na > 0 |green' +
        '\n4=>end: `| green\n5=>operation: #4\na = a + 1\n |green\n6=>operation: #5\nreturn a |green' +
        '\n\n1->2->3->\n3(yes)->5->4\n3(no)->4\n4->6';
    assert.equal(actual, expected);
    clean();
});


it('test number 18 - globals', () => {
    setCodeToParse('let b = 2 + 1;\nfunction foo(){\nreturn;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1 2 3');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n b = 2 + 1\n |green\n2=>operation: #2\nreturn |green\n\n1->2';
    assert.equal(actual, expected);
    clean();
});


it('test number 19 - globals', () => {
    setCodeToParse('function foo(){\nlet x = [1, 2];\nreturn x[1];\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n x = [1, 2]\n |green\n2=>operation: #2\nreturn x[1] |green\n\n1->2';
    assert.equal(actual, expected);
    clean();
});


it('test number 20 - globals using globals', () => {
    setCodeToParse('let z = 7;\n' +
        'let x = 1;\n' +
        'let y = x + 1;\n' +
        'function foo(){\n' +
        'if(y == 2)\n' +
        'return 1;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n z = 7\n x = 1\n y = x + 1\n |green' +
        '\n2=>condition: #2\ny == 2 |green\n3=>end: `| green\n4=>operation: #3\nreturn 1 |green' +
        '\n\n1->2->\n2(yes)->4->3\n2(no)->3\n3';
    assert.equal(actual, expected);
    clean();
});


it('test number 21 - globals using globals', () => {
    setCodeToParse('let z = 7;\n' +
        'let x = 1;\n' +
        'let y = x + 1;\n' +
        'function foo(){\n' +
        'if(y == 2)\n' +
        'return 1;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n z = 7\n x = 1\n y = x + 1\n |green' +
        '\n2=>condition: #2\ny == 2 |green\n3=>end: `| green' +
        '\n4=>operation: #3\nreturn 1 |green\n\n1->2->\n2(yes)->4->3\n2(no)->3\n3';
    assert.equal(actual, expected);
    clean();
});

it('test number 22 - else blockStatement', () => {
    setCodeToParse('function foo(){\n' +
        'if(1 == 2)\n' +
        'return 3;\n' +
        'else{\n' +
        'return 2;\n' +
        '}\n' +
        '}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\n1 == 2 |green\n2=>end: `| green' +
        '\n3=>operation: #2\nreturn 3 \n4=>operation: #2\nreturn 2 |green' +
        '\n\n1->\n1(yes)->3->2\n1(no)->4->2\n2';
    assert.equal(actual, expected);
    clean();
});

it('test number 23 - assignment right array', () => {
    setCodeToParse('function foo(x){\n' +
        'let a = 1;\n' +
        'a = [1, 2];\nx = [1, 2];\n' +
        'if(a[1] == x[1])\n' +
        'return true;\nelse\n' +
        'return false;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n a = 1\na = [1, 2]\nx = [1, 2]\n |green' +
        '\n2=>condition: #2\na[1] == x[1] |green\n3=>end: `| green' +
        '\n4=>operation: #3\nreturn true |green\n5=>operation: #3\nreturn false \n\n1->2->\n' +
        '2(yes)->4->3\n2(no)->5->3\n3';
    assert.equal(actual, expected);
    clean();
});

it('test number 24 - while block statement', () => {
    setCodeToParse('function foo(){\n' +
        'let x = 8;' +
        'while(true){\n' +
        'return true;\n' +
        '}\n' +
        '}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n x = 8\n |green\n2=>end: `| green' +
        '\n3=>condition: #2\ntrue |green\n4=>operation: #3\nreturn true |green\n\n1->2->3->' +
        '\n3(yes)->4->2\n3(no)';
    assert.equal(actual, expected);
    clean();
});

it('test number 25 - array index is local', () => {
    setCodeToParse('function foo(x){\n' +
        'let a = [1, 2];\n' +
        'let c = a[x];\n' +
        'if(c == 2)\n' +
        'return true;\n' +
        '}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n a = [1, 2]\n c = a[x]\n |green' +
        '\n2=>condition: #2\nc == 2 |green\n3=>end: `| green' +
        '\n4=>operation: #3\nreturn true |green\n\n1->2->\n2(yes)->4->3\n2(no)->3\n3';
    assert.equal(actual, expected);
    clean();
});

it('test number 26 - array index is local', () => {
    setCodeToParse('function foo(x){\nlet a = x;\nif(x == 2){\na = 2;\n}\nelse if(x == 8)\na = 3;\nelse if(x == 0)\n' +
        'a = 4;\nelse\na = 5;\n\nreturn a;\n}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n a = x\n |green\n2=>condition: #2\nx == 2 |green' +
        '\n3=>end: `| green\n4=>operation: #3\na = 2\n \n5=>condition: #4\nx == 8 |green' +
        '\n6=>operation: #5\na = 3\n \n7=>condition: #6\nx == 0' +
        ' |green\n8=>operation: #7\na = 4\n \n9=>operation: #8\na = 5\n |green' +
        '\n10=>operation: #9\nreturn a |green\n\n1->2->\n2(yes)->4->3\n2(no)->5->\n5(yes)->6->3' +
        '\n5(no)->7->\n7(yes)->8->3\n7(no)->9->3\n3->3\n3->3\n3->10';
    assert.equal(actual, expected);
    clean();
});


it('test number 27 - array index is local', () => {
    setCodeToParse('function foo(){\nlet x = 0;\nif(x == 9){\nif(true)\n' +
        'if(false)\nx = 8;\n}\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n x = 0\n |green\n2=>condition: #2\nx == 9 |green' +
        '\n3=>end: `| green\n4=>condition: #3\ntrue \n5=>condition: #4\nfalse \n6=>operation: #5' +
        '\nx = 8\n \n\n1->2->\n2(yes)->4->\n4(yes)->5->\n' +
        '5(yes)->6->3\n5(no)->3\n3->3\n4(no)->3\n3->3\n2(no)->3\n3';
    assert.equal(actual, expected);
    clean();
});


it('test number 28 - array index is local', () => {
    setCodeToParse('function foo(x){\n' +
        'if(x == 1)\n' +
        '  if(x == 2)\n' +
        '      x = 3;\n' +
        'return x;\n' +
        '}');
    let parsedCode = parseCode(codeToParse);
    setArguments('1');
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>condition: #1\nx == 1 |green\n2=>end: `| green\n3=>condition: #2' +
        '\nx == 2 |green\n4=>operation: #3\nx = 3\n \n5=>operation: #4\nreturn x |green' +
        '\n\n1->\n1(yes)->3->\n3(yes)->4->2\n3(no)->2\n2->2\n1(no)->2\n2->5';
    assert.equal(actual, expected);
    clean();
});

it('test number 29 - array index is local', () => {
    setCodeToParse('function foo(){\nlet a = 1;\nif(a > 2)\na = 9;\n' +
        'else if(a < 6){\nif(a > 1)\na = 2;\n}\n' +
        'else{\nif(a == 3)\na = 8;\n}\nreturn a;\n}');
    let parsedCode = parseCode(codeToParse);
    dataTypeParser(parsedCode.body);
    let actual = getCode();
    let expected = '1=>operation: #1\n a = 1\n |green\n2=>condition: #2\na > 2 |green' +
        '\n3=>end: `| green\n4=>operation: #3\na = 9\n \n5=>condition: #4\na < 6 |green' +
        '\n6=>condition: #5\na > 1 |green\n7=>operation: #6\na = 2' +
        '\n \n8=>condition: #7\na == 3 \n9=>operation: #8\na = 8\n \n10=>operation: #9' +
        '\nreturn a |green\n\n1->2->\n2(yes)->4->3\n2(no)->5->\n5(yes)->6->' +
        '\n6(yes)->7->3\n6(no)->3\n3->3\n5(no)->8->\n8(yes)->9->3\n8(no)->3\n3->3\n3->3\n' +
        '3->10';
    assert.equal(actual, expected);
    clean();
});
