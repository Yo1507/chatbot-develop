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