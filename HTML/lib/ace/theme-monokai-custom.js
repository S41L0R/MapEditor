ace.define("ace/theme/monokai-custom",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-monokai-custom";
exports.cssText = ".ace-monokai-custom .ace_gutter {\
background: #3c434d;\
color: #8F908A\
}\
.ace-monokai-custom .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-monokai-custom {\
background-color: #282d33;\
color: #F8F8F2\
}\
.ace-monokai-custom .ace_cursor {\
color: #F8F8F0\
}\
.ace-monokai-custom .ace_marker-layer .ace_selection {\
background: #49483E\
}\
.ace-monokai-custom.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #282d33;\
}\
.ace-monokai-custom .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-monokai-custom .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-monokai-custom .ace_marker-layer .ace_active-line {\
background: #202020\
}\
.ace-monokai-custom .ace_gutter-active-line {\
background-color: #272727\
}\
.ace-monokai-custom .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-monokai-custom .ace_invisible {\
color: #52524d\
}\
.ace-monokai-custom .ace_entity.ace_name.ace_tag,\
.ace-monokai-custom .ace_keyword,\
.ace-monokai-custom .ace_meta.ace_tag,\
.ace-monokai-custom .ace_storage {\
color: #F92672\
}\
.ace-monokai-custom .ace_punctuation,\
.ace-monokai-custom .ace_punctuation.ace_tag {\
color: #fff\
}\
.ace-monokai-custom .ace_constant.ace_character,\
.ace-monokai-custom .ace_constant.ace_language,\
.ace-monokai-custom .ace_constant.ace_numeric,\
.ace-monokai-custom .ace_constant.ace_other {\
color: #AE81FF\
}\
.ace-monokai-custom .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-monokai-custom .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-monokai-custom .ace_support.ace_constant,\
.ace-monokai-custom .ace_support.ace_function {\
color: #66D9EF\
}\
.ace-monokai-custom .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-monokai-custom .ace_storage.ace_type,\
.ace-monokai-custom .ace_support.ace_class,\
.ace-monokai-custom .ace_support.ace_type {\
font-style: italic;\
color: #66D9EF\
}\
.ace-monokai-custom .ace_entity.ace_name.ace_function,\
.ace-monokai-custom .ace_entity.ace_other,\
.ace-monokai-custom .ace_entity.ace_other.ace_attribute-name,\
.ace-monokai-custom .ace_variable {\
color: #A6E22E\
}\
.ace-monokai-custom .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-monokai-custom .ace_string {\
color: #E6DB74\
}\
.ace-monokai-custom .ace_comment {\
color: #75715E\
}\
.ace-monokai-custom .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});                (function() {
                    ace.require(["ace/theme/monokai-custom"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
