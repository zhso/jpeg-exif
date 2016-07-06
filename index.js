"use strict";
const tags = require("./tags.json");
//unsignedByte,asciiStrings,unsignedShort,unsignedLong,unsignedRational,signedByte,undefined,signedShort,signedLong,signedRational,singleFloat,doubleFloat;
const bytes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
const fs = require("fs");
//SOI
const SOIMarkerLength = 2;
const JPEGSOIMarker = "ffd8";
//Marker
const JFIFMarker = "ffe0";
const EXIFMarker = "ffe1";
//Header
const APP1DataSizeLength = 2;
const EXIFHeaderLength = 6;
const TIFFHeaderLength = 8;
//APP
const APPMarkerLength = 2;

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
    let entriesNumber = IFD.readUInt8(0);
    let entriesBegin = 2;
    let entries = IFD.slice(entriesBegin);
    let exif;
    let entryCount = 0;
    const entryLength = 12;
    try {
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
            let tagNumber = order ? tagAddress.reverse().toString("hex") : tagAddress.toString("hex");
            let tagName = tags[tagNumber];
            let dataFormat = order ? entry.readUInt16LE(dataFormatBegin) : entry.readUInt16BE(dataFormatBegin);
            let componentsByte = bytes[dataFormat];
            let componentsNumber = order ? entry.readUInt32LE(componentsBegin) : entry.readUInt32BE(componentsBegin);
            let dataLength = componentsNumber * componentsByte;
            let dataValue = entry.slice(dataValueBegin, dataValueBegin + dataValueLength);
            if (dataLength > 4) {
                let dataOffset = order ? dataValue.readUInt32LE() : dataValue.readUInt32BE();
                //console.log(`${dataValue.toString("hex").toUpperCase()} ${dataOffset}`);
                dataValue = IFD.slice(dataOffset - TIFFHeaderLength, dataOffset + dataLength - TIFFHeaderLength);//here
            }
            let tagValue;
            if (tagName) {
                switch (dataFormat) {
                    case 1:
                        tagValue = dataValue.readUInt8();
                        break;
                    case 2:
                        tagValue = dataValue.toString("ascii").replace(/\u0000/g, "").trim();
                        break;
                    case 3:
                        tagValue = order ? dataValue.readUInt16LE() : dataValue.readUInt16BE();
                        break;
                    case 4:
                        tagValue = order ? dataValue.readUInt32LE() : dataValue.readUInt32BE();
                        break;
                    case 5:
                        tagValue = [];
                        for (let i = 0; i < dataValue.length; i += 8) {
                            tagValue.push(order ? dataValue.readUInt32LE(i) / dataValue.readUInt32LE(i + 4) : dataValue.readUInt32BE(i) / dataValue.readUInt32BE(i + 4));
                        }
                        break;
                    case 7:
                        switch (tagName) {
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
                    case 10:
                        tagValue = order ? dataValue.readInt32LE(0) / dataValue.readInt32LE(4) : dataValue.readInt32BE(0) / dataValue.readInt32BE(4);
                        break;
                    default:
                        tagValue = "0x" + dataValue.toString("hex");
                        break;
                }
                if (!exif) {
                    exif = {};
                }
                exif[tagName] = tagValue;
                if(dataLength>4) {
                    //console.log(`${entry.toString("hex", 0, 2).toUpperCase()} ${entry.toString("hex", 2, 4).toUpperCase()} ${entry.toString("hex", 4, 8).toUpperCase()} ${entry.toString("hex", 8, 12).toUpperCase()}`);
                    console.log(`${tagName} : ${tagValue} > ${dataValue.toString("hex").toUpperCase()}`);
                }

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
                console.log(IFD.toString("hex", 0, 80).toUpperCase());
                let exif = IFDHandler(IFD, tags.ifd, order);
                if (exif && exif.ExifOffset) {
                    IFD = data.slice(parseInt(exif.ExifOffset, 10)+30);
                    console.log(IFD.toString("hex", 0, 80).toUpperCase());
                    exif.SubExif = IFDHandler(IFD, tags.ifd, order);
                }
                //return exif;
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