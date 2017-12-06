importScripts('../../leni.umd.js');

function onTag(emitter) {
  let count = 0;

  function changeState(inc) {
    let newCount = count + inc;
    if(newCount >= 0) {
      count = newCount;
      emitter.post('state', count);
    }
  }

  emitter.addEventListener('increment', () => {
    changeState(+1);
  });

  emitter.addEventListener('decrement', () => {
    changeState(-1);
  });
}

leni.subscribe('app', onTag);
