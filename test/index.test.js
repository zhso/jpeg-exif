'use strict';
const exif = require('./../index.js');
let expect = require('chai').expect;
describe('.parse()', () => {
    it('file {undefined}', () => {
        exif.parse(undefined, err => {
            expect(err).to.throw(Error);
        });
    });
    it('file {null}', () => {
        exif.parse('./test/null.jpg', err => {
            expect(err).to.throw(Error);
        })
    });
    it('APP1:#0xffe1', done => {
        exif.parse('./test/IMG_0001.JPG', (err, data) => {
            expect(data).to.be.an("object");
            done();
        });
    });
    it('APP0:#0xffe0', done => {
        exif.parse('./test/IMG_0003.JPG', (err, data) => {
            expect(data).to.be.an('undefined');
            done();
        });
    });
    it('!(APP1:#0xffe1||APP0:#0xffe0)', done => {
        exif.parse('./test/index.test.js', (err, data) => {
            expect(data).to.be.an('undefined');
            done();
        });
    });
    it('[SubExif]', done => {
        exif.parse('./test/IMG_0001.JPG', (err, data) => {
            expect(data.SubExif).to.be.an('object');
            done();
        });
    });
    it('[GPSInfo]', done => {
        exif.parse('./test/IMG_0001.JPG', (err, data) => {
            expect(data.GPSInfo).to.be.an('object');
            done();
        });
    });
});
describe('.parseSync()', () => {
    it('file {undefined}', () => {
        expect(exif.parseSync).to.throw(Error);
    });
    it('file {null}', () => {
        expect(exif.parseSync).to.throw(Error);
    });
    it('APP1:#0xffe1', () => {
        let data = exif.parseSync('./test/IMG_0001.JPG');
        expect(data).to.be.an('object');
    });
    it('!APP1:#0xffe1', () => {
        let data = exif.parseSync('./test/IMG_0003.JPG');
        expect(data).to.be.an('object');
    });
    it('[SubExif]', () => {
        let data = exif.parseSync('./test/IMG_0001.JPG');
        expect(data.SubExif).to.be.an('object');
    });
    it('[GPSInfo]', () => {
        let data = exif.parseSync('./test/IMG_0001.JPG');
        expect(data.GPSInfo).to.be.an('object');
    });
});
