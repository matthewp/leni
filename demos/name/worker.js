importScripts('../../leni.umd.js');

function onTag(emitter) {
  emitter.addEventListener('update', function(state){
    let newState = Object.assign({}, state, {
      name: state.name + '!'
    });

    emitter.post('state', newState);
  });
}

leni.subscribe('app', onTag);
