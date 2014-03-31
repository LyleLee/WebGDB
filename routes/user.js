
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

exports.week = function(req,res)
{
    res.sendfile('')
}
