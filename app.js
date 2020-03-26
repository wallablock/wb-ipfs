var express = require('express');
var ipfs = require('./ipfs')
var app = express();
app.get('/', function (req, res) {
    let ip = "192.168.1.20";
    let hash = "";
    res.writeHead(200);
    ipfs.IPFSread(ip,hash).then(links => {
        console.log(links);
        links.forEach((item, i) => {
            res.write('<img src='+item+'>');
        });
        res.end();
    }).catch(err => {
            console.log('Got error from IPFSread', err);
    });
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
