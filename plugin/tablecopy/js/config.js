jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";



    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
    var ENABLE_ROW_NUM = Number(conf["enable_row_number"]);
    var TABLE_ROW_NUM = Number(conf["table_row_number"]);

    for (var r = 1; r < ENABLE_ROW_NUM + 1; r++) {
        conf["enablefield_row" + r] = JSON.parse(conf["enablefield_row" + r]);
    }

    for (var k = 1; k < TABLE_ROW_NUM + 1; k++) {
        conf["table_row" + k] = JSON.parse(conf["table_row" + k]);
    }

    $(document).ready(function() {

            var terms = {
                'ja': {
                    'tc_lookup_label': 'lookupフィールド指定',
                    'tc_disable_label': 'lookupコピー先フィールドの編集可否の設定',
                    'tc_disable_description': 'lookup設定画面の「ほかのフィールドのコピー」で指定したコピー先フィールドを編集可にします。',
                    'tc_disable_field_title': 'フィールドコード',
                    'tc_disable_checkbox_title': '編集可にする',
                    'tc_disable_checkbox_text': '編集可にする',
                    'tc_tablefield_label': 'コピー元テーブルとコピー先テーブルの指定',
                    'tc_tablefield_from_title': 'コピー元テーブル',
                    'tc_tablefield_to_title': 'コピー先テーブル',
                    'tc_copyfield_label': 'コピーするテーブルフィールドの指定',
                    'tc_copyfield_description': 'コピー元テーブルとコピー先テーブルから、コピーしたいフィールドを指定してください。',
                    'tc_copyfield_from_title': 'コピー元フィールド',
                    'tc_copyfield_to_title': 'コピー先フィールド',
                    'tc_submit': '保存',
                    'tc_cancel': 'キャンセル',
                    'tc_message': '必須項目です',
                    'tc_caution': '選択肢を変えるたびに、以下に一部の項目の設定が消えますのでご注意ください！'
                },
                'en': {
                    'tc_lookup_label': 'Select lookup field',
                    'tc_disable_label': 'Enable field',
                    'tc_disable_description':
                    'Seleted Mapping_Field that you want to set enable.',
                    'tc_disable_field_title': 'field',
                    'tc_disable_checkbox_title': 'Enable fields',
                    'tc_disable_checkbox_text': 'Enable fields',
                    'tc_tablefield_label': 'Copy to which table',
                    'tc_tablefield_from_title': 'From',
                    'tc_tablefield_to_title': 'To',
                    'tc_copyfield_label': 'Copy from  which Table',
                    'tc_copyfield_description': 'Select which field to copy。',
                    'tc_copyfield_from_title': 'From',
                    'tc_copyfield_to_title': 'To',
                    'tc_submit': 'Save',
                    'tc_cancel': 'Cancel',
                    'tc_message': 'Must select!',
                    'tc_caution': 'When option is changed,next setting will be cleared！'
                },
                'zh': {
                    'tc_lookup_label': '选择lookup字段',
                    'tc_disable_label': '设置复制目标字段编辑可否',
                    'tc_disable_description': '请选择lookup设置页面的“其他要复制的字段”中设置的复制目标字段的字段代码',
                    'tc_disable_field_title': '字段代码',
                    'tc_disable_checkbox_title': '设为可编辑',
                    'tc_disable_checkbox_text': '设为可编辑',
                    'tc_tablefield_label': '选择要从哪个表格复制到哪个表格',
                    'tc_tablefield_from_title': '复制来源表格',
                    'tc_tablefield_to_title': '复制目标表格',
                    'tc_copyfield_label': '设置要复制的字段',
                    'tc_copyfield_description': '分别指定要从哪个字段复制到哪个字段。',
                    'tc_copyfield_from_title': '复制来源字段',
                    'tc_copyfield_to_title': '复制目标字段',
                    'tc_submit': '保存',
                    'tc_cancel': '取消',
                    'tc_message': '不能为空',
                    'tc_caution': '请注意！当更改选项时，下面的部分设置将被清除。'
                }
            };

            // To switch the display by the login user's language (English display in the case of Chinese)
            var lang = kintone.getLoginUser().language;
            var i18n = (lang in terms) ? terms[lang] : terms['en'];
            var configHtml = $('#tc-plugin').html();
            var tmpl = $.templates(configHtml);
            $('div#tc-plugin').html(tmpl.render({'terms': i18n}));


            // escape fields vale
            function escapeHtml(htmlstr) {
                return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            }


            function checkRowNumber() {
                if ($("#tc-plugin-enablefield-tbody > tr").length === 2) {
                    $("#tc-plugin-enablefield-tbody > tr .removeList").eq(1).hide();
                } else {
                    $("#tc-plugin-enablefield-tbody > tr .removeList").eq(1).show();
                }

                if ($("#tc-plugin-copyfield-tbody > tr").length === 2) {
                    $("#tc-plugin-copyfield-tbody > tr .removeList").eq(1).hide();
                } else {
                    $("#tc-plugin-copyfield-tbody > tr .removeList").eq(1).show();
                }
            }


            function setEnableTableDefault() {
                for (var tn = 1; tn <= ENABLE_ROW_NUM; tn++) {
                    $("#tc-plugin-enablefield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-enablefield-tbody > tr").eq(tn - 1)
                    );
                    $("#tc-plugin-enablefield-tbody > tr:eq(" + tn + ") .tc-plugin-column1")
                    .val(conf["enablefield_row" + tn]['column1']);

                    if (conf["enablefield_row" + tn]['column2'] === true) {
                        $("#tc-plugin-enablefield-tbody > tr:eq(" + tn + ") .tc-plugin-column2")
                        .prop("checked", true);
                    } else {
                        $("#tc-plugin-enablefield-tbody > tr:eq(" + tn + ") .tc-plugin-column2")
                        .prop("checked", false);
                    }
                }
            }


            function setCopyFieldTableDefault() {
                for (var ti = 1; ti <= TABLE_ROW_NUM; ti++) {
                    $("#tc-plugin-copyfield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-copyfield-tbody > tr").eq(ti - 1)
                    );
                    $("#tc-plugin-copyfield-tbody > tr:eq(" + ti + ") .tc-plugin-column1")
                    .val(conf["table_row" + ti]['column1']);
                    $("#tc-plugin-copyfield-tbody > tr:eq(" + ti + ") .tc-plugin-column2")
                    .val(conf["table_row" + ti]['column2']);
                }
            }



            function setDefault() {
                $('.lookupField').val(conf["lookupField"]);
                $('.copyFromTable').val(conf["copyFromTable"]);
                $('.copyToTable').val(conf["copyToTable"]);

                if (ENABLE_ROW_NUM > 0) {
                    setEnableTableDefault();
                } else {
                    $("#tc-plugin-enablefield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-enablefield-tbody > tr")).eq(0);
                }

                if (TABLE_ROW_NUM > 0) {
                    setCopyFieldTableDefault();
                } else {
                    $("#tc-plugin-copyfield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-copyfield-tbody > tr")).eq(0);
                }
                checkRowNumber();
            }



            function setLookupFieldDefault(resp) {
                var fields = resp['properties'];
                var $option = $("<option>");
                for (var key in fields) {
                    if (!fields.hasOwnProperty(key)) {continue; }
                    var prop = fields[key];

                    // lookup Field
                    if (fields[key].hasOwnProperty("lookup")) {
                        $option.attr("value", escapeHtml(prop.code));
                        $option.text(escapeHtml(prop.label));
                        $('.lookupField').append($option.clone());
                    }
                }
            }

            function setCopyToTableDefault(resp) {
                var fields = resp['properties'];
                var $option = $("<option>");
                for (var key in fields) {
                    if (!fields.hasOwnProperty(key)) {continue; }
                    var prop = fields[key];
                    switch (prop['type']) {
                    // current Table
                        case "SUBTABLE":
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.code));
                            $('.copyToTable').append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }


            function setCopyToFieldDefault(resp) {
                var $option = $("<option>");
                if (conf['copyToTable']) {
                    var currentTable = conf['copyToTable'];
                    var currentTableFields = resp.properties[currentTable].fields;
                    for (var ct in currentTableFields) {
                        if (!currentTableFields.hasOwnProperty(ct)) {continue; }
                        var p = currentTableFields[ct];
                        switch (p['type']) {
                            case "SINGLE_LINE_TEXT":
                            case "NUMBER":
                            case "MULTI_LINE_TEXT":
                            case "RICH_TEXT":
                            case "CHECK_BOX":
                            case "RADIO_BUTTON":
                            case "DROP_DOWN":
                            case "MULTI_SELECT":
                            case "LINK":
                            case "DATE":
                            case "TIME":
                            case "DATETIME":
                            case "USER_SELECT":
                            case "GROUP_SELECT":
                            case "ORGANIZATION_SELECT":
                                $option.attr("value", escapeHtml(p.code));
                                $option.attr("name", escapeHtml(p.type));
                                $option.text(escapeHtml(p.label));
                                $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column2')
                                .append($option.clone());
                                break;
                            default:
                                break;
                        }
                    }
                }
            }


            function setMappingFieldDefult(resp) {
                var lookup_field = conf["lookupField"];
                var lookupMappingFields = resp.properties[lookup_field].lookup.fieldMappings;
                for (var MappingKey in lookupMappingFields) {
                    if (!lookupMappingFields.hasOwnProperty(MappingKey)) {continue; }
                    var prop = lookupMappingFields[MappingKey];
                    var $option = $("<option>");
                    if (prop.field !== "relatedRecNo") {
                        $option.attr("value", escapeHtml(prop.field));
                        $option.text(escapeHtml(prop.field));
                        $('#tc-plugin-enablefield-tbody > tr:eq(0) .tc-plugin-column1')
                        .append($option.clone());
                        $('#tc-plugin-enablefield-tbody > tr:eq(1) .tc-plugin-column1')
                        .append($option.clone());
                    }
                }
            }


            function setCopyFromTableDefault(res) {
                var relatedFields = res['properties'];
                var $option = $("<option>");
                for (var rk in relatedFields) {
                    if (!relatedFields.hasOwnProperty(rk)) {continue; }
                    var pr = relatedFields[rk];
                    switch (pr['type']) {
                        case "SUBTABLE":
                            $option.attr("value", escapeHtml(pr.code));
                            $option.text(escapeHtml(pr.code));
                            $('.copyFromTable').append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }


            function setCopyFromFieldDefault(res) {
                var from_Table = conf["copyFromTable"];
                var copyFromFields = res.properties[from_Table].fields;
                for (var from_key in copyFromFields) {
                    if (!copyFromFields.hasOwnProperty(from_key)) {continue; }
                    var copyFromProp = copyFromFields[from_key];
                    var $option = $("<option>");
                    switch (copyFromProp['type']) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "RICH_TEXT":
                        case "CHECK_BOX":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "MULTI_SELECT":
                        case "LINK":
                        case "DATE":
                        case "TIME":
                        case "DATETIME":
                        case "USER_SELECT":
                        case "GROUP_SELECT":
                        case "ORGANIZATION_SELECT":
                            $option.attr("value", escapeHtml(copyFromProp.code));
                            $option.attr("name", escapeHtml(copyFromProp.type));
                            $option.text(escapeHtml(copyFromProp.label));
                            $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1')
                            .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }


            //Set dropdown default
            var thisAppId = kintone.app.getId();
            kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {'app': thisAppId},
            function(resp) {
                setLookupFieldDefault(resp);
                setCopyToTableDefault(resp);
                setCopyToFieldDefault(resp);

                if (!conf["lookupField"]) {
                    setDefault();
                    return;
                }

                setMappingFieldDefult(resp);
                var lookup_field = conf["lookupField"];
                var relateAppId = resp.properties[lookup_field].lookup.relatedApp.app;
                kintone.api('/k/v1/preview/app/form/fields', 'GET', {'app': relateAppId},
                 function(res) {
                    setCopyFromTableDefault(res);
                    setCopyFromFieldDefault(res);
                    setDefault();
                });
            });


            function alertshow(elmParent) {
                $(elmParent).parent().find('.kintoneplugin-alert').css({'display': 'block'});
                return;
            }


            function alerthide(elmParent) {
                $(elmParent).parent().find('.kintoneplugin-alert').css({'display': 'none'});
            }

            function dataClear_CopyToTableChanged() {
                var rowNumber = $("#tc-plugin-copyfield-tbody").find("tr").length;
                if (rowNumber > 2) {
                    $('#tc-plugin-copyfield-tbody > tr:gt(1)').remove();
                }
                $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column2 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column2 > option:gt(0)').remove();
                checkRowNumber();
            }


            function setDropdown_CopyToTableChanged(resp) {
                var currentTable = $('.copyToTable').val();
                var currentTableFields = resp.properties[currentTable].fields;
                var $option = $("<option>");
                for (var tf in currentTableFields) {
                    if (!currentTableFields.hasOwnProperty(tf)) {continue; }
                    var p = currentTableFields[tf];
                    switch (p['type']) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "RICH_TEXT":
                        case "CHECK_BOX":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "MULTI_SELECT":
                        case "LINK":
                        case "DATE":
                        case "TIME":
                        case "DATETIME":
                        case "USER_SELECT":
                        case "GROUP_SELECT":
                        case "ORGANIZATION_SELECT":
                            $option.attr("value", escapeHtml(p.code));
                            $option.attr("name", escapeHtml(p.type));
                            $option.text(escapeHtml(p.label));
                            $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column2')
                            .append($option.clone());
                            $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column2')
                           .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }

            function dataClear_lookupFieldChanged() {
                var rownum_enable = $("#tc-plugin-enablefield-tbody").find("tr").length;
                var rownum_table = $("#tc-plugin-copyfield-tbody").find("tr").length;
                // delete existed table data
                if (rownum_enable > 2) {
                    $('#tc-plugin-enablefield-tbody > tr:gt(1)').remove();
                }
                if (rownum_table > 2) {
                    $('#tc-plugin-copyfield-tbody > tr:gt(1)').remove();
                }
                $('#tc-plugin-enablefield-tbody > tr:eq(0) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-enablefield-tbody > tr:eq(1) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column1 > option:gt(0)').remove();
                $('.copyFromTable > option:gt(0)').remove();
                checkRowNumber();
            }


            function setMappingField_lookupFieldChanged(resp) {
                var lookupFieldCode = $(".lookupField").val();
                var lookupMappingFields = resp.properties[lookupFieldCode].lookup.fieldMappings;
                for (var MappingKey in lookupMappingFields) {
                    if (!lookupMappingFields.hasOwnProperty(MappingKey)) {continue; }
                    var prop = lookupMappingFields[MappingKey];
                    var $option = $("<option>");
                    if (prop.field !== "relatedRecNo") {
                        $option.attr("value", escapeHtml(prop.field));
                        $option.text(escapeHtml(prop.field));
                        $('#tc-plugin-enablefield-tbody > tr:eq(0) .tc-plugin-column1')
                        .append($option.clone());
                        $('#tc-plugin-enablefield-tbody > tr:eq(1) .tc-plugin-column1')
                        .append($option.clone());
                    }
                }
            }



            function setCopyFromTable_lookupFieldChanged(res) {
                var relatedFields = res['properties'];
                for (var rk in relatedFields) {
                    if (!relatedFields.hasOwnProperty(rk)) {continue; }
                    var p = relatedFields[rk];
                    var $option = $("<option>");
                    switch (p['type']) {
                        case "SUBTABLE":
                            $option.attr("value", escapeHtml(p.code));
                            $option.text(escapeHtml(p.code));
                            $('.copyFromTable').append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }


            function dataClear_copyFromTable() {
                var rowNumber = $("#tc-plugin-copyfield-tbody").find("tr").length;
                if (rowNumber > 2) {
                    $('#tc-plugin-copyfield-tbody > tr:gt(1)').remove();
                }
                $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column1 > option:gt(0)').remove();
                checkRowNumber();
            }



            function setDropdown_CopyFromTableChanged(res) {
                var related_table = $('.copyFromTable').val();
                var copyFromFields = res.properties[related_table].fields;
                for (var key in copyFromFields) {
                    if (!copyFromFields.hasOwnProperty(key)) {continue; }
                    var Prop = copyFromFields[key];
                    var $option = $("<option>");
                    switch (Prop['type']) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "RICH_TEXT":
                        case "CHECK_BOX":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "MULTI_SELECT":
                        case "LINK":
                        case "DATE":
                        case "TIME":
                        case "DATETIME":
                        case "USER_SELECT":
                        case "GROUP_SELECT":
                        case "ORGANIZATION_SELECT":
                            $option.attr("value", escapeHtml(Prop.code));
                            $option.attr("name", escapeHtml(Prop.type));
                            $option.text(escapeHtml(Prop.label));
                            $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1')
                            .append($option.clone());
                            $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column1')
                            .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }



            // change current table
            $('.copyToTable').change(function() {
                var elmParent = $('.copyToTable').parent();
                if ($('.copyToTable').val() === "") {
                    alertshow(elmParent);
                } else {
                    alerthide(elmParent);
                    dataClear_CopyToTableChanged();
                    return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true),
                    'GET', {'app': thisAppId}).then(function(resp) {
                        setDropdown_CopyToTableChanged(resp);
                    });
                }
            });



            // change lookup field
            $(".lookupField").change(function() {
                var elmParent = $('.lookupField').parent();
                var lookupFieldCode = $(".lookupField").val();
                if (lookupFieldCode === "") {
                    alertshow(elmParent);
                } else {
                    alerthide(elmParent);
                    dataClear_lookupFieldChanged();
                    // set related table
                    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {'app': thisAppId},
                    function(resp) {
                        var relateAppId = resp.properties[lookupFieldCode].lookup.relatedApp.app;
                        setMappingField_lookupFieldChanged(resp);
                        // set related table fields
                        return kintone.api('/k/v1/preview/app/form/fields', 'GET', {'app': relateAppId })
                        .then(function(res) {
                            setCopyFromTable_lookupFieldChanged(res);
                        });
                    });
                }
            });



            // change related table
            $('.copyFromTable').change(function() {
                var elmParent = $('.copyFromTable').parent();
                var related_table = $('.copyFromTable').val();
                if (related_table === "") {
                    alertshow(elmParent);
                } else {
                    alerthide(elmParent);
                    dataClear_copyFromTable();
                    // set related fields
                    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {'app': thisAppId},
                    function(resp) {
                        var lookupFieldCode = $(".lookupField").val();
                        var relateAppId = resp.properties[lookupFieldCode].lookup.relatedApp.app;
                        return kintone.api('/k/v1/preview/app/form/fields', 'GET', {'app': relateAppId })
                        .then(function(res) {
                            setDropdown_CopyFromTableChanged(res);
                        });
                    });
                }
            });


            //Add Row
            $("#tc-plugin-enablefield-tbody .addList").click(function() {
                $("#tc-plugin-enablefield-tbody > tr").eq(0).clone(true).insertAfter($(this).parent().parent());
                checkRowNumber();
            });

            $("#tc-plugin-copyfield-tbody .addList").click(function() {
                $("#tc-plugin-copyfield-tbody > tr").eq(0).clone(true).insertAfter($(this).parent().parent());
                checkRowNumber();
            });
            // Remove Row
            $(".removeList").click(function() {
                $(this).parent('td').parent('tr').remove();
                checkRowNumber();
            });



            function createErrorMessage(type, error_num, row_num) {
                var user_lang = kintone.getLoginUser().language;
                var error_messages = {
                    'ja': {
                        'copy_field': {
                            "1": "「コピーするテーブルフィールドの指定」の" + row_num + "行目のコピー先を指定してください。",
                            "2": "「コピーするテーブルフィールドの指定」の" + row_num + "行目のコピー元を指定してください。",
                            "3": "「コピーするテーブルフィールドの指定」の" + row_num + "行目のフィールドタイプが一致していません。指定しなおしてください。",
                            "4": "「コピーするテーブルフィールドの指定」の" + row_num + "行目が何も指定されていません。"
                        },
                        'enable_field': {
                            "1": "「lookupコピー先フィールドの編集可否の設定」の" + row_num + "行目のフィールドは指定してください。",
                            "2": "「lookupコピー先フィールドの編集可否の設定」の" + row_num + "行目のチェックボックスにチェックを入れてください。",
                            "3": "「lookupコピー先フィールドの編集可否の設定」の" + row_num + "行目が何も指定されていません。"
                        }
                    },
                    'en': {
                        'copy_field': {
                            "1": "「コピーするテーブルフィールドの指定」の" + row_num + "行目のコピー先を指定してください。",
                            "2": "「コピーするテーブルフィールドの指定」の" + row_num + "行目のコピー元を指定してください。",
                            "3": "「コピーするテーブルフィールドの指定」の" + row_num + "行目のフィールドタイプが一致していません。指定しなおしてください。",
                            "4": "「コピーするテーブルフィールドの指定」の" + row_num + "行目が何も指定されていません。"
                        },
                        'enable_field': {
                            "1": "「lookupコピー先フィールドの編集可否の設定」の" + row_num + "行目のフィールドは指定してください。",
                            "2": "「lookupコピー先フィールドの編集可否の設定」の" + row_num + "行目のチェックボックスにチェックを入れてください。",
                            "3": "「コピーするテーブルフィールドの指定」の" + row_num + "行目が何も指定されていません。"
                        }
                    },
                    'zh': {
                        'copy_field': {
                            "1": "[设置要复制的字段]的第" + row_num + "行未指定复制目标字段。",
                            "2": "[设置要复制的字段]的第" + row_num + "行未指定复制来源字段。",
                            "3": "[设置要复制的字段]的第" + row_num + "行的字段类型不一致。请重新选择。",
                            "4": "[设置要复制的字段]的第" + row_num + "行未选择任何字段。"
                        },
                        'enable_field': {
                            "1": "[设置复制目标字段编辑可否]的第" + row_num + "行的字段未选择。",
                            "2": "[设置复制目标字段编辑可否]的第" + row_num + "行的复选框未勾选い。",
                            "3": "[设置复制目标字段编辑可否]的第" + row_num + "行未作内容设置。"
                        }
                    }
                };
                return error_messages[user_lang][type][error_num];
            }



            function checkConfigEnablefieldVal(config) {
                var row_num = Number(config["enable_row_number"]);
                for (var ef = 1; ef <= row_num; ef++) {
                    var enable_field = JSON.parse(config['enablefield_row' + ef]);
                    if (enable_field.column1 === "" && enable_field.column2 === true) {
                        throw new Error(createErrorMessage("enable_field", "1", ef));
                    }
                    if (enable_field.column1 !== "" && enable_field.column2 === false) {
                        throw new Error(createErrorMessage("enable_field", "2", ef));
                    }
                    if (enable_field.column1 === "" && enable_field.column2 === false) {
                        throw new Error(createErrorMessage("enable_field", "3", ef));
                    }
                }
            }


            function checkConfigCopyfieldVal(config) {
                var row_num = Number(config["table_row_number"]);

                for (var cf = 1; cf <= row_num; cf++) {
                    var type2 = $('#tc-plugin-copyfield-tbody > tr:eq(' + cf + ') .tc-plugin-column2 option:selected')
                        .attr('name');
                    var type1 = $('#tc-plugin-copyfield-tbody > tr:eq(' + cf + ') .tc-plugin-column1 option:selected')
                        .attr('name');
                    var copy_field = JSON.parse(config['table_row' + cf]);
                    if (copy_field.column1 !== "" && copy_field.column2 === "") {
                        throw new Error(createErrorMessage("copy_field", "1", cf));
                    }
                    if (copy_field.column1 === "" && copy_field.column2 !== "") {
                        throw new Error(createErrorMessage("copy_field", "2", cf));
                    }
                    if (copy_field.column1 !== "" && copy_field.column2 !== "" && type2 !== type1) {
                        throw new Error(createErrorMessage("copy_field", "3", cf));
                    }
                    if (copy_field.column1 === "" && copy_field.column2 === "") {
                        throw new Error(createErrorMessage("copy_field", "4", cf));
                    }
                }
            }



            function createConfig() {
                var config = {};
                // Save lookupField setting to config;
                config["lookupField"] = String($(".lookupField").val());

                // Set enablefield setting to config;
                var totalrows_enablefield = $("#tc-plugin-enablefield-tbody").find("tr").length - 1;
                config["enable_row_number"] = String(totalrows_enablefield);
                for (var h = 1; h <= totalrows_enablefield; h++) {
                    var lookupfield_value = $('#tc-plugin-enablefield-tbody > tr')
                        .eq(h).find('.tc-plugin-column1').val();
                    var checbox_value = $('#tc-plugin-enablefield-tbody > tr:eq(' + h + ') .tc-plugin-column2')
                        .prop("checked");
                    var row_enablefield = {"column1": lookupfield_value, "column2": checbox_value};
                    config['enablefield_row' + h] = JSON.stringify(row_enablefield);
                }

                // Set tablefield setting to config;
                config["copyFromTable"] = String($(".copyFromTable").val());
                config["copyToTable"] = String($(".copyToTable").val());

                // Set copyfield setting to config;
                var totalrows_copyfield = $("#tc-plugin-copyfield-tbody").find("tr").length - 1;
                config["table_row_number"] = String(totalrows_copyfield);
                //  config['row_number'] = [];
                for (var y = 1; y <= totalrows_copyfield; y++) {
                    var valuecopyfrom = $('#tc-plugin-copyfield-tbody > tr').eq(y).find('.tc-plugin-column1').val();
                    var valuecopyto = $('#tc-plugin-copyfield-tbody > tr').eq(y).find('.tc-plugin-column2').val();
                    var row_table = {"column1": valuecopyfrom, "column2": valuecopyto};
                    config['table_row' + y] = JSON.stringify(row_table);
                }
                return config;
            }


           //  click Save
            $('#kintoneplugin-submit').click(function() {
                try {
                    var config = createConfig();
                    checkConfigCopyfieldVal(config);
                    checkConfigEnablefieldVal(config);
                    kintone.plugin.app.setConfig(config);
                } catch(error) {
                    alert(error.message);
                }
            });


            //click Cancel
            $('#kintoneplugin-cancel').click(function() {
                history.back();
            });
        });
})(jQuery, kintone.$PLUGIN_ID);
