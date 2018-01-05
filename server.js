var request = require("request-promise");

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Chat = require('./chat.js');




let query;
let connectionUseCase = false;
let connectionCase = 1;
let waitingForUserAnswer = false;
let userAnswer;
let lastAction;
let stopUseCase = false;
const token = ' Bearer PK6TK63ZGFVNMXTJDN6IJ7H4VSRUUPQY';

var chat = new Chat();
console.log(chat.queryBot('Bonjour'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
    query = encodeURI(msg);
    console.log(stopUseCase);
    if (connectionUseCase === false) {
      console.log('case ' + connectionCase + 'default');
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

http.listen(3000, function () {
  console.log('listening on *:3000');
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
            io.emit('bot message', 'Je ne comprends pas votre réponse. (Oui/Non attendu)');
          } else {
            consultation(values);
          }
          break;
        case 'connection':
          connectionUseCase = true;
          console.log(2);
          if (waitingForUserAnswer === true) {
            io.emit('bot message', 'Je ne comprends pas votre réponse. (Oui/Non attendu)');
          } else {
            connection();
          }
          break;
        case 'yes_no':
          if (waitingForUserAnswer === true) {
            console.log(3);
            yesNo(values);
          } else {
            io.emit('bot message', 'Veuillez poser une question.');
          }
          break;
        case 'greetings':
          console.log(4);
          if (waitingForUserAnswer === true) {
            io.emit('bot message', 'Je ne comprends pas votre réponse. (Oui/Non attendu)');
          } else {
            io.emit('bot message', 'Bonjour! En quoi puis-je vous aider?');
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
            io.emit('bot message', 'Je ne comprends pas votre réponse. (Oui/Non attendu)');
          } else {
            io.emit('bot message', 'Je ne comprends pas votre demande.');
          }
          break;
      }
    } else {
      if (waitingForUserAnswer === true) {
        io.emit('bot message', 'Je ne comprends pas votre réponse. (Oui/Non attendu)');
      } else {
        io.emit('bot message', 'Je ne comprends pas votre demande.');
      }
    }
  });
});

var consultation = ((tabs) => {
  console.log(tabs);
  if (tabs.has('solde') && tabs.has('today')) {
    console.log('Le solde du jour est ');
    io.emit('chat message', 'Le solde actuel est de ');
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
  switch (connectionCase) {
    case 1:
      if (userAnswer === false) {
        io.emit('bot message', 'Veuillez allumer tous vos appareils.');
      }
      io.emit('bot message', 'Tous vos appareils sont-ils allumés ?');
      waitingForUserAnswer = true;
      break;
    case 2:
      io.emit('bot message', 'Sur la tablette sélectionnez Bluetooth.');
      io.emit('bot message', 'Le bluetooth est-il activé?')
      waitingForUserAnswer = true;
      break;
    case 3:
      if (userAnswer === true) {
        io.emit('bot message', 'Activez la recherche d\'appareil.');
        io.emit('bot message', 'La liste des appareils s\'affiche-t-elle?');
      } else {
        io.emit('bot message', 'Activez le bluetooth.');
        io.emit('bot message', 'Activez la recherche d\'appareil.');
        io.emit('bot message', 'La liste des appareils s\'affiche-t-elle?');
      }
      waitingForUserAnswer = true;
      break;
    case 4:
      if (userAnswer === true) {
        io.emit('bot message', 'Est-ce que MPOP est appairé?');
      } else {
        io.emit('bot message', 'Choississez le matériel dans la liste affichée. (MPOP pour tiroir caisse)');
        io.emit('bot message', 'Le message "Appairé" doit apparaître sous le matériel MPOP.');
        io.emit('bot message', 'Est-ce que MPOP est appairé?');
        connectionCase++;
      }
      waitingForUserAnswer = true;
      break;
    case 5:
      if (userAnswer === true) {
        io.emit('bot message', 'Votre appareil est correctement appairé!');
        connectionCase = 1;
        connectionUseCase = false;
      } else {
        io.emit('bot message', 'Appuyez sur le bouton jaune sur un lecteur de carte.');
        io.emit('bot message', 'Lancez la porteuse.');
        io.emit('bot message', 'Activez la recheche sur la tablette.');
        io.emit('bot message', 'Choisissez le lecteur dans la liste affichée.');
        io.emit('bot message', 'Saisissez le code affiché sur la tablette puis validez.');
        io.emit('bot message', 'Le message "Appareil appairé" apparait-il?');
        waitingForUserAnswer = true;
      }
      break;
    case 6:
      if (userAnswer === true) {
        io.emit('bot message', 'Votre appareil est correctement appairé!');
      } else {
        io.emit('bot message', 'Il semble que votre souci soit d\'ordre matériel. Veuillez contacter l\'assistance technique.');
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
  io.emit('bot message', 'La conversation est finie?');
});

var reset = (() => {
  console.log('reset');
  connectionCase = 1;
  connectionUseCase = false;
  userAnswer = false;
  waitingForUserAnswer = false;
  io.emit('bot message', 'N\'hésitez pas à poser une question.');
});