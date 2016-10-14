"use strict";

const chai 				= require('chai');
const expect 			= chai.expect;
const Logback			= require('../index');
const fs 					= require('fs');

describe('File output', function() {
	it('should throw an error if no fs write access', function() {
		const c = new Logback('logback test', __dirname + '/noaccess.csv', 'csv');
		expect(function() {
			//act
			c.a('This is a test','so is this','and this');
		}).to.throw();
	});

	it('should output a file to a specific location', function() {
		//arrange
		if (fs.existsSync(__dirname + '/output.csv')) {
			fs.unlinkSync(__dirname + '/output.csv');
		}
		const c = new Logback('logback test', __dirname + '/output.csv', 'csv');
		//act
		c.a('This is a test','so is this','and this');
		//assert
		let file = fs.readFileSync(__dirname + '/output.csv');
		expect(file.toString()).to.equal(new Date()+',so is this,This is a test,and this\n');
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
		expect(file.toString()).to.equal(new Date()+',info,This is a test,\n');
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
		expected = new Date() + ",info,This is an info test,\n";
		expected += new Date() + ",warning,This is a warning test,\n";
		expected += new Date() + ",error,This is an error test,\n";
		expected += new Date() + ",4,This is a custom number test,\n";
		expected += new Date() + ",custom,This is a custom type test,\n";

		let file = fs.readFileSync(__dirname + '/output.csv');
		expect(file.toString()).to.equal(expected);
	});
});
