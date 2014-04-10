
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};


exports.sendStaticFile = function(req,res)
{
    res.render('postFile');
};
exports.postFile = function(req, res)
{
    console.log(req.files);
    res.send("done");
};


exports.chat = function(req,res)
{
    //res.sendfile('/html/index.html');
    res.render('chat');
};

exports.compiler= function(req,res)
{
    res.sendfile('compiler.html',{'root': '/home/lyle/WebstormProjects/web4/public/html/'});
};

exports.test = function(req,res)
{
    res.sendfile('test.html',{'root': '/home/lyle/WebstormProjects/web4/public/html/'});
};
