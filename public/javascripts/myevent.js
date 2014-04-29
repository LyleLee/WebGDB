/**
 * Created by lyle on 14-4-10.
 */

/*这个文件主要是用来处理业务的*/

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var currentLine = 0;

var address = "http://127.0.0.1:3000/";
/*sokect.io连接服务器*/
var socket = io.connect(address);


/*命令窗口和交互信息窗口需要重新移动滚动条到底部*/
function resizeWindow(divId)
{
    var div = document.getElementById(divId);
    div.scrollTop=div.scrollHeight;
};



function appendCommand(oneCommand)
{
    $("#historyCommand").append($("<p>"+(new Date()).Format("yyyy-MM-dd hh:mm:ss")+" :"+oneCommand+"</p>"));
    resizeWindow("historyCommand");
};

function highlightAline(status)
{
    //#0  main () at /home/lyle/WebstormProjects/web4/hello.c:10
    var matchWhere = status.gdbOutput.match(/\#\d+  \w* \(\) at \/home\/lyle\/WebstormProjects\/web4\/hello.c\:\d+/g);
    /*这里通过分析gdb的输出,判断是不是where命令的输出, 如果是,那么就得到了当前的行号*/

    if(matchWhere !=null)
    {
        cEditor.removeLineClass(currentLine-1, 'background', 'lineBackground');//代码编辑器好像是从0开始的, 虽然外观上显示的是1
        currentLine = parseInt(status.gdbOutput.split(":")[1],10);
        cEditor.addLineClass(currentLine-1, 'background', 'lineBackground');
        //    alert("currentLine"+currentLine);
    }
};

/*负责输出服务器传回来的信息*/
function appendMessage(status)
{

    var $lineParent = $("<p></p>");
    $lineParent.addClass("pMargin");

    var lineString = "";
    // var $lineChild = $("<pre>"+(new Date()).Format("yyyy-MM-dd hh:mm:ss")+":\t"+lineString+"</pre>");
    var $linePre = $("<pre></pre>");
    if(status.index == 0)
    {
        lineString = status.detailString;
        $linePre.addClass('redFont');
    }
    else if(status.index == 1)
    {
        lineString = status.detailString;
        $linePre.addClass('greenFont');
    }
    else if(status.index == 2)
    {
        lineString = status.detailString;
        $linePre.addClass('greenFont');
    }
    else if(status.index == 3)
    {
        lineString = status.detailString;
        lineString += status.gccOutput;
        $linePre.addClass('redFont');
    }
    else if(status.index == 4)
    {
        lineString = status.gdbOutput;
        $linePre.addClass('blueFont');
        highlightAline(status);
    }
    else if(status.index == 5)
    {
        lineString = status.gdbOutput;
        $linePre.addClass('redFont');
    }
    else if(status.index == 6)
    {
        alert("没有定义");
    }
    else if(status.index == 7)
    {
        lineString = status.runResult;
        $linePre.addClass('greenFont');
    }
    /*去除(gdb)*/
    lineString = lineString.replace(/\n*\(gdb\)\s*/g,"");

    /*去除No stack.*/
    lineString = lineString.replace(/^No stack\.\s*$/g,"");

    /*去除自动执行的where命令的输出
     * #0  main () at /home/lyle/WebstormProjects/web4/hello.c:10*/
    lineString = lineString.replace(/\s*\#\d+  \w* \(\) at \/home\/lyle\/WebstormProjects\/web4\/hello.c\:\d+\s*/g,"");

    if(lineString.length <=1)
    {
        return;
    }

    $linePre.text(lineString);
    $lineParent.append($linePre);
    $("#messageWindow").append($lineParent);
    resizeWindow('messageWindow');
};

function percessCommand(debug)
{
    appendCommand(debug.command);
    socket.emit('debug',debug);
    setTimeout(function(){
        socket.emit('debug',{command:"where"});},200);
}

function enableCommandWindow()
{
    $("#commandWindow").attr('disabled',false);
    //http://www.w3school.com.cn/jquery/attributes_attr.asp
};


function makeMarker() {
    var marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = "●";
    return marker;
};

/*代码编辑器添加监听断点的事件*/
function addBreakpointsListener()
{
    cEditor.on("gutterClick", function(cm, n) {
        //alert(n); //是n+1代表实际的行号
        var info = cm.lineInfo(n);
        var op =null;
        if(info.gutterMarkers)
        {
            /*已经是断点了,就要取消*/
            /*在gdb中删除断点是这样完成的:
             *clear /home/lyle/WebstormProjects/web4/hello.c:11
             * */
            op = null;
            var debug= {};
            debug.command = "clear /home/lyle/WebstormProjects/web4/hello.c:"+(n+1);
            socket.emit('debug',debug);
        }
        else
        {
            /*还不是断点,就要添加*/
            op = makeMarker();
            var debug= {};
            debug.command = "break "+(n+1);
            socket.emit('debug',debug);
        }
        cm.setGutterMarker(n, "breakpoints", op);
    });
}

$(document).ready(function()
{
    socket.on('status',function(status){
        console.log(status);
        appendMessage(status);
    });

    $("nav ul li:eq(2)").click(function()//eq()是从0开始计数的
    {
        var c_code = cEditor.getValue();
        var code = {
            index: 1,
            c_code:c_code,
            detailString:"请求保存数据"
        };
        socket.emit('code',code);//发送的是一个对象,这个对象有一个成员叫做code
    });

    /*不调试,直接执行*/
    $("nav ul li:eq(3)").click(function()//eq()是从0开始计数的
    {
        var code = {
            index: 2,
            c_code:cEditor.getValue(),
            detailString:"请求执行代码"
        };
        socket.emit('code',code);
    });

    /*点击开始调试菜单*/
    $("nav ul li:eq(4)").click(function()//eq()是从0开始计数的
    {

        enableCommandWindow();
        addBreakpointsListener();
        var debug = {
            command:"start"
        };
        socket.emit('debug',debug);
    });


    /*下一步*/
    $('nav ul li:eq(5)').click(function()
    {
        var debug = {
            command: "next"
        };
        percessCommand(debug);
    });
    /*执行到断点*/
    $('nav ul li:eq(6)').click(function()
    {
        var debug = {
            command: "continue"
        };
        percessCommand(debug);
    });

    /*停止调试*/
    $('nav ul li:eq(7)').click(function()
    {
        var debug = {
            command: "quit"
        };
        percessCommand(debug);
    });

    /*获取输入命令,传到服务器*/
    $("#executeCommand").click(function()
    {
        var debug = {
            command: $("#commandWindow").val()
        };
        if(debug.command.length > 0)
        {
            percessCommand(debug);
        }
    });
});
