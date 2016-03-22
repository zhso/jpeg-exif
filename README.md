# jpeg-exif
Get exif information from jpeg format file.

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