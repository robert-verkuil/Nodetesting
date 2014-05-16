var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//server.listen(process.env.PORT); //8080
server.listen(5000);

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/tty.usbmodem14431", {
  baudrate: 9600
});

serialPort.open(function () {
  console.log('open');
});

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/homeautomation', function (req, res) {
  res.sendfile(__dirname + '/homeautomation.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var convolog = [];

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});


io.sockets.on('connection', function (socket) {

    socket.on('passsend', function (data) {
        if (data == "fido"){
            socket.emit("correct");
        } else {
            socket.emit("incorrect");
            console.log("bad password");
        }
    });

    socket.on('onred', function () {
        console.log("onred");
        serialPort.write('0', function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    });

    socket.on('offred', function () {
        console.log("offred");
        serialPort.write("1", function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    });

    socket.on('ongreen', function () {
        console.log("ongreen");
        serialPort.write("2", function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    });

    socket.on('offgreen', function () {
        console.log("offgreen");
        serialPort.write("3", function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    });


    socket.on('sendchat', function (data) {

        io.sockets.emit('updatechat', socket.username, data);
        convolog.push(data);
    });

    socket.on('adduser', function(username){
        socket.username = username;
        usernames[username] = username;
        socket.emit('updatechat', 'SERVER', 'you have connected');
        socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
        io.sockets.emit('updateusers', usernames);
    });

    socket.on('disconnect', function(){
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    });

    socket.on('sendlog', function(){
        socket.emit('hereslog', convolog);
    });
});