import $ from 'jquery';
import {parseCode, setCodeToParse, setArguments,getCode} from './code-analyzer';
import {dataTypeParser} from './code-analyzer';

const flowchart = require('flowchart.js');

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let stringUser = $('#codePlaceholder').val();
        let stringUserVector = $('#codePlaceholderArguments').val();
        setArguments(stringUserVector);
        setCodeToParse(stringUser);
        let parsedCode = parseCode(stringUser);
        dataTypeParser(parsedCode.body);
        let code = getCode();
        let diagram = flowchart.parse(code);
        diagram.drawSVG('diagram');
        diagram.drawSVG('diagram', {'x': 0, 'y': 0, 'line-width': 3, 'line-length': 50, 'text-margin': 10, 'font-size': 14,
            'font-color': 'black', 'line-color': 'black', 'element-color': 'black', 'fill': 'white', 'yes-text': 'T', 'no-text': 'F', 'continue -text':'', 'arrow-end': 'block', 'scale': 1,
            'symbols': {'end': {'font-color': 'green'},}, 'flowstate' : {'green' : { 'fill' : 'green', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' }}
        });
        //$('#output').html(code);

    });
});