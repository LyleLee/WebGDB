/**
 * Created by lyle on 14-4-10.
 */

var code ="/*************************************************************************\n\
 > File Name: hello.c\n\
 > Author: Lyle\n\
 > Mail: lixianfayx@163.com\n\
 > Created Time: 2014年04月10日 星期四 21时24分45秒\n\
 ************************************************************************/\n\
\
#include<stdio.h>\n\
int main()\n\
{\n\
    printf(\"hello world!\\n\");\n\
\n\
    int a[10];\n\
\n\
    for(int i = 0; i < 10; ++i)\n\
    {\n\
        a[i] = i*i;\n\
    }\n\
    for(int i = 0; i<10; ++i)\n\
    {\n\
        printf(\"%d\\t\",a[i]);\n\
    }\n\
    printf(\"\\n\");\n\
\n\
    return 0;\n\
}\n";

$("#c-code").html(code);

var cEditor = CodeMirror.fromTextArea(document.getElementById("c-code"), {
    lineNumbers: true,
    matchBrackets: true,
    styleActiveLine: true,
    lineWrapping: true,
    mode: "text/x-csrc",
    gutters: ["CodeMirror-linenumbers", "breakpoints"]
});
/*保存代码, 以便后面恢复*/
var originalCode =  code;

