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


var address = "http://127.0.0.1:3000/";
/*sokect.io连接服务器*/
var socket = io.connect(address);

/*命令窗口和交互信息窗口需要重新移动滚动条到底部*/
function resizeWindow(divId)
{
    var div = document.getElementById(divId);
    div.scrollTop=div.scrollHeight;
};

function clearWindow(divId)
{
    var div = document.getElementById(divId);
    $(div).html("<p></p>");
};

/*在编译, 以及调试的时候,经常会有说你的某个文件...但是对于用户来说, 没有必要知道在服务器中的具体路径*/
function replaceFileName(str){
    str = str.replace(/\/home\/lyle\/WebstormProjects\/web4\/hello.c./g,"");
    str = str.replace(/\/home\/lyle\/WebstormProjects\/web4\/a.out/,"");
    return str;
};

function appendCommand(oneCommand)
{
    $("#historyCommand").append($("<p>"+oneCommand+"</p>"));
    resizeWindow("historyCommand");
};
function appendMessage(type,message)
{
    /*type 0是错误, 1是一般信息, 2是服务器成功执行编译或者调试命令的信息*/
    var $lineParent = $("<p></p>");
    $lineParent.addClass("pMargin");
    var $lineChild = $("<pre>"+(new Date()).Format("yyyy-MM-dd hh:mm:ss")+":\t"+message+"</pre>");
    if(type == 0)
    {
        $lineChild.addClass('redFont');
    }
    else if(type == 1)
    {

    }
    else if(type == 2)
    {
        $lineChild.addClass('greenFont');
    }
    $lineParent.append($lineChild);
    $("#messageWindow").append($lineParent);
    resizeWindow('messageWindow');
};

function enableCommandWindow()
{
    $("#commandWindow").attr('disabled',false);//http://www.w3school.com.cn/jquery/attributes_attr.asp
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
            socket.emit('command',{com:"clear /home/lyle/WebstormProjects/web4/hello.c"+(n+1)});
        }
        else
        {
            /*还不是断点,就要添加*/
            op = makeMarker();
            socket.emit('command',{com:"break "+(n+1)});
        }
        cm.setGutterMarker(n, "breakpoints", op);
    });
}


var step = 1;//1是未编译代码. 2是编译已经完成, 可以进行调试

$(document).ready(function()
{

    socket.on('codeReceive',function(data)
    {
        appendMessage(1,"服务器已经接收代码");
    });

    socket.on('codeCompileSuccess',function(data)
    {
        appendMessage(2,"服务器编译代码成功");
        step = 2;
    });

    socket.on('codeCompileFail',function(data)//data是对象,
    {
        var temp = replaceFileName(data.gccOutPut);
        appendMessage(0,"服务器编译代码失败");
        appendMessage(0,temp);
        step = 1;
    });


    /*编译代码*/
    $("nav ul li:eq(2)").click(function()//eq()是从0开始计数的
    {
        var code = cEditor.getValue();
        socket.emit('code',{code:code});//发送的是一个对象,这个对象有一个成员叫做code
    });
    /*不调试,直接执行*/
    $("nav ul li:eq(3)").click(function()//eq()是从0开始计数的
    {
        /*还没有编译*/
        if(step == 1)
        {
            appendMessage(1,"还没有编译代码, 请编译后再执行");
            return false;
        }
        else if(step == 2)
        {
            socket.emit('runProgram');
            socket.on('runEnd',function(result){
                appendMessage(1,result.runResult);
            });
        }
    });
    /*点击开始调试菜单*/
    $("nav ul li:eq(4)").click(function()//eq()是从0开始计数的
    {
        /*还没有编译*/
        if(step == 1)
        {
            appendMessage(1,"还没有编译代码, 请编译后进行调试");
            return false;
        }
        else if(step == 2)
        {
            enableCommandWindow();
            socket.emit('debug');
            addBreakpointsListener();
        }
    });


    /*下一步*/
    $('nav ul li:eq(5)').click(function()
    {
        alert("下一步");
        socket.emit('command',{com:"next"});
    });

    /*执行到断点*/
    $('nav ul li:eq(6)').click(function()
    {
        alert("继续执行");
        socket.emit("command",{com:"continue"});
    });

    /*停止调试*/
    $('nav ul li:eq(7)').click(function()
    {
        socket.emit('stop',{com:"quit"});
    });

    /*获取输入命令,传到服务器*/
    $("#executeCommand").click(function()
    {
        var com = $("#commandWindow").val();
        if(com.length >0)
        {
            //alert(com);
            socket.emit('command',{com:com});
            appendCommand(com);
        }
    });

    /*执行命令出错*/
    socket.on('executeError',function(result)
    {
        appendMessage(0,replaceFileName(result.commandResult));
    });

    /*正常执行命令*/
    socket.on('executeSuccess',function(result)
    {
        appendMessage(2,replaceFileName(result.commandResult));
    });
});
