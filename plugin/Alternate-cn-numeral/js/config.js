/*
 * Alternate Chinese Numeral plug-in
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
                'CNNumeral_plugin_label1': '変換元',
                'CNNumeral_plugin_desc1': '漢数字の大字へ変換するフィールドを選択して下さい。数値フィールド、計算フィールド及び文字列（1行）フィールドのみ選択できます。',
                'CNNumeral_plugin_label2': '漢数字の大字を表示するフィールド',
                'CNNumeral_plugin_desc2': '漢数字の大字に変換した結果を表示するフィールドを選択して下さい。',
                'CNNumeral_plugin_save': '保存',
                'CNNumeral_plugin_cancel': 'キャンセル'
            },
            'en': {
                'CNNumeral_plugin_label1': '変換元',
                'CNNumeral_plugin_desc1': '漢数字の大字へ変換するフィールドを選択して下さい。数値フィールド、計算フィールド及び文字列（1行）フィールドのみ選択できます。',
                'CNNumeral_plugin_label2': '漢数字の大字を表示するフィールド',
                'CNNumeral_plugin_desc2': '漢数字の大字に変換した結果を表示するフィールドを選択して下さい。',
                'CNNumeral_plugin_save': '保存',
                'CNNumeral_plugin_cancel': 'キャンセル'
            },
            'zh': {
                'CNNumeral_plugin_label1': '数字来源',
                'CNNumeral_plugin_desc1': '请选择要转换成大写数字的字段。可选择的字段类型有数值字段、计算字段以及单行文本框。',
                'CNNumeral_plugin_label2': '显示大写数字的字段',
                'CNNumeral_plugin_desc2': '选择转换后的大写数字要显示在哪个字段里。',
                'CNNumeral_plugin_save': '保存',
                'CNNumeral_plugin_cancel': '取消'
            }
        };

        // To switch the display by the login user's language
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];
        var configHtml = $('#CNNumeral-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#CNNumeral-plugin').html(tmpl.render({'terms': i18n}));


        // escape fields value
        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
        }


        function setDefault() {
            var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
            if (!CONF) {
                return;
            }
            $('.resource').val(CONF.resource);
            $('.desplay').val(CONF.desplay);

        }


        function setDropDown(resp) {

            // Create option and set to dropdown
            var $option = $('<option>');

            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {continue; }
                var pr = resp['properties'][key];
                switch (pr['type']) {
                    case 'SINGLE_LINE_TEXT':
                        $option.attr('value', escapeHtml(pr.code));
                        $option.text(escapeHtml(pr.label));
                        $('.resource').append($option.clone());
                        $('.desplay').append($option.clone());
                        break;
                    case 'NUMBER':
                    case 'CALC':
                        $option.attr('value', escapeHtml(pr.code));
                        $option.text(escapeHtml(pr.label));
                        $('.resource').append($option.clone());
                        break;
                    default:
                        break;
                }
            }

            setDefault();
        }

        kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {
            app: kintone.app.getId()
        }, function(resp) {
            setDropDown(resp);
        });


        function createErrorMessage(errorNum) {
            var user_lang = kintone.getLoginUser().language;
            var errror_message = {
                'ja': {
                    '1': '「変換元」は必須です。',
                    '2': '「漢数字の大字変換を表示するフィールド」は必須です。',
                    '3': '「変換元」と「漢数字の大字変換を表示するフィールド」は必須です。'
                },
                'en': {
                    '1': '変換元のフィールドを指定してください',
                    '2': '漢数字の大字変換を表示するフィールドを指定してください',
                    '3': '「変換元」と「漢数字の大字変換を表示するフィールド」は必須です。'
                },
                'zh': {
                    '1': '“数字来源”为必填项',
                    '2': '“显示大写数字的字段”为必填项',
                    '3': '“数字来源”和“显示大写数字的字段”为必填项。'
                }
            };
            return errror_message[user_lang][errorNum];
        }


        function checkConfigValue(config) {
            if (config.resource === '' && config.desplay !== '') {
                throw new Error(createErrorMessage('1'));
            }
            if (config.desplay === '' && config.resource !== '') {
                throw new Error(createErrorMessage('2'));
            }
            if (config.desplay === '' && config.resource === '') {
                throw new Error(createErrorMessage('3'));
            }

        }

        //  click Save
        $('#kintoneplugin-submit').click(function() {
            var config = {};
            config.resource = $('.resource').val();
            config.desplay = $('.desplay').val();


            try {
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


    });
})(jQuery, kintone.$PLUGIN_ID);
