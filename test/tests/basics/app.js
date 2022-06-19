import { connect } from '../../../lib/leni.js';

let emitter;

export default function(){
  let worker = new Worker('./tests/basics/worker.js', { type: 'module' });
  emitter = connect('app', worker);

  emitter.addEventListener('state', function(state) {
    host.textContent = state.detail.message;
  });

  emitter.post('say-hi', { name: 'Matthew' });

  let proxy = new Proxy({}, {
    set(target, key, value) {
      Reflect.set(target, key, value);
      emitter.post(key, value);
      return true;
    }
  });

  return proxy;
};

export function stopListening() {
  emitter.stopListening();
};
