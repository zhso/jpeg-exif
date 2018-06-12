# jpeg-exif
Get exif information from jpeg format file.

[![npm](https://img.shields.io/npm/dm/jpeg-exif.svg)][npm-url] [![Inline docs](http://inch-ci.org/github/zhso/jpeg-exif.svg?branch=master&style=shields)](http://inch-ci.org/github/zhso/jpeg-exif) [![Build Status](https://travis-ci.org/zhso/jpeg-exif.svg?branch=master)](https://travis-ci.org/zhso/jpeg-exif) [![Coverage Status](https://coveralls.io/repos/github/zhso/jpeg-exif/badge.svg?branch=master)](https://coveralls.io/github/zhso/jpeg-exif?branch=master)

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

* Support All CP3451 Standard Tags (Include GPS & SubExif Tags)
* Support Both Sync & Async Method

## Installation

```bash
$ npm i jpeg-exif
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
