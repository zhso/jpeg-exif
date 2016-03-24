"use strict";
const exif = require("./../index.js");
const expect = require("chai").expect;
describe(".parse()", () => {
    it("file {undefined}", ()=> {
        expect(exif.parse).to.throw(Error);
    });
    it("APP:#0xffe1", done=> {
        exif.parse("./IMG_0001.JPG", (err, data) => {
            expect(data).to.be.an("object");
            done();
        });
    });
});
describe(".parseSync()", ()=> {
    it("file {undefined}", ()=> {
        expect(exif.parseSync).to.throw(Error);
    });
    it("APP1:#0xffe1", ()=> {
        let data = exif.parseSync("./test/IMG_0001.JPG");
        expect(data).to.be.an("object");
    });
    it("[SubExif]", ()=> {
        let data = exif.parseSync("./test/IMG_0001.JPG");
        expect(data.SubExif).to.be.an("object");
    });
    it("[GPSInfo]", ()=> {
        let data = exif.parseSync("./test/IMG_0001.JPG");
        expect(data.GPSInfo).to.be.an("object");
    });
    it("!APP1:#0xffe1", ()=> {
        let data = exif.parseSync("./test/IMG_0003.JPG");
        expect(data).to.be.an("undefined");
    });
});