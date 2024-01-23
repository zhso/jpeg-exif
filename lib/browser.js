'use strict';

var _index = require('./index');

var sync = function sync() {
  throw new Error('.parseSync not available in browser build');
};

var async = function async() {
  throw new Error('.parse not available in browser build');
};

exports.parse = async;
exports.parseSync = sync;
exports.fromBuffer = _index.fromBuffer;
//# sourceMappingURL=browser.js.map