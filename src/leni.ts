const spec = '_leni-tag';
const MSG = 1;
const DEL = 2;
const PRM = 3;

let globalId = 0;

type PostMessageAble = {
  postMessage: typeof Worker['prototype']['postMessage']
};

export type SubscriptionCallback = (emitter: Emitter) => void;

interface EventListener<T = any> {
  (evt: CustomEvent<T>): void;
}

interface EventListenerObject<T = any> {
  handleEvent(object: CustomEvent<T>): void;
}

type EventListenerOrEventListenerObject<T = any> = EventListener<T> | EventListenerObject<T>;

const _postSym = Symbol('post');

class BaseEmitter extends EventTarget {
  #tag: string;
  #channel: PostMessageAble;
  #id: number;
  #s: boolean = true;
  #m: Map<number, (value: unknown) => void> = new Map();
  constructor(tag: string, channel: PostMessageAble, id?: number) {
    super();
    this.#tag = tag;
    this.#channel = channel;

    if(typeof id === 'undefined') {
      id = (globalId = globalId + 1);
    }
    this.#id = id;
  }

  handleEvent(ev: MessageEvent) {
    let msg = ev.data || {};
    if(msg.spec === spec && msg.id === this.#id && this.#s) {
      switch(msg.stype) {
        case MSG: {
          this.dispatchEvent(new CustomEvent(msg.type, {
            detail: msg.data
          }));
          break;
        }
        case PRM: {
          let resolve = this.#m.get(msg.eid)!;
          resolve(msg.data);
          this.#m.delete(msg.eid);
          break;
        }
      }

    }
  }

  respond(ev: MaybeAsyncEvent<any>, data: any) {
    let eid = ev.eid;
    this.#channel.postMessage({
      spec, data, eid,
      stype: PRM,
      id: this.#id,
      tag: this.#tag
    });
  }

  post<T = any>(type: string, data: T) {
    this.#channel.postMessage({
      spec, type, data,
      stype: MSG,
      id: this.#id,
      tag: this.#tag
    });
  }

  async postAsync<T = any, R = any>(type: string, data: T): Promise<R> {
    let eid = Math.random();
    let resolve: any;
    let p = new Promise<R>(r => resolve = r);
    this.#channel.postMessage({
      spec, type, data,
      stype: MSG,
      id: this.#id,
      eid,
      tag: this.#tag
    });
    this.#m.set(eid, resolve);
    return p;
  }

  disconnect() {
    this.#channel.postMessage({
      spec,
      stype: DEL,
      id: this.#id
    });
  }

  stopListening() {
    this.#s = false;
    this.disconnect();
  }
}

export type Emitter = BaseEmitter & {
  addEventListener<T = any>(type: string, callback: EventListenerOrEventListenerObject<T> | null, options?: boolean | AddEventListenerOptions | undefined): void;
  addEventListener(type: string, callback: EventListenerOrEventListenerObject<any> | null, options?: boolean | AddEventListenerOptions | undefined): void;
}

function connect(tag: string, worker: Worker) {
  let e = new BaseEmitter(tag, worker) as Emitter;
  worker.addEventListener('message', e);
  return e;
}

class MaybeAsyncEvent<T> extends CustomEvent<T> {
  promise: null | Promise<any> = null;
  eid: string | undefined;
  respondWith<R = any>(promise: Promise<R>) {
    this.promise = promise;
  }
}

function subscribe(tag: string, cb: SubscriptionCallback) {
  let idMap = new Map<number, Emitter>();

  self.addEventListener('message', (ev: MessageEvent) => {
    let msg = ev.data || {};
    if(msg.spec === spec && msg.tag === tag) {
      switch(msg.stype) {
        case MSG: {
          let emitter = idMap.get(msg.id);
          if(!emitter) {
            emitter = new BaseEmitter(tag, self, msg.id) as Emitter;
            cb(emitter);
            idMap.set(msg.id, emitter);
          }
          let ev = new MaybeAsyncEvent(msg.type, {
            detail: msg.data
          });
          ev.eid = msg.eid;
          emitter.dispatchEvent(ev);
          if(msg.eid && ev.promise) {
            ev.promise.then(val => {
              emitter?.respond(ev, val);
            });
          }
          break;
        }
        case DEL: {
          idMap.delete(msg.id);
          break;
        }
      }
    }
  });
}

export { connect, subscribe };
