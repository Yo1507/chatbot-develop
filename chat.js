this.request = require("request-promise");
this.token = ' Bearer PK6TK63ZGFVNMXTJDN6IJ7H4VSRUUPQY';;

function Chat() {

};

Chat.prototype.queryBot = ((query) => {
    var specificQuery = {
      method: 'get',
      url: `https://api.wit.ai/message?v=03/01/2018&q=${query}`,
      headers: {
        Authorization: this.token
      }
    };
    return this.request(specificQuery, function (error, response, body) {
      var values = new Map();
      if (error) throw new Error(error);
      console.log(body);
      var jsonBody = JSON.parse(body);
      var keys = Object.keys(jsonBody.entities);
      console.log(keys);
      keys.forEach(element => {
        var ent = jsonBody.entities[element];
        ent.forEach(entity => {
            Chat.prototype.collectValues(entity, element, values);
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

  Chat.prototype.collectValues = ((entity, element, values) => {
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

  module.exports = Chat;