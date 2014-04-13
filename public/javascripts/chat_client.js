/**
 * Created by lyle on 14-4-2.
 */

/**/
function resize()
{
    var div = document.getElementById('allMessage');
    div.scrollTop=div.scrollHeight;
}
function getMyDate()
{
    var today = new Date();
    return today.toDateString()+today.toTimeString();
};
$(document).ready(function()
{
    var socket = io.connect("http://127.0.0.1:3000/");

    socket.on('users',function(data){

        var connectMessage = document.getElementById('connectMessage');
        connectMessage.innerHTML = "your are connected";

        var counter = document.getElementById('counter');
        counter.innerHTML = data.howManyPeople;

        console.log('get users number update');
    });

    socket.on('broadcastMessage',function(data)
    {
        $("#allMessage").append("<p>"+getMyDate()+":\t\t"+data.text+"</p>");
        //滚动条到底部
        resize();
    });

    $("#bu").click(function()
    {
        var str = $("#inputMessage").val();
        alert(str.length);
        socket.emit('sendMessage',{text:str});
        //$("#firstLine").before("<p>"+getMyDate()+":\t\t"+str+"</p>");
        $("#allMessage").append("<p>"+getMyDate()+":\t\t"+str+"</p>");

        resize();
        return false;
    });

    $("#clear").click(function()
    {
        $("#allMessage").html("<p></p>");
    });
});



