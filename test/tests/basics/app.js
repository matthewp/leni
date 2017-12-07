import { connect } from '../../../leni.js';

export default function(){
  let worker = new Worker('./tests/basics/worker.js');
  let emitter = connect('app', worker);

  emitter.addEventListener('state', function(state) {
    host.textContent = state.message;
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
