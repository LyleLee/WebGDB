/**
 * Created by lyle on 14-4-10.
 */

/*这个文件主要用来处理与数据逻辑无关的事件响应, 主要改变外观*/

$(document).ready(function()
{
    /*导航菜单栏*/

    /*导航菜单栏切换*/
    $('.nav li').click(function(e) {
            $('.nav li').removeClass('active');
            //$(e.target).addClass('active');
            $(this).addClass('active');
    });

    /*点击图标和Home将恢复代码*/
    $("nav ul li:lt(2)").click(function(e)//第一个元素
    {
        cEditor.setValue(originalCode);
        $("#messageWindow").html("<p></p>");
    });

});