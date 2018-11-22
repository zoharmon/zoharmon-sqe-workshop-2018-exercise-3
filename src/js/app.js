import $ from 'jquery';
import {parseCode, recordsTable, setCodeToParse} from './code-analyzer';
import {dataTypeParser} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let stringUser = $('#codePlaceholder').val();
        setCodeToParse(stringUser);
        let parsedCode = parseCode(stringUser);
        dataTypeParser(parsedCode.body);
        let row = '';
        for(let i = 0; i<recordsTable.length; i++){
            row += '<tr>';
            row += '<td>'+ recordsTable[i].line + '</td>';
            row += '<td>'+ recordsTable[i].type + '</td>';
            row += '<td>'+ recordsTable[i].name + '</td>';
            row += '<td>'+ recordsTable[i].condition + '</td>';
            row += '<td>'+ recordsTable[i].value + '</td>';
            row += '</tr>';
        }
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        $('#parseTable').append(row);
    });
});