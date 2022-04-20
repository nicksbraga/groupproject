const http = require('http');

var server = http.createServer(
    (request, response)=>{
        response.end('hello');
    }
);

server.listen(3000);