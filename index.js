"use strict";
const ifdTags = {
    "0001": "InteropIndex",
    "0002": "InteropVersion",
    "000b": "ProcessingSoftware",
    "00fe": "SubfileType",
    "00ff": "OldSubfileType",
    "0100": "ImageWidth",
    "0101": "ImageHeight",
    "0102": "BitsPerSample",
    "0103": "Compression",
    "0106": "PhotometricInterpretation",
    "0107": "Thresholding",
    "0108": "CellWidth",
    "0109": "CellLength",
    "010a": "FillOrder",
    "010d": "DocumentName",
    "010D": "DocumentName",
    "010e": "ImageDescription",
    "010f": "Make",
    "0110": "Model",
    "0111": "StripOffsets",
    "0112": "Orientation",
    "0115": "SamplesPerPixel",
    "0116": "RowsPerStrip",
    "0117": "StripByteCounts",
    "0118": "MinSampleValue",
    "0119": "MaxSampleValue",
    "011a": "XResolution",
    "011b": "YResolution",
    "011c": "PlanarConfiguration",
    "011d": "PageName",
    "011D": "PageName",
    "011e": "XPosition",
    "011E": "XPosition",
    "011f": "YPosition",
    "011F": "YPosition",
    "0120": "FreeOffsets",
    "0121": "FreeByteCounts",
    "0122": "GrayResponseUnit",
    "0123": "GrayResponseCurve",
    "0124": "T4Options",
    "0125": "T6Options",
    "0128": "ResolutionUnit",
    "0129": "PageNumber",
    "012c": "ColorResponseUnit",
    "012d": "TransferFunction",
    "012D": "TransferFunction",
    "0131": "Software",
    "0132": "ModifyDate",
    "013b": "Artist",
    "013c": "HostComputer",
    "013d": "Predictor",
    "013D": "Predictor",
    "013e": "WhitePoint",
    "013E": "WhitePoint",
    "013f": "PrimaryChromaticities",
    "013F": "PrimaryChromaticities",
    "0140": "ColorMap",
    "0141": "HalftoneHints",
    "0142": "TileWidth",
    "0143": "TileLength",
    "0144": "TileOffsets",
    "0145": "TileByteCounts",
    "0146": "BadFaxLines",
    "0147": "CleanFaxData",
    "0148": "ConsecutiveBadFaxLines",
    "014a": "SubIFD",
    "014A": "SubIFDs",
    "014c": "InkSet",
    "014C": "InkSet",
    "014d": "InkNames",
    "014D": "InkNames",
    "014e": "NumberofInks",
    "014E": "NumberOfInks",
    "0150": "DotRange",
    "0151": "TargetPrinter",
    "0152": "ExtraSamples",
    "0153": "SampleFormat",
    "0154": "SMinSampleValue",
    "0155": "SMaxSampleValue",
    "0156": "TransferRange",
    "0157": "ClipPath",
    "0158": "XClipPathUnits",
    "0159": "YClipPathUnits",
    "015a": "Indexed",
    "015A": "Indexed",
    "015b": "JPEGTables",
    "015B": "JPEGTables",
    "015f": "OPIProxy",
    "015F": "OPIProxy",
    "0190": "GlobalParametersIFD",
    "0191": "ProfileType",
    "0192": "FaxProfile",
    "0193": "CodingMethods",
    "0194": "VersionYear",
    "0195": "ModeNumber",
    "01b1": "Decode",
    "01B1": "Decode",
    "01b2": "DefaultImageColor",
    "01B2": "DefaultImageColor",
    "01b3": "T82Options",
    "01b5": "JPEGTables",
    "0200": "JPEGProc",
    "0201": "ThumbnailOffset",
    "0202": "ThumbnailLength",
    "0203": "JPEGRestartInterval",
    "0205": "JPEGLosslessPredictors",
    "0206": "JPEGPointTransforms",
    "0207": "JPEGQTables",
    "0208": "JPEGDCTables",
    "0209": "JPEGACTables",
    "0211": "YCbCrCoefficients",
    "0212": "YCbCrSubSampling",
    "0213": "YCbCrPositioning",
    "0214": "ReferenceBlackWhite",
    "022f": "StripRowCounts",
    "022F": "StripRowCounts",
    "02bc": "ApplicationNotes",
    "02BC": "XMP",
    "03e7": "USPTOMiscellaneous",
    "1000": "RelatedImageFileFormat",
    "1001": "RelatedImageWidth",
    "1002": "RelatedImageHeight",
    "4746": "Rating",
    "4747": "XP_DIP_XML",
    "4748": "StitchInfo",
    "4749": "RatingPercent",
    "7035": "ChromaticAberrationCorrParams",
    "7037": "DistortionCorrParams",
    "800d": "ImageID",
    "800D": "ImageID",
    "80a3": "WangTag1",
    "80a4": "WangAnnotation",
    "80a5": "WangTag3",
    "80a6": "WangTag4",
    "80b8": "ImageReferencePoints",
    "80b9": "RegionXformTackPoint",
    "80ba": "WarpQuadrilateral",
    "80bb": "AffineTransformMat",
    "80e3": "Matteing",
    "80e4": "DataType",
    "80e5": "ImageDepth",
    "80e6": "TileDepth",
    "8214": "ImageFullWidth",
    "8215": "ImageFullHeight",
    "8216": "TextureFormat",
    "8217": "WrapModes",
    "8218": "FovCot",
    "8219": "MatrixWorldToScreen",
    "821a": "MatrixWorldToCamera",
    "827d": "Model2",
    "828d": "CFARepeatPatternDim",
    "828e": "CFAPattern2",
    "828f": "BatteryLevel",
    "8290": "KodakIFD",
    "8298": "Copyright",
    "829a": "ExposureTime",
    "829d": "FNumber",
    "82a5": "MDFileTag",
    "82a6": "MDScalePixel",
    "82a7": "MDColorTable",
    "82a8": "MDLabName",
    "82a9": "MDSampleInfo",
    "82aa": "MDPrepDate",
    "82ab": "MDPrepTime",
    "82ac": "MDFileUnits",
    "830e": "PixelScale",
    "8335": "AdventScale",
    "8336": "AdventRevision",
    "835c": "UIC1Tag",
    "835d": "UIC2Tag",
    "835e": "UIC3Tag",
    "835f": "UIC4Tag",
    "83bb": "IPTC-NAA",
    "847e": "IntergraphPacketData",
    "847f": "IntergraphFlagRegisters",
    "8480": "IntergraphMatrix",
    "8481": "INGRReserved",
    "8482": "ModelTiePoint",
    "84e0": "Site",
    "84e1": "ColorSequence",
    "84e2": "IT8Header",
    "84e3": "RasterPadding",
    "84e4": "BitsPerRunLength",
    "84e5": "BitsPerExtendedRunLength",
    "84e6": "ColorTable",
    "84e7": "ImageColorIndicator",
    "84e8": "BackgroundColorIndicator",
    "84e9": "ImageColorValue",
    "84ea": "BackgroundColorValue",
    "84eb": "PixelIntensityRange",
    "84ec": "TransparencyIndicator",
    "84ed": "ColorCharacterization",
    "84ee": "HCUsage",
    "84ef": "TrapIndicator",
    "84f0": "CMYKEquivalent",
    "8546": "SEMInfo",
    "8568": "AFCP_IPTC",
    "85b8": "PixelMagicJBIGOptions",
    "85d7": "JPLCartoIFD",
    "85d8": "ModelTransform",
    "8602": "WB_GRGBLevels",
    "8606": "LeafData",
    "8649": "PhotoshopSettings",
    "8769": "ExifOffset",
    "8773": "ICC_Profile",
    "877f": "TIFF_FXExtensions",
    "8780": "MultiProfiles",
    "8781": "SharedData",
    "8782": "T88Options",
    "87ac": "ImageLayer",
    "87AC": "ImageLayer",
    "87af": "GeoTiffDirectory",
    "87b0": "GeoTiffDoubleParams",
    "87b1": "GeoTiffAsciiParams",
    "87be": "JBIGOptions",
    "8822": "ExposureProgram",
    "8824": "SpectralSensitivity",
    "8825": "GPSInfo",
    "8827": "ISO",
    "8828": "Opto-ElectricConvFactor",
    "8829": "Interlace",
    "882a": "TimeZoneOffset",
    "882b": "SelfTimerMode",
    "8830": "SensitivityType",
    "8831": "StandardOutputSensitivity",
    "8832": "RecommendedExposureIndex",
    "8833": "ISOSpeed",
    "8834": "ISOSpeedLatitudeyyy",
    "8835": "ISOSpeedLatitudezzz",
    "885c": "FaxRecvParams",
    "885d": "FaxSubAddress",
    "885e": "FaxRecvTime",
    "8871": "FedexEDR",
    "888a": "LeafSubIFD",
    "9000": "ExifVersion",
    "9003": "DateTimeOriginal",
    "9004": "CreateDate",
    "9009": "GooglePlusUploadCode",
    "9101": "ComponentsConfiguration",
    "9102": "CompressedBitsPerPixel",
    "9201": "ShutterSpeedValue",
    "9202": "ApertureValue",
    "9203": "BrightnessValue",
    "9204": "ExposureCompensation",
    "9205": "MaxApertureValue",
    "9206": "SubjectDistance",
    "9207": "MeteringMode",
    "9208": "LightSource",
    "9209": "Flash",
    "920a": "FocalLength",
    "920b": "FlashEnergy",
    "920c": "SpatialFrequencyResponse",
    "920d": "Noise",
    "920e": "FocalPlaneXResolution",
    "920f": "FocalPlaneYResolution",
    "9210": "FocalPlaneResolutionUnit",
    "9211": "ImageNumber",
    "9212": "SecurityClassification",
    "9213": "ImageHistory",
    "9214": "SubjectArea",
    "9215": "ExposureIndex",
    "9216": "TIFF-EPStandardID",
    "9217": "SensingMethod",
    "923a": "CIP3DataFile",
    "923b": "CIP3Sheet",
    "923c": "CIP3Side",
    "923f": "StoNits",
    "927c": "MakerNote",
    "9286": "UserComment",
    "9290": "SubSecTime",
    "9291": "SubSecTimeOriginal",
    "9292": "SubSecTimeDigitized",
    "932f": "MSDocumentText",
    "9330": "MSPropertySetStorage",
    "9331": "MSDocumentTextPosition",
    "935c": "ImageSourceData",
    "9c9b": "XPTitle",
    "9c9c": "XPComment",
    "9c9d": "XPAuthor",
    "9c9e": "XPKeywords",
    "9c9f": "XPSubject",
    "a000": "FlashPixVersion",
    "a001": "ColorSpace",
    "a002": "ExifImageWidth",
    "a003": "ExifImageHeight",
    "a004": "RelatedSoundFile",
    "a005": "ExifInteroperabilityOffset",
    "a20b": "FlashEnergy",
    "a20c": "SpatialFrequencyResponse",
    "a20d": "Noise",
    "a20e": "FocalPlaneXResolution",
    "a20f": "FocalPlaneYResolution",
    "a210": "FocalPlaneResolutionUnit",
    "a211": "ImageNumber",
    "a212": "SecurityClassification",
    "a213": "ImageHistory",
    "a214": "SubjectLocation",
    "a215": "ExposureIndex",
    "a216": "TIFF-EPStandardID",
    "a217": "SensingMethod",
    "a300": "FileSource",
    "a301": "SceneType",
    "a302": "CFAPattern",
    "a401": "CustomRendered",
    "a402": "ExposureMode",
    "a403": "WhiteBalance",
    "a404": "DigitalZoomRatio",
    "a405": "FocalLengthIn35mmFilm",
    "a406": "SceneCaptureType",
    "a407": "GainControl",
    "a408": "Contrast",
    "a409": "Saturation",
    "a40a": "Sharpness",
    "a40b": "DeviceSettingDescription",
    "a40c": "SubjectDistanceRange",
    "a420": "ImageUniqueID",
    "a430": "OwnerName",
    "a431": "SerialNumber",
    "a432": "LensInfo",
    "a433": "LensMake",
    "a434": "LensModel",
    "a435": "LensSerialNumber",
    "a480": "GDALMetadata",
    "a481": "GDALNoData",
    "a500": "Gamma",
    "afc0": "ExpandSoftware",
    "afc1": "ExpandLens",
    "afc2": "ExpandFilm",
    "afc3": "ExpandFilterLens",
    "afc4": "ExpandScanner",
    "afc5": "ExpandFlashLamp",
    "bc01": "PixelFormat",
    "bc02": "Transformation",
    "bc03": "Uncompressed",
    "bc04": "ImageType",
    "bc80": "ImageWidth",
    "bc81": "ImageHeight",
    "bc82": "WidthResolution",
    "bc83": "HeightResolution",
    "bcc0": "ImageOffset",
    "bcc1": "ImageByteCount",
    "bcc2": "AlphaOffset",
    "bcc3": "AlphaByteCount",
    "bcc4": "ImageDataDiscard",
    "bcc5": "AlphaDataDiscard",
    "c427": "OceScanjobDesc",
    "c428": "OceApplicationSelector",
    "c429": "OceIDNumber",
    "c42a": "OceImageLogic",
    "c44f": "Annotations",
    "c4a5": "PrintIM",
    "c573": "OriginalFileName",
    "c580": "USPTOOriginalContentType",
    "c612": "DNGVersion",
    "c613": "DNGBackwardVersion",
    "c614": "UniqueCameraModel",
    "c615": "LocalizedCameraModel",
    "c616": "CFAPlaneColor",
    "c617": "CFALayout",
    "c618": "LinearizationTable",
    "c619": "BlackLevelRepeatDim",
    "c61a": "BlackLevel",
    "c61b": "BlackLevelDeltaH",
    "c61c": "BlackLevelDeltaV",
    "c61d": "WhiteLevel",
    "c61e": "DefaultScale",
    "c61f": "DefaultCropOrigin",
    "c620": "DefaultCropSize",
    "c621": "ColorMatrix1",
    "c622": "ColorMatrix2",
    "c623": "CameraCalibration1",
    "c624": "CameraCalibration2",
    "c625": "ReductionMatrix1",
    "c626": "ReductionMatrix2",
    "c627": "AnalogBalance",
    "c628": "AsShotNeutral",
    "c629": "AsShotWhiteXY",
    "c62a": "BaselineExposure",
    "c62b": "BaselineNoise",
    "c62c": "BaselineSharpness",
    "c62d": "BayerGreenSplit",
    "c62e": "LinearResponseLimit",
    "c62f": "CameraSerialNumber",
    "c630": "DNGLensInfo",
    "c631": "ChromaBlurRadius",
    "c632": "AntiAliasStrength",
    "c633": "ShadowScale",
    "c634": "SR2Private",
    "c635": "MakerNoteSafety",
    "c640": "RawImageSegmentation",
    "c65a": "CalibrationIlluminant1",
    "c65b": "CalibrationIlluminant2",
    "c65c": "BestQualityScale",
    "c65d": "RawDataUniqueID",
    "c660": "AliasLayerMetadata",
    "c68b": "OriginalRawFileName",
    "c68c": "OriginalRawFileData",
    "c68d": "ActiveArea",
    "c68e": "MaskedAreas",
    "c68f": "AsShotICCProfile",
    "c690": "AsShotPreProfileMatrix",
    "c691": "CurrentICCProfile",
    "c692": "CurrentPreProfileMatrix",
    "c6bf": "ColorimetricReference",
    "c6c5": "SRawType",
    "c6d2": "PanasonicTitle",
    "c6d3": "PanasonicTitle2",
    "c6f3": "CameraCalibrationSig",
    "c6f4": "ProfileCalibrationSig",
    "c6f5": "ProfileIFD",
    "c6f6": "AsShotProfileName",
    "c6f7": "NoiseReductionApplied",
    "c6f8": "ProfileName",
    "c6f9": "ProfileHueSatMapDims",
    "c6fa": "ProfileHueSatMapData1",
    "c6fb": "ProfileHueSatMapData2",
    "c6fc": "ProfileToneCurve",
    "c6fd": "ProfileEmbedPolicy",
    "c6fe": "ProfileCopyright",
    "c714": "ForwardMatrix1",
    "c715": "ForwardMatrix2",
    "c716": "PreviewApplicationName",
    "c717": "PreviewApplicationVersion",
    "c718": "PreviewSettingsName",
    "c719": "PreviewSettingsDigest",
    "c71a": "PreviewColorSpace",
    "c71b": "PreviewDateTime",
    "c71c": "RawImageDigest",
    "c71d": "OriginalRawFileDigest",
    "c71e": "SubTileBlockSize",
    "c71f": "RowInterleaveFactor",
    "c725": "ProfileLookTableDims",
    "c726": "ProfileLookTableData",
    "c740": "OpcodeList1",
    "c741": "OpcodeList2",
    "c74e": "OpcodeList3",
    "c761": "NoiseProfile",
    "c763": "TimeCodes",
    "c764": "FrameRate",
    "c772": "TStop",
    "c789": "ReelName",
    "c791": "OriginalDefaultFinalSize",
    "c792": "OriginalBestQualitySize",
    "c793": "OriginalDefaultCropSize",
    "c7a1": "CameraLabel",
    "c7a3": "ProfileHueSatMapEncoding",
    "c7a4": "ProfileLookTableEncoding",
    "c7a5": "BaselineExposureOffset",
    "c7a6": "DefaultBlackRender",
    "c7a7": "NewRawImageDigest",
    "c7a8": "RawToPreviewGain",
    "c7b5": "DefaultUserCrop",
    "ea1c": "Padding",
    "ea1d": "OffsetSchema",
    "fde8": "OwnerName",
    "fde9": "SerialNumber",
    "fdea": "Lens",
    "fe00": "KDC_IFD",
    "fe4c": "RawFile",
    "fe4d": "Converter",
    "fe4e": "WhiteBalance",
    "fe51": "Exposure",
    "fe52": "Shadows",
    "fe53": "Brightness",
    "fe54": "Contrast",
    "fe55": "Saturation",
    "fe56": "Sharpness",
    "fe57": "Smoothness",
    "fe58": "MoireFilter"
};
const gpsTags = {
    "0000": "GPSVersionID",
    "0001": "GPSLatitudeRef",
    "0002": "GPSLatitude",
    "0003": "GPSLongitudeRef",
    "0004": "GPSLongitude",
    "0005": "GPSAltitudeRef",
    "0006": "GPSAltitude",
    "0007": "GPSTimeStamp",
    "0008": "GPSSatellites",
    "0009": "GPSStatus",
    "000a": "GPSMeasureMode",
    "000b": "GPSDOP",
    "000c": "GPSSpeedRef",
    "000d": "GPSSpeed",
    "000e": "GPSTrackRef",
    "000f": "GPSTrack",
    "0010": "GPSImgDirectionRef",
    "0011": "GPSImgDirection",
    "0012": "GPSMapDatum",
    "0013": "GPSDestLatitudeRef",
    "0014": "GPSDestLatitude",
    "0015": "GPSDestLongitudeRef",
    "0016": "GPSDestLongitude",
    "0017": "GPSDestBearingRef",
    "0018": "GPSDestBearing",
    "0019": "GPSDestDistanceRef",
    "001a": "GPSDestDistance",
    "001b": "GPSProcessingMethod",
    "001c": "GPSAreaInformation",
    "001d": "GPSDateStamp",
    "001e": "GPSDifferential",
    "001f": "GPSHPositioningError"
};
const dataFormat = [
    "unsigned byte",
    "ascii strings",
    "unsigned short",
    "unsigned long",
    "unsigned rational",
    "signed byte",
    "undefined",
    "signed short",
    "signed long",
    "signed rational",
    "single float",
    "double float"
];
const bytes = [1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
const fs = require("fs");
exports.parse = async;
exports.parseSync = sync;
function ifds(data, cursor, tags, direction) {
    let exif = {};
    cursor += 2;
    for (cursor; cursor < 12 * data.readUInt16BE(cursor) + cursor; cursor += 12) {
        let tagAddress = direction ? data.toString("hex", cursor, cursor + 2) : data.slice(cursor, cursor + 2).reverse().toString("hex");
        let tag = tags[tagAddress];//TTTT
        let formatValue = direction ? data.readUInt16BE(cursor + 2) - 1 : data.readUInt16LE(cursor + 2) - 1;
        let format = dataFormat[formatValue];//ffff
        let componentBytes = bytes[direction ? data.readUInt16BE(cursor + 2) - 1 : data.readUInt16LE(cursor + 2) - 1];
        let componentsNumber = direction ? data.readUInt32BE(cursor + 4) : data.readUInt32LE(cursor + 4);//NNNNNNNN
        let size = componentsNumber * componentBytes;
        let valueBuffer;
        let valueAddress;//delete
        if (size > 4) {
            let offset = direction ? data.readUInt32BE(cursor + 8) : data.readUInt32LE(cursor + 8);//DDDDDDDD
            valueBuffer = data.slice(12 + offset, 12 + offset + size);
            valueAddress = "0x" + (12 + offset).toString(16) + "-0x" + (12 + offset + size).toString(16);//delete
        } else {
            valueBuffer = data.slice(cursor + 8, cursor + 12);//DDDDDDDD
        }
        let value;
        if (tag) {
            switch (format) {
                case "unsigned byte":
                    value = valueBuffer.readUInt8(0);
                    break;
                case "ascii strings":
                    value = valueBuffer.toString("ascii").replace(/\u0000/g, "");
                    break;
                case "unsigned short":
                    value = direction ? valueBuffer.readUInt16BE(0) : valueBuffer.readUInt16LE(0);
                    break;
                case "unsigned long":
                    value = direction ? valueBuffer.readUInt32BE(0) : valueBuffer.readUInt32LE(0);
                    break;
                case "unsigned rational":
                    let length = valueBuffer.length;
                    value = [];
                    for (let i = 0; i < length; i += 8) {
                        value.push(direction ? valueBuffer.readUInt32BE(i) / valueBuffer.readUInt32BE(i + 4) : valueBuffer.readUInt32LE(i) / valueBuffer.readUInt32LE(i + 4));
                    }
                    break;
                case "undefined":
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
                            value = "0x" + valueBuffer.toString("hex");
                            break;
                    }
                    break;
                case "signed rational":
                    value = direction ? valueBuffer.readInt32BE(0) / valueBuffer.readInt32BE(4) : valueBuffer.readInt32LE(0) / valueBuffer.readInt32LE(4);
                    break;
                default:
                    value = "0x" + valueBuffer.toString("hex");
                    throw new Error("unsupport data format: " + formatValue);
                //break;
            }
            /*console.log("-----------------------------------\n"
             + tagAddress + ":" + tag
             + "\n0x" + cursor.toString(16) + "-0x" + (cursor + 12).toString(16) + ":" + data.toString("hex", cursor, cursor + 12) + ">" + componentsNumber + "*" + componentBytes
             + ( valueAddress ? "\n" + valueAddress + ":0x" + valueBuffer.toString("hex") : "")
             + "\n" + format + ":" + value
             + "\n-------------------------------------");*/
            exif[tag] = value;
        } else {
            throw new Error("unsupport exif tag: " + tagAddress);
        }
    }
    return exif;
}
function sync(file) {
    if (!file) {
        throw new Error("Please give me the file.");
    }
    //console.log(file);
    let data = fs.readFileSync(file);
    //console.log("0x00-0x02:" + "0x" + data.toString("hex", 0, 2));//SOI
    let maker = data.toString("hex", 2, 4);
    //console.log("0x02-0x04:" + "0x" + maker);//APP1
    if (maker === "ffe1") {
        //console.log("0x04-0x06:" + "0x" + data.toString("hex", 4, 6) + " | " + (data[4] * 256 + data[5]));//SSSS:Exif data area
        //console.log("0x06-0x0c:" + "0x" + data.toString("hex", 6, 12) + " | " + data.toString("ascii", 6, 12));//Exif Head
        //console.log("0x0c-0x0e:" + "0x" + data.toString("hex", 12, 14) + " | " + data.toString("ascii", 12, 14));//TTTT:MM
        //console.log("0x0e-0x10:" + "0x" + data.toString("hex", 14, 16));//0x002a
        //console.log("0x10-0x14:" + "0x" + data.toString("hex", 16, 20));//Offset to 1st. IFD
        let exif;
        let direction = true;
        if (data.toString("ascii", 12, 14) === "II") {
            direction = false;
        }
        exif = ifds(data, 20, ifdTags, direction);
        exif.SubExif = ifds(data, parseInt(exif["ExifOffset"], 10) + 12, ifdTags, direction);
        if (exif.GPSInfo) {
            exif.GPSInfo = ifds(data, parseInt(exif.GPSInfo, 10) + 12, gpsTags, direction);
        }
        return exif;
    } else if (maker === "ffe0") {
        //console.log("0x04-0x06:" + "0x" + data.toString("hex", 4, 6) + " | " + (data[4] * 256 + data[5]));//SSSS:Jfif data area
        //console.log("0x06-0x0b:" + "0x" + data.toString("hex", 6, 11) + " | " + data.toString("ascii", 6, 11));//Jfif Head
        //console.log("0x0b-0x0d:" + "0x" + data.toString("hex", 11, 13) + " | " + data.toString("ascii", 11, 13));//version
        return {};
    } else {
        throw new Error("unsupport file maker: " + maker);
        //return {};
    }
}
function async(file, callback) {
    if (!file) {
        throw new Error("Please give me the file.");
    }
    new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err);
            } else {
                //console.log("0x00-0x02:" + "0x" + data.toString("hex", 0, 2));//SOI
                let maker = data.toString("hex", 2, 4);
                //console.log("0x02-0x04:" + "0x" + maker);//APP1
                if (maker === "ffe1") {
                    //console.log("0x04-0x06:" + "0x" + data.toString("hex", 4, 6) + " | " + (data[4] * 256 + data[5]));//SSSS:Exif data area
                    //console.log("0x06-0x0c:" + "0x" + data.toString("hex", 6, 12) + " | " + data.toString("ascii", 6, 12));//Exif Head
                    //console.log("0x0c-0x0e:" + "0x" + data.toString("hex", 12, 14) + " | " + data.toString("ascii", 12, 14));//TTTT:MM
                    //console.log("0x0e-0x10:" + "0x" + data.toString("hex", 14, 16));//0x002a
                    //console.log("0x10-0x14:" + "0x" + data.toString("hex", 16, 20));//Offset to 1st. IFD
                    /*IFD0*/
                    let exif = ifds(data, 20, ifdTags);
                    exif.SubExif = ifds(data, parseInt(exif["ExifOffset"], 10) + 12, ifdTags);
                    if (exif.GPSInfo) {
                        exif.GPSInfo = ifds(data, parseInt(exif.GPSInfo, 10) + 12, gpsTags);
                    }
                    resolve(exif);
                } else if (maker === "ffe0") {
                    resolve({});
                    //console.log("0x04-0x06:" + "0x" + data.toString("hex", 4, 6) + " | " + (data[4] * 256 + data[5]));//SSSS:Jfif data area
                    //console.log("0x06-0x0b:" + "0x" + data.toString("hex", 6, 11) + " | " + data.toString("ascii", 6, 11));//Jfif Head
                    //console.log("0x0b-0x0d:" + "0x" + data.toString("hex", 11, 13) + " | " + data.toString("ascii", 11, 13));//version
                } else {
                    reject(new Error(maker + ": unsupport file maker."));
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