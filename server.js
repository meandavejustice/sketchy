var http = require('http');
var sockjs = require('sockjs');
var st = require("st");
var connections = [];
var nickMap = {};
var topic = 'sketchy cassettetap.es: This is the topic, you can set it with "/topic whatever"';

var chat = sockjs.createServer();
chat.on('connection', function(conn) {
  connections.push(conn);

  var number = connections.length;
  nickMap[number] = "User " + number;

  conn.write(formatMessage('user', nickMap[number], "Welcome, "+ nickMap[number], topic));
  conn.on('data', function(message) {

    if (message.indexOf('/nick') === 0) {
      message = ' ~ '+nickMap[number]+' is now known as: '+(nickMap[number] = message.slice(6))+' ~ ';
      conn.write(formatMessage('user', "you are now known as "+ nickMap[number]));
      message = formatMessage('nick', nickMap[number], message);
    } else if (message.indexOf('/me') === 0) {
      message = '* '+nickMap[number]+' '+ message.slice(3);
      message = formatMessage('emote', nickMap[number], message);
    } else if (message.indexOf('/topic') === 0) {
      topic = message.slice(7);
      message = formatMessage('topic', nickMap[number], 'topic set by' + nickMap[number], topic);
    } else {
      message = formatMessage('chat', nickMap[number], message);
    }

    for (var ii=0; ii < connections.length; ii++) {
      connections[ii].write(message);
    }

  });
  conn.on('close', function() {
    for (var ii=0; ii < connections.length; ii++) {
      connections[ii].write(formatMessage('stat', nickMap[number], nickMap[number] + " has disconnected"));
    }
  });
});

function formatMessage(type, user, msg, topic) {
  return JSON.stringify({
    user: user,
    type: type,
    msg: msg,
    topic: topic
  });
}

var server = http.createServer(st({
  path: __dirname,
  index: 'index.html',
  cache: false
}));

chat.installHandlers(server, {prefix:'/chat'});
server.listen(9999, '0.0.0.0');
