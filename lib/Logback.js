'use strict';

const fs = require('fs');
const Console = require('console');
const request = require('request');
const path = require('path');
const AWS = require('aws-sdk');

const fileOutput = function(loc, outputs) {
    try {
        fs.appendFileSync(loc, outputs);
    } catch (e) {
        throw new Error('Could not access file, your script may not have permission to the file', e);
    }
};

const elasticOutput = function(endpoint, outputs) {
    const config = {
        uri: endpoint + '/logback',
        method: 'POST',
        body: outputs
    };

    request(config);
};

const sqsOutput = function(sqs, queueUrl, outputs) {

    sqs.sendMessage({
            QueueUrl: queueUrl,
            MessageBody: outputs
        },
        function(err, data) {
            if (err) {
                throw err;
            }
        }
    );
};

const rights = function(requestedLevel, logLevel) {
    if (requestedLevel === 0) {
        return true;
    } else if (requestedLevel === 1) {
        if (logLevel >= 1) {
            return true;
        }
    } else if (requestedLevel === 2) {
        if (logLevel >= 2) {
            return true;
        }
    } else if (requestedLevel === 3) {
        if (logLevel >= 3) {
            return true;
        }
    }
    return false;
};

module.exports = class Logback {
    constructor(app, loc, output) {

        let self = this;

        if (app !== undefined && app !== '' && app !== null) {
            this.application = app;
        } else {
            this.application = '';
        }

        if (output !== undefined && output !== '' && output !== null) {
            this.output = output;
        } else {
            this.output = 'json';
        }

        if (loc !== undefined && loc !== '' && loc !== null) {
            //check the quality of the object
            this.loc = loc;
            if (typeof loc === 'object') {
                if (loc.file !== undefined) {
                    if (loc.file.location === undefined || loc.file.level === undefined) {
                        throw new Error('File Location (string) and Level (int) must be defined');
                    }
                }
                if (loc.elastic !== undefined) {
                    if (loc.elastic.endpoint === undefined || loc.elastic.level === undefined) {
                        throw new Error('Elastic endpoint (string) and Level (int) must be defined');
                    }
                }
                if (loc.sqs !== undefined) {
                    if (loc.sqs.level === undefined || loc.sqs.queueUrl === undefined || loc.sqs.region === undefined) {
                        throw new Error('SQS region (string), logGroupName (string), logStreamName (string) and Level (int) must be defined');
                    } else {

                        if (loc.sqs.accessKeyId !== undefined && loc.sqs.secretAccessKey !== undefined) {
                            let creds = new AWS.Credentials(loc.sqs.accessKeyId, loc.sqs.secretAccessKey)
                            AWS.config.update({
                                region: loc.sqs.region,
                                correctClockSkew: true,
                                credentials: creds
                            });
                        } else {
                            AWS.config.update({
                                region: loc.sqs.region,
                                correctClockSkew: true
                            });
                        }

                        self.sqs = new AWS.SQS({ apiVersion: '2012-11-05', endpoint: 'https://sqs.' + loc.sqs.region + '.amazonaws.com' });
                        self.queueUrl = loc.sqs.queueUrl;
                    }
                }
            }
        } else {
            //nothing specified, output to file in root
            this.loc = path.dirname(require.main.filename) + '/output.' + this.output;
        }

    }

    a(message, type, file) {
        let self = this;
        let log = {
            date: null,
            type: null,
            message: null,
            file: null
        }; //object
        let outputs = ''; //string

        if (type !== undefined && typeof type === 'number') {
            switch (type) {
                case 1:
                    { log.type = 'info'; break; }
                case 2:
                    { log.type = 'warning'; break; }
                case 3:
                    { log.type = 'error'; break; }
                default:
                    { log.type = type; }
            }
        } else {
            log.type = (type) ? type : 'info';
            type = 1;
        }

        if (message !== undefined) {
            log.message = message;
        } else {
            log.message = '';
        }

        log.date = new Date();

        log.file = (file) ? file : '';

        if (this.application !== undefined) {
            log.app = this.application;
        }

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

        if (typeof this.loc === 'string') {
            //yes, set the output ot a file
            fileOutput(this.loc, outputs);

        } else if (typeof this.loc === 'object') {
            //advanced output
            //check file system
            if (this.loc.file !== undefined) {
                if (rights(this.loc.file.level, type) === true) {
                    fileOutput(this.loc.file.location, outputs);
                }
            }
            if (this.loc.elastic !== undefined) {
                if (rights(this.loc.elastic.level, type) === true) {
                    elasticOutput(this.loc.elastic.endpoint, outputs);
                }
            }
            if (this.loc.sqs !== undefined) {
                if (rights(this.loc.sqs.level, type) === true) {
                    sqsOutput(self.sqs, self.queueUrl, outputs);
                }
            }
            if (this.loc.stdout !== undefined) {
                if (rights(this.loc.stdout.level, type) === true) {
                    process.stdout.write(outputs + '\n');
                }
            }
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