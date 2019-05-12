   var fdf = fdf || {};
   (function($, window, document, undefined) {

       'use strict';

       $.extend($.expr[":"], {
           attrStartsWith: function(el, idx, selector) {
               var atts = el.attributes;
               for (var i = 0, n = atts.length; i < n; i++) {
                   if (atts[i].nodeName.toLowerCase().indexOf(selector[3].toLowerCase()) === 0) {
                       return true;
                   }
               }
               return false;
           }
       });

       fdf.form = {
           validation: {
               required: function(ele) {
                   var isValid;
                   if (ele.is('select')) {
                       if (ele.parent('.custom-select').length > 0)
                           isValid = !ele.parent('.custom-select').hasClass('not-chosen');
                   } else if (ele.is('input[type="checkbox"]')) {
                       isValid = ele.prop('checked');
                   } else if (ele.is('input,textarea'))
                       isValid = ele.val().trim().length > 0;
                   return isValid;
               },
               email: function(ele) {
				   console.log("email----");
                   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                   return re.test(ele.val());
               },
               password: function(ele) {
                   return ele.val().trim().length > 7;
               },
               passmatch: function(ele) {
                   var eleToMatch = $(ele.attr('data-rule-passmatch'));
                   return ele.val() === eleToMatch.val();
               },
               length: function(ele) {
                   return ele.val().length == 8;
               },
               minlength: function(ele) {
                   return ele.val().length >= 8;
               },
               maxlength: function(ele) {
                   return ele.val().length <= 8;
               },
               pattern: function(ele) {
                   var regex = new RegExp(ele.attr('pattern'));
                   return ele.val().trim().length > 0 ? regex.test(ele.val()) : true;
               },
               ckeditor: function(ele) {
                   return CKEDITOR.instances[ele.attr('id')].getData().trim().length > 0;
               },
               file: function(ele) {
                   if (ele.closest('.file-explorer-wrapper').hasClass('added'))
                       return true;
                   var filesArray = ele.attr('multiple') ? (ele.data('files') ? JSON.parse(ele.data('files')) : []) : ele[0].files.length > 0 ? ele[0].files : undefined;
                   return filesArray && filesArray.length > 0;
               },
               fileAccept: function(ele) {
                   var filename = ele.val().replace(/C:\\fakepath\\/i, '');
                   var extension = filename.match(/(\.\w*)$/)[1];
                   var formats = ele.attr('accept');
                   var checkformat = false;
                   if (formats && formats.length > 0) {
                       formats = formats.toLowerCase().split(',');
                   }
                   checkformat = formats && formats.length > 0;
                   return !checkformat || (checkformat && formats.indexOf(extension.toLowerCase()) >= 0);
               },
               language: function(ele) {
                   var lang = ele.attr('data-rule-language');
                   var val = ele.val().trim();
                   var isValid = true;
                   if (val.length > 0) {
                       for (var i = 0; i < val.length; i++) {
                           var ch = val.charCodeAt(i);
                           if (lang === 'english') {
                               if (ch < 0 || ch > 255) {
                                   isValid = false;
                               }
                           } else if (lang === 'arabic') {
                               if ((ch < 1536 || ch > 1791) && ch != 32) {
                                   isValid = false;
                               }
                           }
                       }
                   }
                   return isValid;
               },
               radiogrouprequired: function(ele) {

                   var isValid = false;
                   ele.find('input[type="radio"]').each(function() {
                       if ($(this).prop('checked')) {
                           isValid = true;
                           return false;
                       }
                   });
                   return isValid;
               },
               checkboxgrouprequired: function(ele) {

                   var isValid = false;
                   ele.find('input[type="checkbox"]:not(.excludeCheckBox)').each(function() {
                       if ($(this).prop('checked')) {
                           isValid = true;
                           return false;
                       }
                   });
                   return isValid;
               },
               pastdate: function(ele) {
                   var date = new Date();
                   var enteredDate = new Date(ele.val());
                   var $warninglbl = $('<label class="warning" />').html('<span>' + ele.attr('data-msg-pastdate') + '</span>');
                   console.log(date.getTime() > enteredDate.getTime());
                   if (date.getTime() > enteredDate.getTime()) {
                       if (ele.nextAll('.warning').length > 0)
                           ele.nextAll('.warning').eq(0).html(ele.attr('data-msg-pastdate'));
                       else
                           ele.after($warninglbl);
                   } else
                       ele.nextAll('.warning').remove();

                   return true;
               },
               errorField: function(ele, validationtype) {
                   var $errorlbl = $('<label class="error" id=' + validationtype + '-error/>').text(ele.attr('data-msg-' + validationtype));

                   if (ele.is('textarea[data-rule-ckeditor="true"]')) {
                       ele.next('div').addClass('error');
                       if (!ele.next('div').find('.error').length > 0)
                           ele.next('div').append($errorlbl);
                   }
                   if (ele.is('select')) {
                       ele.parent('.custom-select').addClass('error');
                   }
                   if (ele.is('input[type="checkbox"]')) {
                       ele.closest('label').addClass('checkbox-error');
                       if (!ele.closest('label').find('.error').length > 0)
                           ele.closest('label').append($errorlbl);
                   }
                   if (ele.is('.checkbox-group,.radiobox')) {
                       console.log(ele.find('label#' + validationtype));
                       if (ele.find('label#' + validationtype + '-error').length <= 0)
                           ele.addClass('error').append($errorlbl);
                   }

                   if (ele.is('input[type="file"]')) {
                       ele.addClass('error').siblings('.file-explorer').addClass('error');
                       console.log(ele.closest('.file-explorer-wrapper').find('#' + validationtype + '-error'));
                       if (!ele.closest('.file-explorer-wrapper').find('#' + validationtype + '-error').length > 0) {
                           ele.closest('.file-explorer-wrapper').append($errorlbl);
                       }
                   }
                   if (!ele.next('.error').length > 0 && !ele.is('input[type="checkbox"],.checkbox-group,.radiobox') && !ele.is('input[type="file"]')) {
                       ele.addClass('error').after($errorlbl);
                   }

                   if (ele.is('select')) {
                       ele.on("change", watchEle);
                   } else if (ele.is('input')) {
                       ele.on("blur", watchEle);
                   } else if (ele.is('.checkbox-group')) {
                       ele.find('input[type="checkbox"]').on('change', watchEle);
                   } else if (ele.is('.radiobox')) {
                       ele.find('input[type="radio"]').on('change', watchEle);
                   }

                   function watchEle(e) {
                       fdf.form.validateFieldByRule(ele, validationtype);
                   }

               },
               validField: function(ele, validationtype) {

                   ele.nextAll('label.error#' + validationtype + '-error').remove();
                   if (ele.is('textarea[data-rule-ckeditor="true"]')) {
                       ele.next('div').removeClass('error').find('label.error#' + validationtype + '-error').remove();
                   }
                   if (ele.is('input[type="file"]')) {
                       ele.removeClass('error').siblings('.file-explorer').removeClass('error').closest('.file-explorer-wrapper').find('label.error#' + validationtype + '-error').remove();
                   }
                   if (ele.is('.checkbox-group,.radiobox')) {
                       ele.removeClass('error').find('label#' + validationtype + '-error').remove();
                   }
                   if (ele.nextAll('.error').length <= 0) {
                       ele.removeClass('error')
                       if (ele.is('select')) {
                           ele.parent('.custom-select').removeClass('error');
                       } else if (ele.is('input[type="checkbox"]')) {
                           ele.closest('.checkbox-error').removeClass('checkbox-error');
                       }
                   }
               }

           },
           validateForm: function($form) {
               var $elems = $form.find(':attrStartsWith("data-rule")').filter(function(ind, ele) {
                   return $(ele).parentsUntil($form, '.ignore-validation').length <= 0
               }).not('[disabled]');

               var isValid = true;
               $elems.each(function() {
                   var $this = $(this);
                   var $rules = [];
                   var atts = this.attributes;
                   for (var i = 0, n = atts.length; i < n; i++) {
                       if (/^data-rule-(\w*)/.test(atts[i].nodeName)) {
                           var match = atts[i].nodeName.match(/^data-rule-(\w*)/);
                           if ($this.attr(match[0]) != 'false')
                               $rules.push(match[1]);
                           else {
                               fdf.form.validation.validField($this, match[1]);
                           }
                       }
                   }

                   $rules.forEach(function($rule) {
                       isValid = fdf.form.validateFieldByRule($this, $rule) && isValid;
                   });

               });
               var $errorField = $form.find('> .error-box:first-child');
               if (!isValid) {
                   if ($errorField.length > 0)
                       $errorField.addClass('visible');
                   else if ($('input[id$="hidden_toperror"]').val()) {
                       $form.prepend($('<div class="error-box visible" />').html('<span class="red-text">' + $('input[id$="hidden_toperror"]').val() + '</span>'));
                   }
               } else {
                   $errorField.removeClass('visible');
               }
               return isValid;
           },
           validateFieldByRule: function(field, rule) {
               var eleValid = fdf.form.validation[rule](field);
               if (!eleValid)
                   fdf.form.validation.errorField(field, rule);
               else
                   fdf.form.validation.validField(field, rule);
               return eleValid;
           }
       }
       $('.form-validate [data-rule-pastdate]').each(function() {
           var rules = ['pastdate'];


           $(this).on("blur change", function() {

               var $this = $(this);
               var rule = [];
               Object.keys($this.data()).filter(function(val) {
                   if (val.match(/^rule(\w*)/) && rules.indexOf(val.match(/^rule(\w*)/)[1].toLowerCase()) >= 0)
                       rule.push(val.match(/^rule(\w*)/)[1].toLowerCase());
                   return false;
               });
               rule.forEach(function(val) {
                   fdf.form.validation[val]($this);
               });

           });
       });
   })(jQuery, window, document);