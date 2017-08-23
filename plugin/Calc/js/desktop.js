/*
 * Calc plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */

/* global kintone*/

jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';

    // To HTML escape
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&quot;')
            .replace(/'/g, '&#39;');
    }


    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!conf) {return false; }
    var CALCINFO = JSON.parse(conf.CalcInfo);
    var TABLECODE = JSON.parse(conf.tableFieldCode);


    function checkFieldInTableOrOut(record, fieldcode) {

        // get table code and fields
        var tableInfo = {};
        tableInfo.fields = [];
        tableInfo.tableCode = [];
        for (var fieldKey in record) {
            var fieldProp = record[fieldKey];
            if (fieldProp['type'] === 'SUBTABLE') {
                tableInfo.fields.push(fieldProp['value'][0]['value']);
                tableInfo.tableCode.push(fieldKey);
            }
        }

        // check field is in table or not
        var length = Object.keys(tableInfo.tableCode).length;
        var checkResult = {};
        checkResult.InOutFlag = '';
        checkResult.tableCode = '';
        for (var c = 0; c < length; c++) {
            for (var k in tableInfo.fields[c]) {
                // if (!tableInf.fields[c].hasOwnProperty[k]) {continue; }

                if (k === fieldcode) {
                    checkResult.InOutFlag = 'true';
                    checkResult.tableCode = tableInfo.tableCode[c];
                }
            }
        }
        return (checkResult);
    }


    function disableField(record) {


        for (var a = 0; a < CALCINFO.length; a++) {
            var rows_in = Object.keys(CALCINFO[a].inTable).length;

            for (var b = 0; b < rows_in; b++) {
                var fieldCode = escapeHtml(CALCINFO[a].inTable[b][0]);
                var checkboxFlag = CALCINFO[a].inTable[b][1];

                var tablecheckResult = checkFieldInTableOrOut(record, fieldCode);
                if (!checkboxFlag) {continue; }
                if (!tablecheckResult.InOutFlag) {
                    record[fieldCode].disabled = true;
                } else {
                    var rows = record[tablecheckResult.tableCode].value.length;
                    for (var c = 0; c < rows; c++) {
                        record[tablecheckResult.tableCode].value[c].value[fieldCode].disabled = true;
                    }
                }

            }
        }
    }


    function setChangeEventfordisable() {

        // set change events
        var changeEvents = [];
        var create_change_event = 'app.record.create.change.';
        var edit_change_event = 'app.record.edit.change.';

        for (var n = 0; n < TABLECODE.length; n++) {

            changeEvents.push(create_change_event + escapeHtml(TABLECODE[n]));
            changeEvents.push(edit_change_event + escapeHtml(TABLECODE[n]));
        }

        return changeEvents;
    }


    // disable when show_event fire
    var showEvent = ['app.record.index.edit.show',
        'app.record.create.show',
        'app.record.edit.show'];

    kintone.events.on(showEvent, function(event) {
        var record = event.record;
        disableField(record);
        return event;
    });

    // disable when table_change_event fire
    var ChangeEvent = setChangeEventfordisable();
    kintone.events.on(ChangeEvent, function(event) {
        var record = event.record;
        disableField(record);

        return event;
    });


    // there have table-field and normal-field in expression
    function calculatePattern1(record, ex, exFields, calcField, tableCode) {

        // loop each row of table
        for (var rows = 0; rows < record[tableCode].value.length; rows++) {
            var calExp = '';

            // loop each field of expression
            for (var k = 0; k < exFields.length; k++) {
                var filedCode = exFields[k].replace(/#/g, '');
                var exField = exFields[k];

                // loop each field of kintone normal-field
                if (record.hasOwnProperty(filedCode)) {
                    var fieldVal = record[filedCode].value;
                    if (calExp === '') {
                        calExp = ex.replace(exField, fieldVal);
                    } else {
                        calExp = calExp.replace(exField, fieldVal);
                    }
                }

                // loop each field of kintone table
                var TableFileds = record[tableCode].value[rows].value;
                if (TableFileds.hasOwnProperty(filedCode)) {
                    var tableFieldVal = TableFileds[filedCode].value;
                    if (calExp === '') {
                        calExp = ex.replace(exField, tableFieldVal);
                    } else {
                        calExp = calExp.replace(exField, tableFieldVal);
                    }
                }

            }

            // check calcField is table-field or not
            var checkCalcField = checkFieldInTableOrOut(record, calcField);
            if (checkCalcField.InOutFlag === 'true') {
                record[tableCode].value[rows].value[calcField].value = eval(calExp);
            } else {
                record[calcField].value = eval(calExp);
            }
        }
    }


    // only have table-field in expression
    function calculatePattern2(event, ex, exFields, calcField) {

        var rowFields = event.changes.row.value;
        var calExp = '';

        for (var k = 0; k < exFields.length; k++) {
            var filedCode = exFields[k].replace(/#/g, '');
            var exField = exFields[k];

            if (event.record.hasOwnProperty(filedCode)) {
                var fieldVal = event.record[filedCode].value;

                if (calExp === '') {
                    calExp = ex.replace(exField, fieldVal);
                } else {
                    calExp = calExp.replace(exField, fieldVal);
                }
            }

            if (rowFields.hasOwnProperty(filedCode)) {
                var tableFieldVal = rowFields[filedCode].value;

                if (calExp === '') {
                    calExp = ex.replace(exField, tableFieldVal);
                } else {
                    calExp = calExp.replace(exField, tableFieldVal);
                }
            }
        }

        var checkCalcField = checkFieldInTableOrOut(event.record, calcField);
        if (checkCalcField.InOutFlag === 'true') {
            rowFields[calcField].value = eval(calExp);
        } else {
            event.record[calcField].value = eval(calExp);
        }

    }


    // only have normal-field in expression
    function calculatePattern3(record, ex, exFields, calcField) {

        var calExp = '';
        for (var k = 0; k < exFields.length; k++) {
            var filedCode = exFields[k].replace(/#/g, '');
            var exField = exFields[k];

            // 通常フィールドの値を計算式に入れ替える
            if (record.hasOwnProperty(filedCode)) {
                var fieldVal = record[filedCode].value;
                if (calExp === '') {
                    calExp = ex.replace(exField, fieldVal);
                } else {
                    calExp = calExp.replace(exField, fieldVal);
                }
            }
        }
        record[calcField].value = eval(calExp);
    }


    function calculatePattern4(event, ex, calcField) {

        // calc_Field in table,and change_event_field not in table
        var checkCalcField = checkFieldInTableOrOut(event.record, calcField);
        if (checkCalcField.InOutFlag === 'true' && event.changes.row === null) {
            for (var i = 0; i < event.record[checkCalcField.tableCode].value.length; i++) {
                event.record[checkCalcField.tableCode].value[i].value[calcField].value = eval(ex);
            }
        }

        // calc_Field and change_event_field are all in table
        if (checkCalcField.InOutFlag === 'true' && event.changes.row !== null) {
            var rowFields = event.changes.row.value;
            rowFields[calcField].value = eval(ex);
        }

        // calc_Field in table
        if (checkCalcField.InOutFlag !== 'true') {
            event.record[calcField].value = eval(ex);
        }
    }


    function calc(event) {
        var record = event.record;

        for (var f = 0; f < CALCINFO.length; f++) {
            for (var g = 0; g < Object.keys(CALCINFO[f].inTable).length; g++) {

                // get fields from expression
                var calcField = escapeHtml(CALCINFO[f].inTable[g][0]);
                var ex = CALCINFO[f].inTable[g][2];
                // var reg = /\[[^\]]+\]/g;
                var reg = /##[^#]+##/g;
                var exFields = [];
                var m;
                while ((m = reg.exec(ex)) !== null) {
                    exFields.push(m[0]);
                }

                // if expression not includes fields;
                if (exFields.length === 0) {
                    calculatePattern4(event, ex, calcField);
                    continue;
                }

                // if expression  includes fields;
                var tableCode = '';
                for (var j = 0; j < exFields.length; j++) {
                    var fieldcode = exFields[j].replace(/#/g, '');
                    var result = checkFieldInTableOrOut(record, fieldcode);
                    if (result.tableCode) {
                        tableCode = result.tableCode;
                        break;
                    }
                }

                if (event.changes.row === null && tableCode !== '') {
                    calculatePattern1(record, ex, exFields, calcField, tableCode);
                } else if (event.changes.row !== null && tableCode !== '') {
                    calculatePattern2(event, ex, exFields, calcField);
                } else if (event.changes.row === null && tableCode === '') {
                    calculatePattern3(record, ex, exFields, calcField);
                }
            }
        }
    }


    function setEvent() {

        // set change events
        var events = [];
        var create_change_event = 'app.record.create.change.';
        var edit_change_event = 'app.record.edit.change.';
        var index_change_event = 'app.record.index.edit.change.';

        for (var d = 0; d < CALCINFO.length; d++) {

            for (var e = 0; e < CALCINFO[d].eventField.length; e++) {
                events.push(create_change_event + escapeHtml(CALCINFO[d].eventField[e]));
                events.push(edit_change_event + escapeHtml(CALCINFO[d].eventField[e]));
                events.push(index_change_event + escapeHtml(CALCINFO[d].eventField[e]));
            }
        }

        return events;
    }


    // event handler
    var changeEvents = setEvent();
    kintone.events.on(changeEvents, function(event) {
        calc(event);
        return event;
    });

})(jQuery, kintone.$PLUGIN_ID);
