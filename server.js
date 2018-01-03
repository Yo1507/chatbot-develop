var request = require("request");

const query = encodeURI("Quel est le solde du 15/01/2017 au 18/01/2017 ?");

var options = { method: 'get', url: `https://api.wit.ai/message?v=03/01/2018&q=${query}`, headers: {
    Authorization: ' Bearer PK6TK63ZGFVNMXTJDN6IJ7H4VSRUUPQY' 
} };

var values = new Map();

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  
  console.log(body);
  var jsonBody = JSON.parse(body);
  var keys = Object.keys(jsonBody.entities);
  console.log(keys);
  keys.forEach(element => {
    var ent = jsonBody.entities[element];
    ent.forEach(entity => {
      if(entity.value){
        values.set(element, entity.value);
      } else {
        var vals = [];
        entity.values.forEach(val => {
          vals.push(val.value);
          values.set(element, vals);
        })
      }
    })
  });
  console.log(values);
  if(values.has('intent')){
     var intent = values.get('intent');
     switch(intent.value){
       case 'consultation':
        consultation(values);
       break;
     }
  }
});

var consultation = ((tabs) => {
  if(tabs.has('solde') && tabs.has('today')){
    console.log('Le solde du jour est ');
  } else if(tabs.has('solde') && tabs.has('fromTo')){
    console.log('Le solde du '+tabs.get('fromTo').from+' au '+tabs.get('fromTo').to+' est ');
  }
  if(tabs.has('ventes') && tabs.has('today')){
    console.log('Le nombre de vente du jour est ');
  }
});
