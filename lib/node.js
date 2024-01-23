'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param file {String}
 * @returns {Object}
 * @example
 * var exif = sync("~/Picture/IMG_1981.JPG");
 * console.log(exif.createTime);
 */
var sync = function sync(file) {
  if (!file) {
    throw new Error('File not found');
  }

  var buffer = _fs2.default.readFileSync(file);

  return (0, _index.fromBuffer)(buffer);
};

/**
 * @param file {String}
 * @param callback {Function}
 * @example
 * async("~/Picture/IMG_0707.JPG", (err, data) => {
 *     if(err) {
 *         console.log(err);
 *     }
 *     if(data) {
 *         console.log(data.ExifOffset.createTime);
 *     }
 * }
 */
var async = function async(file, callback) {
  var data = void 0;

  new Promise(function (resolve, reject) {
    if (!file) {
      reject(new Error('❓File not found.'));
    }

    _fs2.default.readFile(file, function (err, buffer) {
      if (err) {
        reject(err);
      } else {
        try {
          if ((0, _index.isValid)(buffer)) {
            var buf = buffer.slice(_index.SOIMarkerLength);

            data = (0, _index.APPnHandler)(buf);

            resolve(data);
          } else if ((0, _index.isTiff)(buffer)) {
            data = (0, _index.EXIFHandler)(buffer, false);

            resolve(data);
          } else {
            reject(new Error('😱Unsupport file type.'));
          }
        } catch (e) {
          reject(e);
        }
      }
    });
  }, function (error) {
    callback(error, undefined);
  }).then(function (d) {
    callback(undefined, d);
  }).catch(function (error) {
    callback(error, undefined);
  });
};

exports.parse = async;
exports.parseSync = sync;
exports.fromBuffer = _index.fromBuffer;
//# sourceMappingURL=node.js.map