importScripts('../../../leni.umd.js');

function onApp(emitter) {
  emitter.addEventListener('app', function(){
    emitter.post('return', true);
  });
}

leni.subscribe('app', onApp);
leni.subscribe('app2', onApp);
