import mitt from 'https://unpkg.com/mitt@1.1.2/dist/mitt.es.js';

let globalId = 0;
let spec = 'lib-tag';

let emitterProto = Object.create(null);
emitterProto.post = function(type, data){
  this._worker.postMessage({
    spec: spec,
    type: type,
    id: this._id,
    data: data
  });
};
emitterProto.addEventListener = function(type, cb){
  this._emitter.on(type, cb);
};
emitterProto.removeEventListener = function(type, cb){
  this._emitter.off(type, cb);
};
emitterProto.emit = function(a, b){
  this._emitter.emit(a, b);
};
emitterProto.handleEvent = function(ev){
  let msg = ev.data || {};
  if(msg.spec === spec && msg.id === this._id) {
    this.emit(msg.type, msg.data);
  }
};

function createEmitter(tag, worker, id) {
  let e = Object.create(emitterProto);
  e._tag = tag;
  if(id === undefined) {
    id = (globalId = globalId + 1);
  }
  e._id = id;
  e._worker = worker;
  e._emitter = mitt();
  return e;
}

function connect(tag, worker) {
  let e = createEmitter(tag, worker);
  worker.addEventListener('message', e);
  return e;
}

function subscribe(tag, cb) {
  let idMap = new Map();

  self.addEventListener('message', function(ev){
    let msg = ev.data || {};
    if(msg.spec === spec) {
      let emitter = idMap.get(msg.id);
      if(!emitter) {
        emitter = createEmitter(tag, self, msg.id);
        cb(emitter);
        idMap.set(msg.id, emitter);
      }
      emitter.emit(msg.type, msg.data);
    }
  });
}

export { connect, subscribe };
