'use strict';

var LUNR_INDEX_URL = '/assets/lunr/index.json';

importScripts('/assets/js/lunr.min.js');

var index;
var store;

self.onmessage = handleMessage;

function handleMessage(message) {
  const type = message.data.type;
  const id = message.data.id;
  const payload = message.data.payload;

  switch (type) {
    case 'load-index':
      makeRequest(LUNR_INDEX_URL, function (data) {
        loadIndex(data);
        self.postMessage({ type: type, id: id, payload: true });
      });
      break;
    case 'query-index':
      self.postMessage({ type: type, id: id, payload: { query: payload, results: queryIndex(payload) } });
      break;
    default:
      self.postMessage({ type: type, id: id, payload: { error: 'invalid message type' } });
  }
}

function makeRequest(url, callback) {
  var searchDataRequest = new XMLHttpRequest();
  searchDataRequest.onload = function () {
    callback(JSON.parse(this.responseText));
  };
  searchDataRequest.open('GET', url);
  searchDataRequest.send();
}

function loadIndex(data) {
  index = lunr.Index.load(data.index);
  store = data.store;
}

function queryIndex(query) {
  try {
    if (query.length) {
      var results = index.search(query);
      return results.map(function (hit) {
        var url = hit.ref.split('#');
        if (url.length === 2) {
          return { path: url[0], hash: url[1], title: store[hit.ref].title };
        }
        return { path: hit.ref, hash: '', title: store[hit.ref].title };
      });
    }
  } catch (e) { console.log(e); }
  return [];
}