/*
 * Calc plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';


    $(document).ready(function() {

        var terms = {
            'ja': {
                'calc_plugin_label': '計算式の設定',
                'calc_plugin_description_1': '計算フィールドを指定て計算式を入力し、発火項目を指定すると、' +
                '発火項目の値が変更されたタイミングで計算を行い、計算結果を計算フィールドに出力します。',
                'calc_plugin_description_2': '入力できる式はeval()関数が扱えるものです。フィールドが含まれている場合、## ##で括って下さい。',
                'calc_plugin_description_3':'例、フィールドAとフィールドBを掛け算して小数点以下第2位を四捨五入したい場合：',
                'calc_plugin_description_4':'Math.Round(##Aフィールドコード##*##Bフィールドコード##*100)/100',
                'calc_object_field': '計算フィールド',
                'calc_expression': '計算式',
                'calc_event_field': '発火項目',
                'calc_submit': '保存',
                'calc_cancel': 'キャンセル',
                'calc_disable_field': '編集可否',
                'calc_disable_checkbox': '編集不可にする'
            },
            'en': {
                'calc_plugin_label': 'Formula Settings',
                'calc_plugin_description_1': 'Select To be Calculated field, enter a formula for this field,then select Trigger field.' +
                'Any change in Trigger field triggers the execution of the formula' +
                'and the result is displayed in To be Calculated field.',
                'calc_plugin_description_2': 'Any valid expression for EVAL() function maybe used as a formula.' +
                'Please use ## ## to denote any field code in the formula.',
                'calc_plugin_description_3': 'For example, to display the product of field A and field B rounded to 2 decimal,',
                'calc_plugin_description_4': 'Math.Round(##field code A##*##field code B##*100)/100',
                'calc_object_field': 'To be Calculated',
                'calc_expression': 'Formula',
                'calc_event_field': 'Trigger',
                'calc_submit': 'Save',
                'calc_cancel': 'Cancel',
                'calc_disable_field': 'Editability',
                'calc_disable_checkbox': 'Disable'
            },
            'zh': {
                'calc_plugin_label': '设置计算公式',
                'calc_plugin_description_1': '选择[计算字段]，并输入公式，然后选择事件触发字段。当字段的值发生更改时，即触发事件，' +
                '根据计算公式进行计算，并将计算结果显示在[计算字段]上。',
                'calc_plugin_description_2': '可输入eval()函数可处理的公式。计算公式包含字段代码时，用## ##括起来。',
                'calc_plugin_description_3':'比如，要计算"A字段"乘以"B字段"并四舍五入仅保留两位数时：',
                'calc_plugin_description_4':'Math.Round(##A字段代码##*##B字段代码##*100)/100',
                'calc_object_field': '计算字段',
                'calc_expression': '计算公式',
                'calc_event_field': '事件触发字段',
                'calc_submit': '保存',
                'calc_cancel': '取消',
                'calc_disable_field': '编辑可否',
                'calc_disable_checkbox': '设为不可编辑'
            }
        };

        // To switch the display by the login user's language
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];
        var configHtml = $('#calc-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#calc-plugin').html(tmpl.render({'terms': i18n}));


        // escape fields value
        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
        }


        function checkRowNumberOutTable() {
            var rowNum_out = $('#out-table').prop('rows').length;
            if (rowNum_out === 1) {
                $('#out-table > tr .remove-out').eq(0).hide();
            } else {
                $('#out-table > tr .remove-out').show();
            }
        }


        function checkRowNumberInTable() {
            var rowNum_out = $('#out-table').prop('rows').length;
            for (var e = 0; e < rowNum_out; e++) {
                var rowNum_in = $('#out-table > tr:eq(' + e + ') #in-table > tr').length;
                if (rowNum_in === 1) {
                    $('#out-table > tr:eq(' + e + ') #in-table > tr:eq(0) .remove-in').hide();
                } else {
                    $('#out-table > tr:eq(' + e + ') .remove-in').show();
                }
            }
        }


        function resizeText(target) {

            if (target.scrollHeight > target.offsetHeight) {
                $(target).height(target.scrollHeight);
            } else {
                var lineHeight = Number($(target).css('lineHeight').split('px')[0]);
                while (target.scrollHeight < target.offsetHeight) {
                    $(target).height($(target).height() - lineHeight);
                    if (target.scrollHeight > target.offsetHeight) {
                        $(target).height(target.scrollHeight);
                    }
                    break;
                }
            }
        }


        function setTableDefault() {
            var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
            if (!conf.CalcInfo) {
                return;
            }
            var CALCINFO = JSON.parse(conf.CalcInfo);

            // insert rows
            for (var r = 0; r < CALCINFO.length - 1; r++) {
                // out
                var rowClone = $('.out-tr').eq(0).clone();
                // delete existed setting
                rowClone.find('input.checkbox').prop('checked', false);
                rowClone.find('input.expression').val('');
                while (rowClone.find('tr.in-tr').length > 1) {
                   rowClone.find('tr.in-tr').last().remove();
                }
                $('.out-tr:eq(' + r + ')').after(rowClone);
            }

            // set value
            for (var j = 0; j < CALCINFO.length; j++) {

                // in
                for (var n = 0; n < Object.keys(CALCINFO[j].inTable).length - 1; n++) {
                    $('.out-tr').eq(j).find('.in-tr:eq(0)').clone(true).insertAfter(
                        $('.out-tr').eq(j).find('.in-tr:eq(' + n + ')')
                    );
                }

                // in
                var rowNum_in = Object.keys(CALCINFO[j].inTable).length;
                for (var m = 0; m < rowNum_in; m++) {

                    // set field value of in-table
                    var rowElem = $('.out-tr').eq(j).find('.in-tr:eq(' + m + ')');
                    rowElem.find('.object').val(CALCINFO[j].inTable[m][0]);
                    rowElem.find('.expression').val(CALCINFO[j].inTable[m][2]);
                    if (CALCINFO[j].inTable[m][1]) {
                        rowElem.find('.checkbox').prop('checked', true);
                    } else {
                        rowElem.find('.checkbox').prop('checked', false);
                    }

                    // resize textarea
                    var target = $('tr.out-tr').eq(j).find('tr.in-tr:eq(' + m + ') .expression');
                    resizeText(target[0]);
                }

                // out
                var optionElem = $('.out-tr').eq(j).find('.eventField option');
                for (var key in CALCINFO[j].eventField) {
                    if (!CALCINFO[j].eventField.hasOwnProperty(key)) {continue; }

                    for (var k = 0; k < optionElem .length; k++) {
                        if (CALCINFO[j].eventField[key] === optionElem [k].value) {
                            optionElem [k].selected = true;
                        }
                    }
                }

            }
            checkRowNumberOutTable();
            checkRowNumberInTable();
        }


        function setDropDown(resp) {

            var fields = [];
            var normalFields = resp.properties;
            fields.push(normalFields);
            var tableFieldCode = [];

            for (var fieldKey in normalFields) {
                // Save normal-field and table-field to 'fields' object
                if (!normalFields.hasOwnProperty(fieldKey)) {continue; }
                var prop = normalFields[fieldKey];
                if (prop.type === 'SUBTABLE') {
                    var fieldsInTable = normalFields[fieldKey].fields;
                    fields.push(fieldsInTable);
                    tableFieldCode.push(prop.code);
                }
            }

            // Create option and set to dropdown
            var $option = $('<option>');
            for (var b = 0; b < fields.length; b++) {
                for (var key in fields[b]) {
                    if (!fields[b].hasOwnProperty(key)) {continue; }
                    var pr = fields[b][key];
                    switch (pr['type']) {
                        case 'SINGLE_LINE_TEXT':
                        case 'NUMBER':
                        case 'MULTI_LINE_TEXT':
                        case 'RICH_TEXT':
                        case 'CHECK_BOX':
                        case 'RADIO_BUTTON':
                        case 'DROP_DOWN':
                        case 'MULTI_SELECT':
                        case 'LINK':
                        case 'DATE':
                        case 'TIME':
                        case 'DATETIME':
                        case 'USER_SELECT':
                        case 'GROUP_SELECT':
                        case 'ORGANIZATION_SELECT':
                            $option.attr('value', escapeHtml(pr.code));
                            $option.text(escapeHtml(pr.label));
                            if (b > 0) {
                                $option.attr('name', escapeHtml(tableFieldCode[b - 1]));
                            }
                            $('#out-table > tr:eq(0) #in-table > tr:eq(0) .object')
                                .append($option.clone());
                            $('#out-table > tr:eq(0) .eventField')
                                .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }

            setTableDefault();
        }


        function setTableButtonAction() {
            $('#out-table').on('click', '.kintoneplugin-table-td-operation > button', function() {
                var elementAction = $(this);
                var rowContain = elementAction.parent().parent();

                if (elementAction.hasClass('add')) {
                    var rowClone = rowContain.clone();

                    // delete existed setting
                    rowClone.find('select.eventField').val('');
                    rowClone.find('input.checkbox').prop('checked', false);
                    rowClone.find('textarea.expression').val('');
                    while (rowClone.find('tr.in-tr').length > 1) {
                        rowClone.find('tr.in-tr').last().remove();
                    }

                    // add row
                    rowContain.after(rowClone);
                    rowContain.next().hide().fadeIn(500);

                    checkRowNumberOutTable();
                    checkRowNumberInTable();
                    return;
                }

                if (rowContain.parent().prop('rows').length === 1) {
                    return;
                }

                rowContain.remove();
                if (elementAction.hasClass('remove-in')) {
                    checkRowNumberInTable();
                }
                if (elementAction.hasClass('remove-out')) {
                    checkRowNumberOutTable();
                }
            });
        }


        function createErrorMessage(type, errorNum, rowNum_out) {
            var user_lang = kintone.getLoginUser().language;
            var error_messages = {
                'ja': {
                    'row_data': {
                        '1': rowNum_out + '行目に計算フィールドを指定していない行があります。',
                        '2': rowNum_out + '行目に計算式を入力していない行があります。',
                        '3': rowNum_out + '行目の発火項目を指定してください'
                    }
                },
                'en': {
                    'row_data': {
                        '1': 'To be Calculated field has not been selected on line' + rowNum_out,
                        '2': 'Formula field has not been entered on line' + rowNum_out,
                        '3': 'Trigger field has not been selected on line' + rowNum_out
                    }
                },
                'zh': {
                    'row_data': {
                        '1': '第' + rowNum_out + '行有计算字段未指定。',
                        '2': '第' + rowNum_out + '行有计算公式未输入。',
                        '3': '第' + rowNum_out + '行的事件字段未指定。'
                    }
                }
            };
            return error_messages[user_lang][type][errorNum];
        }


        function checkConfigValue(config) {

            var row_data = JSON.parse(config.CalcInfo);
            for (var y = 0; y < row_data.length; y++) {
                var eventField_length = row_data[y].eventField.length;

                for (var k = 0; k < Object.keys(row_data[y].inTable).length; k++) {
                    var CalcField = row_data[y].inTable[k][0];
                    var ex = row_data[y].inTable[k][2];

                    if (CalcField === '') {
                        throw new Error(createErrorMessage('row_data', '1', y + 1));
                    }

                    if (CalcField !== '' && eventField_length !== 0 && ex === '') {
                        throw new Error(createErrorMessage('row_data', '2', y + 1));
                    }
                    if (CalcField !== '' && eventField_length === 0 && ex !== '') {
                        throw new Error(createErrorMessage('row_data', '3', y + 1));
                    }
                }
            }
        }


        function loopEventField(f) {
            var eventFields = [];
            $('tr.out-tr').eq(f).find('.eventField option:selected').each(function() {
                eventFields.push($(this).val());
            });
            return eventFields;
        }


        function setConfig() {
            var config = {};
            var CalcInfo = [];
            var tableFieldCode = [];
            var rowNum_out = $('#out-table').prop('rows').length;

            for (var f = 0; f < rowNum_out; f++) {
                CalcInfo[f] = {};
                var eventField = loopEventField(f);
                CalcInfo[f].eventField = eventField;
                CalcInfo[f].inTable = {};

                for (var h = 0; h < $('table.in-table').eq(f).prop('rows').length; h++) {
                    CalcInfo[f].inTable[h] = [];
                    var objectField = $('tr.out-tr').eq(f).find('select.object');
                    var checkboxField = $('tr.out-tr').eq(f).find('input.checkbox');
                    var expression = $('tr.out-tr').eq(f).find('textarea.expression');

                    CalcInfo[f].inTable[h].push(objectField.eq(h).val());
                    CalcInfo[f].inTable[h].push(checkboxField.eq(h).prop('checked'));
                    CalcInfo[f].inTable[h].push(expression.eq(h).val());

                    var tableCode = objectField.eq(h).find('option:selected').attr('name');
                    var EleCheck = $.inArray(tableCode, tableFieldCode);
                    if (tableCode !== undefined && EleCheck !== 0) {
                        tableFieldCode.push(tableCode);
                    }
                }
            }

            config.CalcInfo = JSON.stringify(CalcInfo);
            config.tableFieldCode = JSON.stringify(tableFieldCode);
            return config;
        }


        // resize when input
        $(document).on('input', '.expression', function(evt) {
            var target = evt.target;
            resizeText(target);
        });


        kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {
            app: kintone.app.getId()
        }, function(resp) {
            setDropDown(resp);
        });

        //  click Save
        $('#kintoneplugin-submit').click(function() {
            try {
                var config = setConfig();
                checkConfigValue(config);
                kintone.plugin.app.setConfig(config);
            } catch (error) {
                alert(error.message);
            }

        });


        // click Cancel
        $('#kintoneplugin-cancel').click(function() {
            history.back();
        });

        setTableButtonAction();

    });
})(jQuery, kintone.$PLUGIN_ID);
