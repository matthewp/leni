import { subscribe } from '../../../lib/leni.js';

function onApp(emitter) {
  emitter.addEventListener('app', function(){
    emitter.post('return', true);
  });
}

subscribe('app', onApp);
subscribe('app2', onApp);
