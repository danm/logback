"use strict";

const expect = require('chai').expect;
const sinon = require('sinon');

const request = require('request');
const Logback = require('../index');
const fs = require('fs');

describe('File output', function() {
    it('should throw an error if no fs write access', function() {
        const c = new Logback('logback test', __dirname + '/noaccess.csv', 'csv');
        expect(function() {
            //act
            c.a('Message', 1, 'File');
        }).to.throw();
    });

    it('should output a file to a specific location', function() {
        //arrange
        if (fs.existsSync(__dirname + '/output.csv')) {
            fs.unlinkSync(__dirname + '/output.csv');
        }
        const c = new Logback('logback test', __dirname + '/output.csv', 'csv');
        //act
        c.a('Message', 1, 'File');
        //assert
        let file = fs.readFileSync(__dirname + '/output.csv');
        expect(file.toString()).to.equal(new Date() + ',info,Message,File,' + c.id + ',logback test\n');
    });

    it('should output allow a single argument', function() {
        //arrange
        if (fs.existsSync(__dirname + '/output.csv')) {
            fs.unlinkSync(__dirname + '/output.csv');
        }
        const c = new Logback('logback test', __dirname + '/output.csv', 'csv');
        //act
        c.a('This is a test');
        //assert
        let file = fs.readFileSync(__dirname + '/output.csv');
        expect(file.toString()).to.equal(new Date() + ',info,This is a test,,' + c.id + ',logback test\n');
    });

    it('should output log different types', function() {
        let expected;
        //arrange
        if (fs.existsSync(__dirname + '/output.csv')) {
            fs.unlinkSync(__dirname + '/output.csv');
        }
        const c = new Logback('logback test', __dirname + '/output.csv', 'csv');

        //act
        c.a('This is an info test', 1);
        c.a('This is a warning test', 2);
        c.a('This is an error test', 3);
        c.a('This is a custom number test', 4);
        c.a('This is a custom type test', 'custom');

        //assert
        expected = new Date() + ",info,This is an info test,," + c.id + ",logback test\n";
        expected += new Date() + ",warning,This is a warning test,," + c.id + ",logback test\n";
        expected += new Date() + ",error,This is an error test,," + c.id + ",logback test\n";
        expected += new Date() + ",4,This is a custom number test,," + c.id + ",logback test\n";
        expected += new Date() + ",custom,This is a custom type test,," + c.id + ",logback test\n";

        let file = fs.readFileSync(__dirname + '/output.csv');
        expect(file.toString()).to.equal(expected);
    });

    it('should send data to text file using object config', function() {
        let expected;

        //arrange
        if (fs.existsSync(__dirname + '/object.csv')) {
            fs.unlinkSync(__dirname + '/object.csv');
        }
        const loc = {
            file: {
                location: __dirname + '/object.csv',
                level: 0
            }
        };
        const c = new Logback('logback test', loc, 'csv');
        //act
        c.a('This is a test');
        //assert
        let file = fs.readFileSync(__dirname + '/object.csv');
        expect(file.toString()).to.equal(new Date() + ',info,This is a test,,' + c.id + ',logback test\n');

    });

    it('should send data to stdout using object', function() {

        let expected;
        //arrange
        //process.stdout.write(`${msg}\n`);
        let spy = sinon.spy(process.stdout, 'write');

        const loc = {
            stdout: {
                level: 0
            }
        };
        const c = new Logback('logback test', loc, 'json');
        //act
        c.a('hello');
        //assert
        // console.log(process.stdout.write.calledOnce);
        expect(spy.calledOnce).to.be.true;
    });

    it('should provide memory debugging', function() {

        let expected;

        //arrange
        if (fs.existsSync(__dirname + '/object.csv')) {
            fs.unlinkSync(__dirname + '/object.csv');
        }
        const loc = {
            file: {
                location: __dirname + '/object.csv',
                level: 0
            }
        };
        const c = new Logback('logback test', loc, 'csv');
        //act
        c.m();
        //assert
        let file = fs.readFileSync(__dirname + '/object.csv');
        expect(file.toString()).to.equal(new Date() + ',info,This is a test,,' + c.id + ',logback test\n');
    });

    //add your endpoint here
    xit('should send data to elastic using object config', function() {
        let expected;
        //arrange
        const loc = {
            elastic: {
                endpoint: '',
                level: 0
            }
        };
        const c = new Logback('logback test', loc, 'json');
        //act
        c.a('This is a test');
        //assert
    });


    //add your cloudwatch data here
    xit('should send data to cloudwatch using object config', function() {
        let expected;
        //arrange
        const c = new Logback('logback test', { cloudwatch: { level: 0, logGroupName: 'Logback', logStreamName: 'logback-test', region: 'eu-west-1', accessKeyId: '', secretAccessKey: '' } }, 'json');

        //act
        c.a('This is a test');
        //assert
    });


});