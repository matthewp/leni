importScripts('../../../leni.umd.js');

function onApp(emitter) {
  function echo(msg){
    emitter.post('state', {
      message: msg
    });
  }

  emitter.addEventListener('message', echo)

  emitter.addEventListener('say-hi', function(data){
    echo(`Hi ${data.name}!`);
  });
}

leni.subscribe('app', onApp);
