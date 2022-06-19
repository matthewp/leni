const spec = '_leni-tag';
const MSG = 1;
const DEL = 2;

let globalId = 0;

type PostMessageAble = {
  postMessage: typeof Worker['prototype']['postMessage']
};

export type SubscriptionCallback = (emitter: Emitter) => void;

class Emitter extends EventTarget {
  #tag: string;
  #channel: PostMessageAble;
  #id: number;
  #s: boolean = true;
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
      this.dispatchEvent(new CustomEvent(msg.type, {
        detail: msg.data
      }));
    }
  }

  post(type: string, data: any) {
    this.#channel.postMessage({
      spec, type, data,
      stype: MSG,
      id: this.#id,
      tag: this.#tag
    });
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

function connect(tag: string, worker: Worker) {
  let e = new Emitter(tag, worker);
  worker.addEventListener('message', e);
  return e;
}

function subscribe(tag: string, cb: SubscriptionCallback) {
  let idMap = new Map<number, Emitter>();

  self.addEventListener('message', (ev: MessageEvent) => {
    let msg = ev.data || {};
    if(msg.spec === spec && msg.tag === tag) {
      switch(msg.stype) {
        case MSG:
          let emitter = idMap.get(msg.id);
          if(!emitter) {
            emitter = new Emitter(tag, self, msg.id);
            cb(emitter);
            idMap.set(msg.id, emitter);
          }
          emitter.dispatchEvent(new CustomEvent(msg.type, {
            detail: msg.data
          }));
          break;
        case DEL:
          idMap.delete(msg.id);
          break;
      }

    }
  });
}

export { connect, subscribe };
