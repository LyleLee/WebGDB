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

function appendMessage(type,message)
{
    /*type 0是错误, 1是一般信息, 2是服务器成功执行编译或者调试命令的信息*/
    var $line = $("<p>"+(new Date()).Format("yyyy-MM-dd hh:mm:ss")+":\t"+message+"</p>");
    if(type == 0)
    {
        $line.addClass('redFont');
    }
    else if(type == 1)
    {

    }
    else if(type == 2)
    {
        $line.addClass('greenFont');
    }
    $("#messageWindow").append($line);
    resizeWindow('messageWindow');
};

function enableCommandWindow()
{
    $("#commandWindow").attr('disabled',false);//http://www.w3school.com.cn/jquery/attributes_attr.asp
};

var step = 1;//1是未编译代码. 2是编译已经完成, 可以进行调试

$(document).ready(function()
{

    socket.on('codeReceive',function(data)
    {
        appendMessage(1,"服务器已经接收代码");
    });

    /*编译代码*/
    $("nav ul li:eq(2)").click(function()//eq()是从0开始计数的
    {
        var code = cEditor.getValue();
        socket.emit('code',{code:code});//发送的是一个对象,这个对象有一个成员叫做code

    });

    socket.on('codeCompileSuccess',function(data)
    {
        appendMessage(2,"服务器编译代码成功");
        step = 2;
    });

    socket.on('codeCompileFail',function(data)//data是对象,
    {
        appendMessage(0,"服务器编译代码失败");
        appendMessage(0,data.gccOutPut);
        step = 1;
    });


    /*点击开始调试菜单*/
    $("nav ul li:eq(3)").click(function()//eq()是从0开始计数的
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
        }
    });

    /*获取输入命令,传到服务器*/
    $("#executeCommand").click(function()
    {
        var com = $("#commandWindow").val();
        if(com.length >0)
        {
            socket.emit('command',{com:com});
        }
    });

    /*执行命令出错*/
    socket.on('executeError',function(result)
    {
        appendMessage(0,result.commandResult);
    });

    /*正常执行命令*/
    socket.on('executeSuccess',function(result)
    {
        appendMessage(2,result.commandResult);
    });
});
