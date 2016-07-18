"use strict";
let BT = new Date();
let debug = true;
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
let data;
function fixPad(value, length) {
    let diff = length - value.toString().length;
    let padding = " ";
    let i = 0;
    let str = "";
    for (i; i < diff; i++) {
        str += padding;
    }
    return value + str;
}
function isValid(buffer) {
    let SOIMarker = buffer.readUInt16BE();
    debug && console.log(`
┌───────────────────────┬─────────────┬─────────────┐
│ Name                  │ Size(Bytes) │ Value       │
├───────────────────────┴─────────────┴─────────────┤
│ SOI Header                                        │
│┌──────────────────────┬─────────────┬────────────┐│
││ Start Of Image       │ 2           │ 0x${buffer.toString("hex", 0, SOIMarkerLength).toUpperCase()}     ││
│└──────────────────────┴─────────────┴────────────┘│`);
    return SOIMarker === JPEGSOIMarker ? true : false;
}
function checkAPPn(buffer) {
    let APPMarkerTag = buffer.readUInt16BE();
    return APPMarkerTag >= APPMarkerBegin && APPMarkerTag <= APPMarkerEnd ? APPMarkerTag - APPMarkerBegin : false;
}
function EXIFHandler(buffer) {
    let APP1Marker = buffer.toString("hex", 0, APPMarkerLength);
    let originBuffer = buffer;
    buffer = buffer.slice(APPMarkerLength);
    let length = buffer.readUInt16BE();
    buffer = buffer.slice(0, length);
    const lengthLength = 2;
    buffer = buffer.slice(lengthLength);
    const identifierLength = 5;
    let identifier = buffer.toString("ascii", 0, identifierLength);
    buffer = buffer.slice(identifierLength);
    //<Pad>
    const padLength = 1;
    let pad = buffer.toString("hex", 0, padLength);
    buffer = buffer.slice(padLength);
    //</Pad>
    //<TIFF Headers>
    const byteOrderLength = 2;
    let byteOrder = buffer.toString("ascii", 0, byteOrderLength) === "MM";
    //<42>
    const fortyTwoLength = 2;
    let fortyTwoEnd = byteOrderLength + fortyTwoLength;
    //</42>
    let offsetOfIFD = byteOrder ? buffer.readUInt16BE(fortyTwoEnd) : buffer.readUInt16LE(fortyTwoEnd);
    debug && console.log(`├───────────────────────────────────────────────────┤
│ APP1 Marker                                       │
│┌──────────────────────┬─────────────┬────────────┐│
││ APP1 Marker          │ 2           │ 0x${fixPad(APP1Marker.toUpperCase(), 8)} ││
│├──────────────────────┼─────────────┼────────────┤│
││ Length of field      │ 2           │ ${fixPad(length, 10)} ││
│├──────────────────────┼─────────────┼────────────┤│
││ Exif Identifier Code │ 5           │ ${fixPad(identifier.replace("\u0000", ""), 10)} ││
│├──────────────────────┼─────────────┼────────────┤│
││ Padding              │ 1           │ 0x${fixPad(pad, 8)} ││
│├──────────────────────┴─────────────┴────────────┤│
││ TIFF Header                                     ││
││┌─────────────────────┬─────────────┬───────────┐││
│││ Byte Order          │ 2           │ ${fixPad(buffer.toString("ascii", 0, byteOrderLength), 9)} │││
││├─────────────────────┼─────────────┼───────────┤││
│││ 42                  │ 2           │ ${fixPad(byteOrder ? buffer.readUInt16BE(byteOrderLength) : buffer.readUInt16LE((byteOrderLength)), 9)} │││
││├─────────────────────┼─────────────┼───────────┤││
│││ Offset of IFD       │ 4           │ ${fixPad(offsetOfIFD, 9)} │││
││└─────────────────────┴─────────────┴───────────┘││
│└─────────────────────────────────────────────────┘│`);
    //</TIFF Headers>
    buffer = buffer.slice(TIFFHeaderLength + offsetOfIFD);
    if (buffer.length > 0) {
        data = IFDHandler(buffer, tags.ifd, byteOrder);
        if (data.ExifOffset) {
            buffer = buffer.slice(data.ExifOffset - TIFFHeaderLength);//?????????????????????????????????????????????????
            data.SubExif = IFDHandler(buffer, tags.ifd, byteOrder);
        }
    }
}
function APPnHandler(buffer) {
    let APPMarkerTag = checkAPPn(buffer);
    if (APPMarkerTag !== false) {//APP0 is 0, and 0==false
        //buffer = buffer.slice(APPMarkerLength);
        let length = buffer.readUInt16BE(APPMarkerLength);
        switch (APPMarkerTag) {
            case 1: //EXIF
                EXIFHandler(buffer);
                break;
            default:
                console.log(`├───────────────────────────────────────────────────┤
│ APP${fixPad(APPMarkerTag, 2)} Header                                      │
│┌──────────────────────┬─────────────┬────────────┐│
││ APP${fixPad(APPMarkerTag, 2)} Marker         │ 2           │ 0xFFE${fixPad(APPMarkerTag.toString(16).toUpperCase(), 5)} ││
│├──────────────────────┼─────────────┼────────────┤│
││ Length of field      │ 2           │ ${fixPad(length, 10)} ││
│└──────────────────────┴─────────────┴────────────┘│`);
                console.log(buffer.slice(APPMarkerLength, APPMarkerLength + length));
                console.log(buffer.slice(APPMarkerLength, APPMarkerLength + length).toString("ascii"));
                break;
        }
        buffer = buffer.slice(APPMarkerLength + length);
        APPnHandler(buffer);
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
function IFDHandler(buffer, tags, order) {
    let entriesNumber = order ? buffer.readUInt16BE() : buffer.readUInt16LE();
    if (entriesNumber === 0) {
        return {};
    }
    let entriesNumberLength = 2;
    let entries = buffer.slice(entriesNumberLength);
    const entryLength = 12;
    //let nextIFDPointerBegin = entriesNumberLength + entryLength * entriesNumber;
    //let nextIFDPointer = order ? buffer.readUInt32BE(nextIFDPointerBegin) : buffer.readUInt32LE(nextIFDPointerBegin);
    try {
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
            let tagNumber = order ? tagAddress.toString("hex") : tagAddress.reverse().toString("hex");
            let tagName = tags[tagNumber];
            let dataFormat = order ? entry.readUInt16BE(dataFormatBegin) : entry.readUInt16LE(dataFormatBegin);
            let componentsByte = bytes[dataFormat];
            let componentsNumber = order ? entry.readUInt32BE(componentsBegin) : entry.readUInt32LE(componentsBegin);
            let dataLength = componentsNumber * componentsByte;
            let dataValue = entry.slice(dataValueBegin, dataValueBegin + dataValueLength);
            if (dataLength > 4) {
                let dataOffset = order ? dataValue.readUInt32BE() : dataValue.readUInt32LE();
                dataValue = buffer.slice(dataOffset - TIFFHeaderLength, dataOffset + dataLength - TIFFHeaderLength);
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
                        tagValue = order ? dataValue.readUInt16BE() : dataValue.readUInt16LE();
                        break;
                    case 4:
                        tagValue = order ? dataValue.readUInt32BE() : dataValue.readUInt32LE();
                        break;
                    case 5:
                        tagValue = [];
                        for (let i = 0; i < dataValue.length; i += 8) {
                            tagValue.push(order ? dataValue.readUInt32BE(i) / dataValue.readUInt32BE(i + 4) : dataValue.readUInt32LE(i) / dataValue.readUInt32LE(i + 4));
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
                        tagValue = order ? dataValue.readInt32BE() / dataValue.readInt32BE(4) : dataValue.readInt32LE() / dataValue.readInt32LE(4);
                        break;
                    default:
                        tagValue = "0x" + dataValue.toString("hex");
                        break;
                }
                exif[tagName] = tagValue;
            } else {
                throw new Error(`Unkown Tag [0x${tagNumber}].`);
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
        APPnHandler(buffer);
    } else {
        throw new Error("Invalid JPEG file.");
    }
    let ET = new Date();
    console.log(`└───────────────────────────────────────────────────┘
${ET - BT}ms`);
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