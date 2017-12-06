const got = require('got');

let urls = new Map();

let myPlugin = {
  resolveId(id) {
    if(/mitt/.test(id)) {
      urls.set('mitt', id);
      return 'mitt';
    }
  },
  load(id) {
    if(id === 'mitt') {
      return got(urls.get(id)).then(function(resp){
        return resp.body;
      });
    }
  }
}

export default {
  plugins: [myPlugin]
}
