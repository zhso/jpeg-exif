'use strict';
const tags = require('./tags.json');
//unsignedByte,asciiStrings,unsignedShort,unsignedLong,unsignedRational,signedByte,undefined,signedShort,signedLong,signedRational,singleFloat,doubleFloat;
const bytes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
const fs = require('fs');
const SOIMarkerLength = 2;
const JPEGSOIMarker = 0xffd8;
const APPMarkerLength = 2;
const APPMarkerBegin = 0xffe0;
const APPMarkerEnd = 0xffef;
let data;
/**
 * @param buffer {Buffer}
 * @returns {Boolean}
 * @example
 * var content = fs.readFileSync("~/Picture/IMG_0911.JPG");
 * var isImage = isValid(content);
 * console.log(isImage);
 */
function isValid(buffer) {
    try {
        let SOIMarker = buffer.readUInt16BE(0);
        return SOIMarker === JPEGSOIMarker;
    } catch (e) {
        throw new Error('Unsupport file format.');
    }
}
/**
 * @param buffer {Buffer}
 * @returns {Number}
 * @example
 * var content = fs.readFileSync("~/Picture/IMG_0911.JPG");
 * var APPNumber = checkAPPn(content);
 * console.log(APPNumber);
 */
function checkAPPn(buffer) {
    try {
        let APPMarkerTag = buffer.readUInt16BE(0);
        return APPMarkerTag >= APPMarkerBegin && APPMarkerTag <= APPMarkerEnd ? APPMarkerTag - APPMarkerBegin : false;
    } catch (e) {
        throw new Error('Invalid APP Tag.');
    }
}
/**
 * @param buffer {Buffer}
 * @param tags {Object}
 * @param order {Boolean}
 * @param offset {Number}
 * @returns {Object}
 * @example
 * var content = fs.readFileSync("~/Picture/IMG_0911.JPG");
 * var exifFragments = IFDHandler(content, 0, true, 8);
 * console.log(exifFragments.value);
 */
function IFDHandler(buffer, tags, order, offset) {
    let entriesNumber = order ? buffer.readUInt16BE(0) : buffer.readUInt16LE(0);
    if (entriesNumber === 0) {
        return {};
    }
    let entriesNumberLength = 2;
    let entries = buffer.slice(entriesNumberLength);
    const entryLength = 12;
    //let nextIFDPointerBegin = entriesNumberLength + entryLength * entriesNumber;
    //let nextIFDPointer = order ? buffer.readUInt32BE(nextIFDPointerBegin) : buffer.readUInt32LE(nextIFDPointerBegin);
    let exif = {};
    let entryCount = 0;
    for (entryCount; entryCount < entriesNumber; entryCount++) {
        let entryBegin = entryCount * entryLength;
        let entry = entries.slice(entryBegin, entryBegin + entryLength);
        const tagBegin = 0;
        const tagLength = 2;
        const dataFormatBegin = tagBegin + tagLength;
        const dataFormatLength = 2;
        const componentsBegin = dataFormatBegin + dataFormatLength;
        const componentsNumberLength = 4;
        const dataValueBegin = componentsBegin + componentsNumberLength;
        const dataValueLength = 4;
        let tagAddress = entry.slice(tagBegin, dataFormatBegin);
        let tagNumber = order ? tagAddress.toString('hex') : tagAddress.reverse().toString('hex');
        let tagName = tags[tagNumber];
        let dataFormat = order ? entry.readUInt16BE(dataFormatBegin) : entry.readUInt16LE(dataFormatBegin);
        let componentsByte = bytes[dataFormat];
        let componentsNumber = order ? entry.readUInt32BE(componentsBegin) : entry.readUInt32LE(componentsBegin);
        let dataLength = componentsNumber * componentsByte;
        let dataValue = entry.slice(dataValueBegin, dataValueBegin + dataValueLength);
        if (dataLength > 4) {
            let dataOffset = order ? dataValue.readUInt32BE(0) : dataValue.readUInt32LE(0);
            dataValue = buffer.slice(dataOffset - offset, dataOffset + dataLength - offset);
        }
        let tagValue;
        if (tagName) {
            switch (dataFormat) {
                case 1:
                    tagValue = dataValue.readUInt8(0);
                    break;
                case 2:
                    tagValue = dataValue.toString('ascii').replace(/\u0000+$/, '');
                    break;
                case 3:
                    tagValue = order ? dataValue.readUInt16BE(0) : dataValue.readUInt16LE(0);
                    break;
                case 4:
                    tagValue = order ? dataValue.readUInt32BE(0) : dataValue.readUInt32LE(0);
                    break;
                case 5:
                    tagValue = [];
                    for (let i = 0; i < dataValue.length; i += 8) {
                        tagValue.push(order ? dataValue.readUInt32BE(i) / dataValue.readUInt32BE(i + 4) : dataValue.readUInt32LE(i) / dataValue.readUInt32LE(i + 4));
                    }
                    break;
                case 7:
                    switch (tagName) {
                        case 'ExifVersion':
                            tagValue = dataValue.toString();
                            break;
                        case 'FlashPixVersion':
                            tagValue = dataValue.toString();
                            break;
                        case 'SceneType':
                            tagValue = dataValue.readUInt8(0);
                            break;
                        default:
                            tagValue = `0x${dataValue.toString('hex', 0, 15)}`;
                            break;
                    }
                    break;
                case 10:
                    tagValue = order ? dataValue.readInt32BE(0) / dataValue.readInt32BE(4) : dataValue.readInt32LE(0) / dataValue.readInt32LE(4);
                    break;
                default:
                    tagValue = `0x${dataValue.toString('hex')}`;
                    break;
            }
            exif[tagName] = tagValue;
        } else {
            console.log(`Unkown Tag [0x${tagNumber}].`);
        }
    }
    return exif;
}

/**
 * @param buffer {Buffer}
 * @returns {Undefined}
 * @example
 * var content = fs.readFileSync("~/Picture/IMG_0911.JPG");
 * var exifFragments = EXIFHandler(content);
 */
function EXIFHandler(buffer) {
    buffer = buffer.slice(APPMarkerLength);
    let length = buffer.readUInt16BE(0);
    buffer = buffer.slice(0, length);
    const lengthLength = 2;
    buffer = buffer.slice(lengthLength);
    const identifierLength = 5;
    buffer = buffer.slice(identifierLength);
    const padLength = 1;
    buffer = buffer.slice(padLength);
    const byteOrderLength = 2;
    let byteOrder = buffer.toString('ascii', 0, byteOrderLength) === 'MM';
    const fortyTwoLength = 2;
    let fortyTwoEnd = byteOrderLength + fortyTwoLength;
    let offsetOfIFD = byteOrder ? buffer.readUInt32BE(fortyTwoEnd) : buffer.readUInt32LE(fortyTwoEnd);
    buffer = buffer.slice(offsetOfIFD);
    if (buffer.length > 0) {
        data = IFDHandler(buffer, tags.ifd, byteOrder, offsetOfIFD);
        if (data['ExifIFDPointer']) {
            buffer = buffer.slice(data['ExifIFDPointer'] - offsetOfIFD);
            data.SubExif = IFDHandler(buffer, tags.ifd, byteOrder, data['ExifIFDPointer']);
        }
        if (data["GPSInfoIFDPointer"]) {
            buffer = buffer.slice(data['ExifIFDPointer'] ? data['GPSInfoIFDPointer'] - data['ExifIFDPointer'] : data['GPSInfoIFDPointer'] - offsetOfIFD);
            data.GPSInfo = IFDHandler(buffer, tags.gps, byteOrder, data['GPSInfoIFDPointer']);
        }
    }
}

/**
 * @param buffer {Buffer}
 * @returns {Undefined}
 * @example
 * var content = fs.readFileSync("~/Picture/IMG_0911.JPG");
 * var exifFragments = APPnHandler(content);
 */
function APPnHandler(buffer) {
    let APPMarkerTag = checkAPPn(buffer);
    if (APPMarkerTag !== false) { //APP0 is 0, and 0==false
        let length = buffer.readUInt16BE(APPMarkerLength);
        switch (APPMarkerTag) {
            case 1: //EXIF
                EXIFHandler(buffer);
                break;
            default:
                buffer = buffer.slice(APPMarkerLength + length);
                APPnHandler(buffer);
                break;
        }
    }
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
        throw new Error('File not found');
    }
    data = undefined;
    let buffer = fs.readFileSync(file);
    if (isValid(buffer)) {
        buffer = buffer.slice(SOIMarkerLength);
        data = {};
        APPnHandler(buffer);
    }
    return data;
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
    data = undefined;
    new Promise((resolve, reject) => {
        if (!file) {
            reject('File not found.');
        }
        fs.readFile(file, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                try {
                    if (isValid(buffer)) {
                        buffer = buffer.slice(SOIMarkerLength);
                        data = {};
                        APPnHandler(buffer);
                        resolve(data);
                    } else {
                        reject('unsupport file type.');
                    }
                } catch (e) {
                    reject(e);
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
