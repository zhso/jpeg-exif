# jpeg-exif
Get exif information from jpeg format file.

[![NPM](https://nodei.co/npm/jpeg-exif.png?downloads=true&downloadRank=true&stars=true)][npm-url] [![NPM](https://nodei.co/npm-dl/jpeg-exif.png?height=3&months=6)][npm-url]

[![npm](https://img.shields.io/npm/v/jpeg-exif.svg)][npm-url] [![npm](https://img.shields.io/npm/dm/jpeg-exif.svg)][npm-url][![npm](https://david-dm.org/zhso/jpeg-exif.svg)][npm-url] [![npm](https://img.shields.io/npm/l/jpeg-exif.svg)][npm-url]

[![bitHound Overall Score](https://www.bithound.io/github/zhso/jpeg-exif/badges/score.svg)](https://www.bithound.io/github/zhso/jpeg-exif)

[![GitHub stars](https://img.shields.io/github/stars/zhso/jpeg-exif.svg?style=social&label=Star)](https://github.com/zhso/jpeg-exif/stargazers) [![GitHub watchers](https://img.shields.io/github/watchers/zhso/jpeg-exif.svg?style=social&label=Watch)](https://github.com/zhso/jpeg-exif/subscription)

[npm-url]: https://npmjs.org/package/jpeg-exif
### Async

```js
const exif = require("jpeg-exif");
let file = "~/Photo/IMG_0001.JPG";
exif.parse(file, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
});
```

### Sync

```js
const exif = require("jpeg-exif");
let file = "~/Photo/IMG_0001.JPG";
let data=exif.parseSync(file);
console.log(data);
```

## Features

* Support More Than 450 Exif Tags
* Support GPSInfo Tags
* Support Sync Method

## Installation

```bash
$ npm install jpeg-exif
```

## Callback Data Format

```js
{
    "Make": "Apple",
    "Model": "Apple",
    //...
    "SubExif": [
        "DateTimeOriginal": "2015:10:06 17:19:36",
        "CreateDate": "2015:10:06 17:19:36",
        //...
    ],
    "GPSInfo":[
        "GPSLatitudeRef": "N",
        "GPSLatitude": [ 35, 39, 40.08 ],
	    //...
    ]
}
```