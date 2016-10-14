# Logback
------
Structured log output in either CSV or JSON

## example

```js
var Logback = require('logback');
var c = new Logback('app name', 'location/of.log', 'csv');

//appends text to log
c.a('Lorem ipsum dolor sit amet');

//shortcut of console.log()
c.a('Lorem ipsum dolor sit amet');
```

## install

```bash
npm install logback --save
```

## usage

Setup
```js
//include module
const Logback = require('logback');

//the name of the application you are creating the log for
//string, required
const appname = 'app name';

//location of the log file to append to.
//string, optional, default: current directory
const location = '/var/log/app.csv';

//type of output (json, csv)
//string, optional, default: json
const outputType;

//create instance of class
const c = new Logback(appname, location, outputType);

```

Append to log file
```js
//the message you want to send to your log
//string, required
let message = "Lorem ipsum dolor sit amet";

//the type of log that is being written. This can be a custom string or an int
//string/int, optional, default: info
//0: info, 1: warning, 2: error
let message = "Parsed";

//the identifier can be any string to identify the module, method, line or function
//string, optional, default: null
let message = "index";

//method to append to log file
c.a(message, type, identifier);
```
The output of the log will have the date the log was created, and an id that was created when the instance of the class was created.


### Console log shorthand
```js
// shorthand for console.log();
c.l([msg][, ...]);

// shorthand for console.info();
c.i([msg][, ...]);

// shorthand for console.warn();
c.w([msg][, ...]);

 // shorthand for console.dir();
c.d(obj[, opts]);
```

## test

```bash
npm test
```
