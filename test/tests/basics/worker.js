import { subscribe } from '../../../lib/leni.js';

function onApp(emitter) {
  function echo(ev){
    emitter.post('state', {
      message: ev.detail ?? ev
    });
  }

  emitter.addEventListener('message', echo)

  emitter.addEventListener('say-hi', function(ev){
    echo(`Hi ${ev.detail.name}!`);
  });
}

subscribe('app', onApp);
