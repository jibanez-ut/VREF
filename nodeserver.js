#!/usr/bin/node

var net = require('net');

var server = net.createServer(function (socket) {
    socket.setEncoding('utf8');
    socket.on('data',function(e) { console.log(e);})
    //socket.end("goodbye\n");
});

// grab a random port.
server.listen(40011,function() {
  address = server.address();
  console.log("opened server on %j", address);
});

