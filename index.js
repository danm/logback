'use strict';

const fs = require('fs');
const Console = require('console');

module.exports = class Logback {
	constructor(app, loc, output) {
		this.application = app;
		this.output = output || 'json';
		this.loc = loc || __dirname + '/output.' + this.output;
	}

	a(message, type, file) {
		let log  			= {
			date:null,
			type:null,
			message:null,
			file:null
		}; //object
		let outputs		= ''; //string

		if (type !== undefined && typeof type === 'number') {
			switch(type) {
				case 1 : { log.type = 'info'; 		break; }
				case 2 : { log.type = 'warning'; 	break; }
				case 3 : { log.type = 'error'; 		break; }
				default: { log.type = type; }
			}
		} else {
				log.type 			= (type) ? type : 'info';
		}

		log.date 			= new Date();
		log.message 	= (message) ? message : '';
		log.file 			= (file) ? file : '';

		//what is the output of this log
		if (this.output === 'json') {
			//convert the object to string
			outputs = JSON.stringify(log);
		} else {
			//loop through the log object
			for (let cell in log) {
				//create csv
				outputs += log[cell] + ',';
			}
			//remove the last commor of the line
			outputs = outputs.substring(0, outputs.length - 1);
		}
		//add ending new line
		outputs += '\n';
		//append line to log file
		try {
				fs.appendFileSync(this.loc, outputs);
		} catch(e) {
			throw new Error('Could not access file, your script may not have permission to the file', e);
		}

	}

	l() {
		for (var i = 0; i < arguments.length; i++) {
			Console.log(arguments[i]);
		}
	}

	w() {
		for (var i = 0; i < arguments.length; i++) {
			Console.warn(arguments[i]);
		}
	}

	i() {
		for (var x = 0; x < arguments.length; x++) {
			Console.info(arguments[x]);
		}
	}

	d(obj, opts) {
		Console.dir(obj, opts);
	}
};
