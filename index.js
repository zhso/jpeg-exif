"use strict";
const tags = require("./tags.json");
//unsignedByte,asciiStrings,unsignedShort,unsignedLong,unsignedRational,signedByte,undefined,signedShort,signedLong,signedRational,singleFloat,doubleFloat;
const bytes = [1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
const fs = require("fs");
/**
 * @param data {Buffer}
 * @param cursor {Number}
 * @param tags {Object}
 * @param direction {Boolean}
 * @returns {Object}
 * @example
 * var content = fs.readFileSync("~/Picture/IMG_0911.JPG");
 * var exifFragments = ifds(content, 0, [{ "key": "value" }], true);
 * console.log(exifFragments.value);
 */
function ifds(data, cursor, tags, direction) {
    let exif;
    cursor += 2;
    try {
        for (cursor; cursor < 12 * data.readUInt16BE(cursor) + cursor; cursor += 12) {
            let tagAddress = direction ? data.toString("hex", cursor, cursor + 2) : data.slice(cursor, cursor + 2).reverse().toString("hex");
            let tag = tags[tagAddress];//TTTT
            let formatValue = direction ? data.readUInt16BE(cursor + 2) - 1 : data.readUInt16LE(cursor + 2) - 1;
            let componentBytes = bytes[direction ? data.readUInt16BE(cursor + 2) - 1 : data.readUInt16LE(cursor + 2) - 1];
            let componentsNumber = direction ? data.readUInt32BE(cursor + 4) : data.readUInt32LE(cursor + 4);//NNNNNNNN
            let size = componentsNumber * componentBytes;
            let valueBuffer;
            if (size > 4) {
                let offset = direction ? data.readUInt32BE(cursor + 8) : data.readUInt32LE(cursor + 8);//DDDDDDDD
                valueBuffer = data.slice(12 + offset, 12 + offset + size);
            } else {
                valueBuffer = data.slice(cursor + 8, cursor + 12);//DDDDDDDD
            }
            let value;
            if (tag) {
                switch (formatValue) {
                    case 0:
                        value = valueBuffer.readUInt8(0);
                        break;
                    case 1:
                        value = valueBuffer.toString("ascii").replace(/\u0000/g, "").trim();
                        break;
                    case 2:
                        value = direction ? valueBuffer.readUInt16BE(0) : valueBuffer.readUInt16LE(0);
                        break;
                    case 3:
                        value = direction ? valueBuffer.readUInt32BE(0) : valueBuffer.readUInt32LE(0);
                        break;
                    case 4:
                        value = [];
                        for (let i = 0; i < valueBuffer.length; i += 8) {
                            value.push(direction ? valueBuffer.readUInt32BE(i) / valueBuffer.readUInt32BE(i + 4) : valueBuffer.readUInt32LE(i) / valueBuffer.readUInt32LE(i + 4));
                        }
                        break;
                    case 6:
                        switch (tag) {
                            case "ExifVersion":
                                value = valueBuffer.toString();
                                break;
                            case "FlashPixVersion":
                                value = valueBuffer.toString();
                                break;
                            case "SceneType":
                                value = valueBuffer.readUInt8(0);
                                break;
                            default:
                                value = "0x" + valueBuffer.toString("hex", 0, 15);
                                break;
                        }
                        break;
                    case 9:
                        value = direction ? valueBuffer.readInt32BE(0) / valueBuffer.readInt32BE(4) : valueBuffer.readInt32LE(0) / valueBuffer.readInt32LE(4);
                        break;
                    default:
                        value = "0x" + valueBuffer.toString("hex");
                        break;
                }
                if (!exif) {
                    exif = {};
                }
                exif[tag] = value;
            } else {
                //throw new Error("unsupport exif tag: " + tagAddress);
            }
        }
    } catch (err) {
        throw new Error(err);
    }
    return exif;
}
/**
 * @param file {String}
 * @returns {Object}
 * @example
 * var exif = sync("~/Picture/IMG_1981.JPG");
 * console.log(exif.createTime);
 */
function sync(file) {
    if (!file) {
        throw new Error("Please give me the file.");
    }
    let data = fs.readFileSync(file);
    let maker = data.toString("hex", 2, 4);
    if (maker === "ffe1") {
        let direction = data.toString("ascii", 12, 14) !== "II";
        let exif = ifds(data, 20, tags.ifd, direction);
        if (exif && exif.ExifOffset) {
            exif.SubExif = ifds(data, parseInt(exif.ExifOffset, 10) + 12, tags.ifd, direction);
        }
        if (exif && exif.GPSInfo) {
            exif.GPSInfo = ifds(data, parseInt(exif.GPSInfo, 10) + 12, tags.gps, direction);
        }
        return exif;
    }
    /*else if (maker === "ffe0") { }*/
}
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
function async(file, callback) {
    if (!file) {
        throw new Error("Please give me the file.");
    }
    new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err);
            } else {
                let maker = data.toString("hex", 2, 4);
                if (maker === "ffe1") {
                    let direction = data.toString("ascii", 12, 14) !== "II";
                    let exif = ifds(data, 20, tags.ifd, direction);
                    if (exif && exif.ExifOffset) {
                        exif.SubExif = ifds(data, parseInt(exif.ExifOffset, 10) + 12, tags.ifd, direction);
                    }
                    if (exif && exif.GPSInfo) {
                        exif.GPSInfo = ifds(data, parseInt(exif.GPSInfo, 10) + 12, tags.gps, direction);
                    }
                    resolve(exif);
                } else if (maker === "ffe0") {
                    resolve();
                } else {
                    reject("unsupport file type.");
                }
            }
        });
    }, error => {
        callback(error, undefined);
    }).then(data => {
        callback(undefined, data);
    }).catch(error => {
        callback(error, undefined);
    });
}
exports.parse = async;
exports.parseSync = sync;