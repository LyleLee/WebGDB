/**
 * Created by lyle on 14-4-10.
 */

var cEditor = CodeMirror.fromTextArea(document.getElementById("c-code"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-csrc"
});

/*保存代码, 以便后面恢复*/
var originalCode =  cEditor.getValue();