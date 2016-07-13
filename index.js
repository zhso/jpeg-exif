"use strict";
const tags = require("./tags.json");
//unsignedByte,asciiStrings,unsignedShort,unsignedLong,unsignedRational,signedByte,undefined,signedShort,signedLong,signedRational,singleFloat,doubleFloat;
const bytes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
const fs = require("fs");
//Header
const APP1DataSizeLength = 2;
const EXIFHeaderLength = 6;
const TIFFHeaderLength = 8;
//APP
const SOIMarkerLength = 2;
const JPEGSOIMarker = 0xffd8;
const APPMarkerLength = 2;
const APPMarkerBegin = 0xffe0;
const APPMarkerEnd = 0xffef;
const JFIFMarker = 0xffe0;
const EXIFMarker = 0xffe1;
let data;
function isValid(buffer) {
    let SOIMarker = buffer.readUInt16BE();
    return SOIMarker === JPEGSOIMarker ? true : false;
}
function checkAPPn(buffer) {
    let APPMarkerTag = buffer.readUInt16BE();
    return APPMarkerTag > APPMarkerBegin && APPMarkerTag < APPMarkerEnd ? APPMarkerTag : false;
}
function JFIFHandler(buffer) {

}
function EXIFHandler(buffer) {
    let length=buffer.readUInt16BE(APPMarkerLength);
    console.log(length);
    const lengthLength=2;
    const identifierLength=5;
    let identifier=buffer.toString("ascii",APPMarkerLength+lengthLength,APPMarkerLength+lengthLength+5);
    console.log(identifier);
    console.log(buffer.toString("hex",APPMarkerLength,20));
    console.log(marker.length);
    console.log(buffer);
}
function APPHandler(buffer, markerTag) {
    switch (markerTag) {
        case JFIFMarker:
            JFIFHandler(buffer);
            break;
        case EXIFMarker:
            EXIFHandler(buffer);
            break;
        default:
            throw new Error("Unsupport APPn Marker.");
            break;
    }
}
/**
 * @param IFD {Buffer}
 * @param tags {Object}
 * @param order {Boolean}
 * @param offset {Number}
 * @returns {Object}
 * @example
 * var content = fs.readFileSync("~/Picture/IMG_0911.JPG");
 * var exifFragments = ifds(content, 0, [{ "key": "value" }], true);
 * console.log(exifFragments.value);
 */
function IFDHandler(IFD, tags, order, offset) {
    let entriesNumber = order ? IFD.readUInt16LE(0) : IFD.readUInt16BE(0);
    console.log(entriesNumber);
    let entriesBegin = 2;
    let entries = IFD.slice(entriesBegin);
    let entryCount = 0;
    const entryLength = 12;
    /*
     const nextOffsetLength = 4;
     let nextOffsetBegin = entriesBegin + entriesNumber * entryLength;
     let nextOffset=order ? IFD.readUInt16LE(nextOffsetBegin, nextOffsetBegin + nextOffsetLength) : IFD.readUInt16BE(nextOffsetBegin, nextOffsetBegin + nextOffsetLength));
     */
    try {
        let exif;
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
                let dataOffset = order ? dataValue.readUInt32LE(0) : dataValue.readUInt32BE(0);
                dataValue = IFD.slice(dataOffset - offset, dataOffset + dataLength - offset);
            }
            let tagValue;
            if (tagName) {
                switch (dataFormat) {
                    case 1:
                        tagValue = dataValue.readUInt8(0);
                        break;
                    case 2:
                        tagValue = dataValue.toString("ascii").replace(/\u0000/g, "").trim();
                        break;
                    case 3:
                        tagValue = order ? dataValue.readUInt16LE(0) : dataValue.readUInt16BE(0);
                        break;
                    case 4:
                        tagValue = order ? dataValue.readUInt32LE(0) : dataValue.readUInt32BE(0);
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
            } else {
                throw new Error("Unkown tag.");
            }
        }
        return exif;
    } catch (err) {
        throw new Error(err);
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
        throw new Error("File not found.");
    }
    let buffer = fs.readFileSync(file);
    if (isValid(buffer)) {
        buffer = buffer.slice(SOIMarkerLength);
        data = {};
        let APPMarkerTag = checkAPPn(buffer);
        if (APPMarkerTag) {
            APPHandler(buffer, APPMarkerTag);
        }
    } else {
        throw new Error("Invalid JPEG file.");
    }
    return data;
    //const BEByteOrder = "MM";
    const LEByteOrder = "II";
    const IFD1OffsetLength = 4;
    let APP1HeaderEnd = SOIMarkerLength + APPMarkerLength + APP1DataSizeLength + EXIFHeaderLength;
    //let APP1Header = data.toString("ascii", APP1MarkerEnd + APP1DataSizeLength, APP1HeaderEnd);//EXIF
    const byteOrderLength = 2;
    let TIFFHeaderEnd = APP1HeaderEnd + TIFFHeaderLength;
    let byteOrder = data.toString("ascii", APP1HeaderEnd, APP1HeaderEnd + byteOrderLength);
    let order = byteOrder === LEByteOrder;
    let IFD0Offset = order ? data.readUInt32LE(TIFFHeaderEnd - IFD1OffsetLength) : data.readUInt32BE(TIFFHeaderEnd - IFD1OffsetLength);
    let IFD = data.slice(APP1HeaderEnd + IFD0Offset);
    let exif = IFDHandler(IFD, tags.ifd, order, IFD0Offset);
    if (exif && exif.ExifOffset) {
        IFD = data.slice(parseInt(exif.ExifOffset, 10) + 30);//?????????????????????????????????????????????????
        exif.SubExif = IFDHandler(IFD, tags.ifd, order, exif.ExifOffset);
    }
    return exif;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let APP0Length = data.readUInt16BE(SOIMarkerLength + APPMarkerLength);
    console.log(APP0Length);
    let APP0End = SOIMarkerLength + APPMarkerLength + APP0Length;
    let APP1MarkerEnd = APP0End + APPMarkerLength;
    let APP1Marker = data.toString("hex", APP0End, APP1MarkerEnd);
    if (APP1Marker === EXIFMarker) {
        //const BEByteOrder = "MM";
        const LEByteOrder = "II";
        const IFD1OffsetLength = 4;
        let APP1HeaderEnd = APP1MarkerEnd + APP1DataSizeLength + EXIFHeaderLength;
        //let APP1Header = data.toString("ascii", APP1MarkerEnd + APP1DataSizeLength, APP1HeaderEnd);//EXIF
        const byteOrderLength = 2;
        let TIFFHeaderEnd = APP1HeaderEnd + TIFFHeaderLength;
        let byteOrder = data.toString("ascii", APP1HeaderEnd, APP1HeaderEnd + byteOrderLength);
        let order = byteOrder === LEByteOrder;
        let IFD0Offset = order ? data.readUInt32LE(TIFFHeaderEnd - IFD1OffsetLength) : data.readUInt32BE(TIFFHeaderEnd - IFD1OffsetLength);
        let IFD = data.slice(APP1HeaderEnd + IFD0Offset);
        let exif = IFDHandler(IFD, tags.ifd, order, IFD0Offset);
        if (exif && exif.ExifOffset) {
            IFD = data.slice(parseInt(exif.ExifOffset, 10) + 30);//?????????????????????????????????????????????
            exif.SubExif = IFDHandler(IFD, tags.ifd, order, exif.ExifOffset);
        }
        return exif;
    } else {
        return {};
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
                            resolve(exif);
                        } else {
                            resolve({});
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
                            let exif = IFDHandler(IFD, tags.ifd, order, IFD0Offset);
                            if (exif && exif.ExifOffset) {
                                IFD = data.slice(parseInt(exif.ExifOffset, 10) + 30);//?????????????????????????????????
                                exif.SubExif = IFDHandler(IFD, tags.ifd, order, exif.ExifOffset);
                            }
                            if (exif && exif.GPSInfo) {
                                exif.GPSInfo = ifds(data, parseInt(exif.GPSInfo, 10) + 12, tags.gps, direction);//??????
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