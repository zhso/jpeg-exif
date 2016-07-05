"use strict";
const tags = require("./tags.json");
//unsignedByte,asciiStrings,unsignedShort,unsignedLong,unsignedRational,signedByte,undefined,signedShort,signedLong,signedRational,singleFloat,doubleFloat;
const bytes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
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
function IFDHandler(IFD, tags, order) {
    console.log(IFD);
    let entryNumber = IFD.readUInt8(0);
    let entryBegin = 2;
    let entries = IFD.slice(entryBegin);
    let exif;
    let entryCount = 0;
    const entryLength = 12;
    try {
        for (entryCount; entryCount < entryNumber; entryCount++) {
            let tagBegin = entryCount * entryLength;
            let entry = entries.slice(tagBegin, tagBegin + entryLength);
            console.log(`${entry.toString("hex", 0, 2)} ${entry.toString("hex", 2, 4)} ${entry.toString("hex", 4, 8)} ${entry.toString("hex", 8, 12)}`.toUpperCase());
            const tagLength = 2;
            const dataFormatLength = 2;
            const componentsNumberLength = 4;
            const dataValueLength = 4;

            let formatBegin = tagBegin + tagLength;
            let tagAddress = entry.slice(tagBegin, formatBegin);
            let tagNumber = order ? tagAddress.reverse().toString("hex") : tagAddress.toString("hex");
            let tagName = tags[tagNumber];

            let dataFormat = order ? entry.readUInt16LE(formatBegin) : entry.readUInt16BE(formatBegin);
            let componentsBegin = formatBegin + dataFormatLength;
            let componentsByte = bytes[dataFormat];
            let componentsNumber = order ? entry.readUInt32LE(componentsBegin) : entry.readUInt32BE(componentsBegin);

            let dataLength = componentsNumber * componentsByte;
            let dataBegin = componentsBegin + componentsNumberLength;
            let dataValue = entry.slice(dataBegin, dataBegin + dataValueLength);
            if (dataLength > 4) {
                let dataOffset = order ? dataValue.readUInt32LE() : dataValue.readUInt32BE();
                dataValue = IFD.slice(dataOffset - entryBegin, dataOffset + dataLength - entryBegin);
                console.log(dataValue);
            } else {
                console.log("-------------------------------------------------------------");
            }
            console.log(`${tagName} : ${dataValue.toString("ascii")}`);
            let tagValue;
            if (tagName) {
                console.log(dataFormat);
                switch (dataFormat) {
                    case 0:
                        tagValue = dataValue.readUInt8();
                        break;
                    case 1:
                        tagValue = dataValue.toString("ascii").replace(/\u0000/g, "").trim();
                        break;
                    case 2:
                        tagValue = order ? dataValue.readUInt16LE() : dataValue.readUInt16BE();
                        break;
                    case 3:
                        tagValue = order ? dataValue.readUInt32BE() : dataValue.readUInt32LE();
                        break;
                    case 4:
                        tagValue = [];
                        for (let i = 0; i < dataValue.length; i += 8) {
                            value.push(order ? dataValue.readUInt32BE(i) / dataValue.readUInt32BE(i + 4) : dataValue.readUInt32LE(i) / dataValue.readUInt32LE(i + 4));
                        }
                        break;
                    case 6:
                        switch (tag) {
                            case "ExifVersion":
                                tagValue = dataValue.toString();
                                break;
                            case "FlashPixVersion":
                                tagValue = dataValue.toString();
                                break;
                            case "SceneType":
                                tagValue = dataValue.readUInt8(0);
                                break;
                            default:
                                tagValue = "0x" + dataValue.toString("hex", 0, 15);
                                break;
                        }
                        break;
                    case 9:
                        tagValue = order ? dataValue.readInt32BE(0) / dataValue.readInt32BE(4) : dataValue.readInt32LE(0) / dataValue.readInt32LE(4);
                        break;
                    default:
                        tagValue = "0x" + dataValue.toString("hex");
                        break;
                }
                if (!exif) {
                    exif = {};
                }
                exif[tagName] = tagValue;
            } else {
                throw new Error("unkown tag name");
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
    const SOIMarkerLength = 2;
    const JPEGSOIMarker = "ffd8";
    const JFIFMarker = "ffe0";
    const EXIFMarker = "ffe1";
    const APPMarkerLength = 2;
    let SOIMarker = data.toString("hex", 0, SOIMarkerLength);
    let APPMarkerTag = data.toString("hex", SOIMarkerLength, SOIMarkerLength + APPMarkerLength);
    if (SOIMarker === JPEGSOIMarker) {
        if (APPMarkerTag === EXIFMarker) {
            let entryNumber = data.readUInt8(20);
            if (entryNumber > 0) {
                let direction = data.toString("ascii", 12, 14) !== "II";
                let exif = ifds(data, 20, tags.ifd, direction, entryNumber);
                if (exif && exif.ExifOffset) {
                    exif.SubExif = ifds(data, parseInt(exif.ExifOffset, 10) + 12, tags.ifd, direction);
                }
                if (exif && exif.GPSInfo) {
                    exif.GPSInfo = ifds(data, parseInt(exif.GPSInfo, 10) + 12, tags.gps, direction);
                }
                return exif;
            } else {
                return {};
            }
        } else if (APPMarkerTag === JFIFMarker) {
            let APP0Length = data.readUInt16BE(SOIMarkerLength + APPMarkerLength);
            let APP0End = SOIMarkerLength + APPMarkerLength + APP0Length;
            let APP1MarkerEnd = SOIMarkerLength + APPMarkerLength + APP0Length + APPMarkerLength;
            let APP1Marker = data.toString("hex", APP0End, APP1MarkerEnd);
            if (APP1Marker === EXIFMarker) {
                const APP1DataSizeLength = 2;
                const EXIFHeaderLength = 6;
                const TIFFHeaderLength = 8;
                //const BEByteOrder = "MM";
                const LEByteOrder = "II";
                let IFD1OffsetLength = 4;
                let APP1HeaderEnd = APP1MarkerEnd + APP1DataSizeLength + EXIFHeaderLength;
                //let APP1Header = data.toString("ascii", APP1MarkerEnd + APP1DataSizeLength, APP1HeaderEnd);//EXIF
                const byteOrderLength = 2;
                let TIFFHeaderEnd = APP1HeaderEnd + TIFFHeaderLength;
                let byteOrder = data.toString("ascii", APP1HeaderEnd, APP1HeaderEnd + byteOrderLength);
                let order = byteOrder === LEByteOrder;
                let IFD0Offset = order ? data.readUInt32LE(TIFFHeaderEnd - IFD1OffsetLength) : data.readUInt32BE(TIFFHeaderEnd - IFD1OffsetLength);
                let IFD = data.slice(APP1HeaderEnd + IFD0Offset);

                let exif = IFDHandler(IFD, tags.ifd, order);
                if (exif && exif.ExifOffset) {
                    exif.SubExif = IFDHandler(data, parseInt(exif.ExifOffset, 10) + 12, tags.ifd, direction);
                }
                return exif;
            } else {
                return {};
            }
        } else {
            return {};
        }
    } else {
        throw new Error("Invalid JPEG file.");
    }
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
                    let entryNumber = data.readUInt8(20);
                    if (entryNumber > 0) {
                        let direction = data.toString("ascii", 12, 14) !== "II";
                        let exif = ifds(data, 20, tags.ifd, direction, entryNumber);
                        if (exif && exif.ExifOffset) {
                            exif.SubExif = ifds(data, parseInt(exif.ExifOffset, 10) + 12, tags.ifd, direction);
                        }
                        if (exif && exif.GPSInfo) {
                            exif.GPSInfo = ifds(data, parseInt(exif.GPSInfo, 10) + 12, tags.gps, direction);
                        }
                        resolve(exif);
                    } else {
                        resolve({});
                    }
                } else if (maker === "ffe0") {

                    maker = data.toString("hex", 20, 22);
                    if (maker === "ffe1") {
                        let entryNumber = data.readUInt8(38);
                        if (entryNumber > 0) {
                            let direction = data.toString("ascii", 30, 32) !== "II";
                            let exif = ifds(data, 38, tags.ifd, direction, entryNumber);
                            if (exif && exif.ExifOffset) {
                                exif.SubExif = ifds(data, parseInt(exif.ExifOffset, 10) + 12, tags.ifd, direction);
                            }
                            resolve(exif);
                        } else {
                            resolve({});
                        }
                    } else {
                        resolve({});
                    }
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