/*
 * Alternate Chinese Numeral plug-in
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
    
    
    function getFormalKanjiNumber(num) {
        
            var hanzi	 = '零壹贰叁肆伍陆柒捌玖';				// the Chinese Numeral corresponding to 0-9
            var template = '仟佰拾亿仟佰拾万仟佰拾元角分';		// the Numeral corresponding to Chinese character
            var str;											// strings of Numeral
            var result = '';									// Chinese Numeral
            
            if(num === 0) {
                return '零元整';
            }
            
            if(num < 0) {
                return '负值';
	        }
	        
	        str = (num * 100).toFixed(0).toString();	// Multiply num by 100 and convert it to a string
	        if(str.length > template.length) {
	            return '溢出';
	        }
	        
	        // get the same bit as the Numeral of Chinese Numeral.exmple,if the Numeral is 200.55,get佰拾元角分
	        template = template.substr(template.length - str.length);
	
	        //loop Chinese Numeral
	        for(var i = 0; i < str.length; i++) {
	            var numValue = Number(str.substr(i, 1));
	            var hanziValue = hanzi.substr(numValue, 1);
	            var digitValue = '';
	            
	            if (numValue === 0) {
	                // add 元、万、億
	                if (i == str.length - 3 || i == str.length - 7 || i == str.length - 11) {
	                    digitValue = template.substr(i, 1);
		            }
		        } else {
		            digitValue = template.substr(i, 1);
		        }
		        
		        result = result + hanziValue + digitValue;
	        }
	        
	        while(result.search("零零") != -1) {
	            result = result.replace("零零", "零");
	        }

	        result = result.replace("零亿", "亿");
	        result = result.replace("零万", "万");
	        result = result.replace("亿万", "亿");
	        result = result.replace("零元", "元");
	        
	        if(str.substr(str.length - 2) == '00') {
	            return result.replace("元零", "元整");
	        } else if (str.substr(str.length - 1) == '0') {
	            return result.substr(0, result.length - 1);
	        }
	        
	        return result;
        }
        
        
        function createErrorMessage(resourceFieldCode) {
            var user_lang = kintone.getLoginUser().language;
            var error_messages = {
                'ja':'フィールドコードが「' + resourceFieldCode + '」のフィールドの値は数値ではありません。',
                'en':'フィールドコードが' + resourceFieldCode + 'のフィールドの値は数値ではありません。',
                'zh':'字段代码为[' + resourceFieldCode + ']的字段的值非数值。'
            };
            
            return error_messages[user_lang];
        }
        
        
        
        var events1 = [
            'app.record.edit.submit',
            'app.record.create.submit',
            'app.record.index.edit.submit'
            ];
        
        kintone.events.on(events1, function(event) {
            
           var resourceFieldCode = escapeHtml(conf['resource']);
           var resourceFieldValue = event.record[resourceFieldCode].value;
           if (isNaN(resourceFieldValue)) {
               event.error = createErrorMessage(resourceFieldCode);
           }
           var num = Math.floor(resourceFieldValue * 100) / 100;
           var desplayFieldCode = escapeHtml(conf['desplay']);
           event.record[desplayFieldCode].value = getFormalKanjiNumber(num);
           return event;
           
        });
        
        
        var events2 = [
            'app.record.edit.show',
            'app.record.create.show',
            'app.record.index.edit.show'
            ];
            
        kintone.events.on(events2, function(event) {

           var desplayFieldCode = escapeHtml(conf['desplay']);
           event.record[desplayFieldCode]['disabled'] = true;
           return event;
           
        });
        


})(jQuery, kintone.$PLUGIN_ID);
