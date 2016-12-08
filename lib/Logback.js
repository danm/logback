'use strict';

const fs = require('fs');
const Console = require('console');
const request = require('request');

const fileOutput = function(loc, outputs) {
    try {
        fs.appendFileSync(loc, outputs);
    } catch (e) {
        throw new Error('Could not access file, your script may not have permission to the file', e);
    }
};

let cloudwatchlogs;
let AWS;

const elasticOutput = function(endpoint, outputs) {
        const config = {
            uri: endpoint + '/logback',
            method: 'POST',
            body: outputs
        };

        request(config);

        const cloudWatchOutput = function(logGroupName, logStreamName, outputs) {
            cloudwatchlogs.putLogEvents({
                    logGroupName: logGroupName,
                    logStreamName: logStreamName,
                    logEvents: [{
                        timestamp: new Date().getTime(),
                        message: outputs
                    }]
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
                this.application = app || null;
                this.output = output || 'json';
                if (loc !== undefined) {
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
                        if (loc.cloudwatch !== undefined) {
                            if (loc.cloudwatch.level === undefined || loc.cloudwatch.logGroupName === undefined || loc.cloudwatch.logStreamName === undefined || loc.cloudwatch.region === undefined) {
                                throw new Error('Cloudwatch region (string), logGroupName (string), logStreamName (string) and Level (int) must be defined');
                            } else {

                                this.logGroupName = loc.cloudwatch.logGroupName;
                                this.logStreamName = loc.cloudwatch.logStreamName;

                                AWS = require('aws-sdk');
                                AWS.config.update({
                                    region: loc.cloudwatch.region,
                                    apiVersions: {
                                        cloudwatchlogs: '2014-03-28'
                                    }
                                });

                                if (loc.cloudwatch.accessKeyId !== undefined) { AWS.config.update({ accessKeyId: loc.cloudwatch.accessKeyId }); }
                                if (loc.cloudwatch.secretAccessKey !== undefined) { AWS.config.update({ secretAccessKey: loc.cloudwatch.secretAccessKey }); }

                                cloudwatchlogs = new AWS.CloudWatchLogs();
                            }
                        }
                    }
                } else {
                    //nothing specified, output to file in root
                    this.loc = __dirname + '/output.' + this.output;
                }
            }

            a(message, type, file) {
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

                log.date = new Date();
                log.message = (message) ? message : '';
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
                    if (this.loc.cloudwatch !== undefined) {
                        if (rights(this.loc.cloudwatch.level, type) === true) {
                            cloudWatchOutput(this.logGroupName, this.logStreamName, outputs);
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