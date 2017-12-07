# leni

A small library for communication between the main thread and workers.

## The Problem

Web Workers are a cool way to offload expensive work to another thread. However, all communication is done through a single `message` event. If you want your worker to do more than 1 thing, a lot of boilerplate is required to reroute messages to the correct handler.

## The Solution

This is a small library that create instances of event emitters that run both in the window and worker contexts. This makes it easy to send a message to one specific emitter, allowing you to have as many different handlers as you want.

__window.js__

```js
import { connect } from 'https://unpkg.com/leni/leni.js';

let worker = new Worker('./worker.js');
let emitter = connect('app', worker);

emitter.addEventListener('anything-here', function(resp){
  console.log(resp); // Hi Matthew!
});

emitter.post('say-hi', { name: 'Matthew' });
```

__worker.js__

```js
importScripts('https://unpkg.com/leni/leni.js');

function onApp(emitter) {
  emitter.addEventListener('say-hi', data => {
    let msg = `Hi ${data.name}!`;
    emitter.post('anything-here', msg);
  });
}

leni.subscribe('app', onApp);
```

That's it!

## Installation

You can install with npm or yarn:

```shell
> npm install leni --save
```

```shell
> yarn add leni
```

Or better yet, use directly from [unpkg](https://unpkg.com):

```js
import { connect } from 'https://unpkg.com/leni/leni.js';

// Use it!
```

If you plan on using leni throughout your app you can create a wrapper module like so:

__leni.js__

```js
export * from 'https://unpkg.com/leni/leni.js';
```

__app.js__

```js
import { connect } from './leni.js';
```

## License

[BSD-2-Clause](https://opensource.org/licenses/BSD-2-Clause)
