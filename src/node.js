import fs from 'fs';

import { isValid, isTiff, fromBuffer, APPnHandler, EXIFHandler, SOIMarkerLength } from './index'

/**
 * @param file {String}
 * @returns {Object}
 * @example
 * var exif = sync("~/Picture/IMG_1981.JPG");
 * console.log(exif.createTime);
 */
const sync = (file) => {
  if (!file) {
    throw new Error('File not found');
  }

  const buffer = fs.readFileSync(file);

  return fromBuffer(buffer);
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
const async = (file, callback) => {
  let data;

  new Promise(
    (resolve, reject) => {
      if (!file) {
        reject(new Error('❓File not found.'));
      }

      fs.readFile(file, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          try {
            if (isValid(buffer)) {
              const buf = buffer.slice(SOIMarkerLength);

              data = APPnHandler(buf);

              resolve(data);
            } else if (isTiff(buffer)) {
              data = EXIFHandler(buffer, false);

              resolve(data);
            } else {
              reject(new Error('😱Unsupport file type.'));
            }
          } catch (e) {
            reject(e);
          }
        }
      });
    },
    (error) => {
      callback(error, undefined);
    }
  )
    .then((d) => {
      callback(undefined, d);
    })
    .catch((error) => {
      callback(error, undefined);
    });
};

exports.parse = async;
exports.parseSync = sync;
exports.fromBuffer = fromBuffer;
