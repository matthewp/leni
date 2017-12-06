import { connect } from '../../../leni.js';

export default function(){
  let worker = new Worker('./tests/basics/worker.js');
  let emitter = connect('app', worker);

  emitter.addEventListener('state', function(state) {
    host.textContent = state.message;
  });

  emitter.post('say-hi', { name: 'Matthew' });
};
