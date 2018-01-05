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