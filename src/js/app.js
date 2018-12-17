import $ from 'jquery';
import {getSymbolic, parseCode, setCodeToParse, setArguments} from './code-analyzer';
import {dataTypeParser} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let stringUser = $('#codePlaceholder').val();
        let stringUserVector = $('#codePlaceholderArguments').val();
        setArguments(stringUserVector);
        setCodeToParse(stringUser);
        let parsedCode = parseCode(stringUser);
        dataTypeParser(parsedCode.body);
        let arr = getSymbolic().split('\n');
        let out = '';
        for(let i=0;i<arr.length;i++){
            out += '<p> '+arr[i]+ '</p>';
        }
        $('#output').html(out);
    });
});