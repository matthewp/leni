import { subscribe } from '../../lib/leni.js';

subscribe('api', events => {
  function wait(ms, msg) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(msg);
      }, ms);
    });
  }

  events.addEventListener('wait', ev => {
    ev.respondWith(wait(20, ev.detail + ' works'));
  });
});