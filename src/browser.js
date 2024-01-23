import { fromBuffer } from './index';

const sync = () => {
  throw new Error('.parseSync not available in browser build');
};

const async = () => {
  throw new Error('.parse not available in browser build');
};

exports.parse = async;
exports.parseSync = sync;
exports.fromBuffer = fromBuffer;
