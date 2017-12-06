(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.leni = {})));
}(this, (function (exports) { 'use strict';

//      
// An event handler can take an optional event argument
// and should not return a value
                                          
// An array of all currently registered event handlers for a type
                                            
// A map of event types and their corresponding event handlers.
                        
                                   
  

/** Mitt: Tiny (~200b) functional event emitter / pubsub.
 *  @name mitt
 *  @returns {Mitt}
 */
function mitt(all                 ) {
	all = all || Object.create(null);

	return {
		/**
		 * Register an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to listen for, or `"*"` for all events
		 * @param  {Function} handler Function to call in response to given event
		 * @memberOf mitt
		 */
		on: function on(type        , handler              ) {
			(all[type] || (all[type] = [])).push(handler);
		},

		/**
		 * Remove an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
		 * @param  {Function} handler Handler function to remove
		 * @memberOf mitt
		 */
		off: function off(type        , handler              ) {
			if (all[type]) {
				all[type].splice(all[type].indexOf(handler) >>> 0, 1);
			}
		},

		/**
		 * Invoke all handlers for the given type.
		 * If present, `"*"` handlers are invoked after type-matched handlers.
		 *
		 * @param {String} type  The event type to invoke
		 * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
		 * @memberof mitt
		 */
		emit: function emit(type        , evt     ) {
			(all[type] || []).map(function (handler) { handler(evt); });
			(all['*'] || []).map(function (handler) { handler(type, evt); });
		}
	};
}

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

exports.connect = connect;
exports.subscribe = subscribe;

Object.defineProperty(exports, '__esModule', { value: true });

})));
