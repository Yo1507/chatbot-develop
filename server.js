var request = require("request-promise");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var query;
var connectionUseCase = false;
var connectionCase = 1;
var waitingForUserAnswer = false;
var userAnswer;
var lastAction;
var stopUseCase = false;
var token = ' Bearer PK6TK63ZGFVNMXTJDN6IJ7H4VSRUUPQY';
var messages = JSON.parse(fs.readFileSync('./messages/messages.json')).messages;
var chatMessage = 'chat message';
var botMessage = 'bot message';

// var Chat = require('./chat')
// var chat = new Chat();
// console.log(chat.queryBot('Bonjour'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

io.on('connection', function (socket) {
  socket.on(chatMessage, function (msg) {
    io.emit(chatMessage, msg);
    query = encodeURI(msg);
    console.log(stopUseCase);
    if (connectionUseCase === false) {
      queryBot(query);
    } else {
      if (waitingForUserAnswer === true) {
        queryBot(query).then(() => {
          if(userAnswer === true && stopUseCase === true){
            reset();
          } else if(userAnswer === false && stopUseCase === true){
            stopUseCase = false;
            connection();
          } else if(!userAnswer && stopUseCase === true){
            waitingForUserAnswer = true;
          } else if(!userAnswer && stopUseCase === false){
            connection();
          }
          else if(userAnswer === true){
            waitingForUserAnswer = false;
            connectionCase++;
            connection();
          }
          else if(userAnswer === false){
           connection();
           waitingForUserAnswer = false;
          } 
          userAnswer = false;
        });
      }
    }
  });
});

var queryBot = ((query) => {
  var specificQuery = {
    method: 'get',
    url: `https://api.wit.ai/message?v=03/01/2018&q=${query}`,
    headers: {
      Authorization: token
    }
  };
  return request(specificQuery, function (error, response, body) {
    var values = new Map();
    if (error) throw new Error(error);
    console.log(body);
    var jsonBody = JSON.parse(body);
    var keys = Object.keys(jsonBody.entities);
    console.log(keys);
    keys.forEach(element => {
      var ent = jsonBody.entities[element];
      ent.forEach(entity => {
        collectValues(entity, element, values);
      })
    });
    console.log(values);
    if (values.has('intent')) {
      var intent = values.get('intent');
      console.log(intent);
      switch (intent) {
        case 'consultation':
          console.log(1);
          if (waitingForUserAnswer === true) {
            io.emit(botMessage, messages.common.waitingForYesNo);
          } else {
            consultation(values);
          }
          break;
        case 'connection':
          connectionUseCase = true;
          console.log(2);
          if (waitingForUserAnswer === true) {
            io.emit(botMessage, messages.common.waitingForYesNo);
          } else {
            connection();
          }
          break;
        case 'yes_no':
          if (waitingForUserAnswer === true) {
            console.log(3);
            yesNo(values);
          } else {
            io.emit(botMessage, messages.common.waitingForQuestion);
          }
          break;
        case 'greetings':
          console.log(4);
          if (waitingForUserAnswer === true) {
            io.emit(botMessage, messages.common.waitingForYesNo);
          } else {
            io.emit(botMessage, messages.greetings.greetings1);
          }
          break;
        case 'stop':
          console.log(5);
          stopUseCase = true;
          userAnswer = null;
          stop();
          break;
        default:
          console.log(6);
          if (waitingForUserAnswer === true) {
            io.emit(botMessage, messages.common.waitingForYesNo);
          } else {
            io.emit(botMessage, messages.common.unknownResponse);
          }
          break;
      }
    } else {
      if (waitingForUserAnswer === true) {
        io.emit(botMessage, messages.common.waitingForYesNo);
      } else {
        io.emit(botMessage, messages.common.unknownResponse);
      }
    }
  });
});

// TODO get process
var consultation = ((tabs) => {
  console.log(tabs);
  if (tabs.has('solde') && tabs.has('today')) {
    console.log('Le solde du jour est ');
    io.emit(chatMessage, 'Le solde actuel est de ');
  } else if (tabs.has('solde') && tabs.has('from')) {
    console.log('Le solde du ' + tabs.get('from') + ' au ' + tabs.get('to') + ' est ');
  }
  if (tabs.has('ventes') && tabs.has('today')) {
    console.log('Le nombre de vente du jour est ');
  }
});

var collectValues = ((entity, element, values) => {
  if (entity.value) {
    values.set(element, entity.value);
  } else {
    var vals = [];
    entity.values.forEach(val => {
      vals.push(val.value);
      values.set(element, vals);
    })
  }
  // Specific fromTo (Datetime)
  if (element === 'fromTo') {
    if (entity.from) {
      values.set('from', entity.from.value);
    }
    if (entity.to) {
      values.set('to', entity.to.value);
    }
  }
});

var connection = (() => {
  var connectionMessages = messages.connection;
  switch (connectionCase) {
    case 1:
      if (userAnswer === false) {
        io.emit(chatMessage, connectionMessages.case1.message1);
      }
      io.emit(chatMessage, connectionMessages.case1.message2);
      waitingForUserAnswer = true;
      break;
    case 2:
      io.emit(botMessage, connectionMessages.case2.message1);
      io.emit(botMessage, connectionMessages.case2.message2)
      waitingForUserAnswer = true;
      break;
    case 3:
      if (userAnswer === true) {
        io.emit(botMessage, connectionMessages.case3.message1);
        io.emit(botMessage, connectionMessages.case3.message2);
      } else {
        io.emit(botMessage,  connectionMessages.case3.message3);
        io.emit(botMessage,  connectionMessages.case3.message1);
        io.emit(botMessage,  connectionMessages.case3.message2);
      }
      waitingForUserAnswer = true;
      break;
    case 4:
      if (userAnswer === true) {
        io.emit(botMessage, connectionMessages.case4.message1);
      } else {
        io.emit(botMessage, connectionMessages.case4.message2);
        io.emit(botMessage, connectionMessages.case4.message3);
        io.emit(botMessage, connectionMessages.case4.message1);
        connectionCase++;
      }
      waitingForUserAnswer = true;
      break;
    case 5:
      if (userAnswer === true) {
        io.emit(botMessage, connectionMessages.case5.message1);
        connectionCase = 1;
        connectionUseCase = false;
      } else {
        io.emit(botMessage, connectionMessages.case5.message2);
        io.emit(botMessage, connectionMessages.case5.message3);
        io.emit(botMessage, connectionMessages.case5.message4);
        io.emit(botMessage, connectionMessages.case5.message5);
        io.emit(botMessage, connectionMessages.case5.message6);
        io.emit(botMessage, connectionMessages.case5.message7);
        waitingForUserAnswer = true;
      }
      break;
    case 6:
      if (userAnswer === true) {
        io.emit(botMessage, connectionMessages.case6.message1);
      } else {
        io.emit(botMessage, connectionMessages.case6.message2);
      }
      connectionCase = 1;
      connectionUseCase = false;
      break;
  }
});

var yesNo = ((tabs) => {
  console.log('yesNo');
  if (tabs.has('oui')) {
    userAnswer = true;
  } else {
    userAnswer = false;
  }
});

var stop = (() => {
  console.log('stop method');
  io.emit(botMessage, messages.stop.stop1);
});

var reset = (() => {
  console.log('reset');
  connectionCase = 1;
  connectionUseCase = false;
  userAnswer = false;
  waitingForUserAnswer = false;
  io.emit(botMessage, messages.reset.reset1);
});

module.exports.server = {
  request : request,
  app : app,
  http : http,
  io : io,
  query : query,
  connectionUseCase : connectionUseCase,
  connectionCase : connectionCase,
  waitingForUserAnswer : waitingForUserAnswer,
  userAnswer : userAnswer,
  lastAction : lastAction,
  stopUseCase : stopUseCase,
  token : token,
}
