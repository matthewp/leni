importScripts('../../../leni.umd.js');

function onApp(emitter) {
  emitter.addEventListener('say-hi', function(data){
    emitter.post('state', {
      message: `Hi ${data.name}!`
    });
  });
}

leni.subscribe('app', onApp);
