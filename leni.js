import mitt from 'https://unpkg.com/mitt@1.1.2/dist/mitt.es.js';

const spec = '_leni-tag';
const MSG = 1;
const DEL = 2;

let globalId = 0;

const emitterProto = Object.create(null);
emitterProto.post = function(type, data){
  this._worker.postMessage({
    spec, type, data,
    stype: MSG,
    id: this._id
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
emitterProto.disconnect = function(){
  this._worker.postMessage({
    spec,
    stype: DEL,
    id: this._id
  });
};
emitterProto.stopListening = function(){
  this._all.reset();
  this.disconnect();
};

const eAll = Object.create(null);
eAll.reset = function(){
  for (let i in this) delete this[i];
};

function createEmitter(tag, worker, id) {
  let e = Object.create(emitterProto);
  e._tag = tag;
  if(id === undefined) {
    id = (globalId = globalId + 1);
  }
  e._id = id;
  e._worker = worker;
  e._all = Object.create(eAll);
  e._emitter = mitt(e._all);
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
      switch(msg.stype) {
        case MSG:
          let emitter = idMap.get(msg.id);
          if(!emitter) {
            emitter = createEmitter(tag, self, msg.id);
            cb(emitter);
            idMap.set(msg.id, emitter);
          }
          emitter.emit(msg.type, msg.data);
          break;
        case DEL:
          idMap.delete(msg.id);
          break;
      }

    }
  });
}

export { connect, subscribe };
