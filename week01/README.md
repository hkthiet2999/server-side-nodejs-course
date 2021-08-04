
## Node Modules

- Write simple Node applications and run them using Node

- Develop Node modules and use them within your Node applications

- Learn about using callbacks and handling errors within your Node application


### Starting a Node Application
- Go to a convenient location on your computer and create a folder named NodeJS. Then move to this folder.

- Now create a folder named node-examples and then move into this folder.

- At the prompt, type the following to initialize a package.json file in the node-examples folder:
```
npm init
```

- Accept the standard defaults suggested and then update the package.json file until you end up with the file containing the following:

```
{
  "name": "node-examples",
  "version": "1.0.0",
  "description": "Simple Node Examples",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index"
  },
  "author": "Jogesh Muppala",
  "license": "ISC"
}
```

- Create a file named index.js and add the following code to this file:
```
var rect = {
	perimeter: (x, y) => (2*(x+y)),
	area: (x, y) => (x*y)
};

function solveRect(l,b) {
    console.log("Solving for rectangle with l = " + l + " and b = " + b);

    if (l <= 0 || b <= 0) {
        console.log("Rectangle dimensions should be greater than zero:  l = "
               + l + ",  and b = " + b);
    }
    else {
	    console.log("The area of the rectangle is " + rect.area(l,b));
	    console.log("The perimeter of the rectangle is " + rect.perimeter(l,b));
    }
}

solveRect(2,4);
solveRect(3,5);
solveRect(0,5);
solveRect(-3,5);
``` 
- To run the Node application, type the following at the prompt: 
```npm start``` 

### A Simple Node Module
- Now, create a file named rectangle.js, and add the following code to it:

``` 
exports.perimeter =  (x, y) => (2*(x+y));

exports.area = (x, y) => (x*y);
```

- Then, update `index.js` as follows:
```
var rect = require('./rectangle');

. . .
```

- Run the Node application like before and observe that the result will be the same then Do a Git commit with the message "Simple Node Module".


## Node Modules: Callbacks and Error Handling

Objectives and Outcomes
In this exercise, you will learn about callbacks, JavaScript closures and error handling in Node applications. At the end of this exercise, you will be able to:

Using Callbacks in Node applications

Error handling in Node applications

### Using Callbacks and Error Handling
- Update  `rectangle.js` as shown below:
```
module.exports = (x,y,callback) => {
    if (x <= 0 || y <= 0)
        setTimeout(() => 
            callback(new Error("Rectangle dimensions should be greater than zero: l = "
                + x + ", and b = " + y), 
            null),
            2000);
    else
        setTimeout(() => 
            callback(null, {
                perimeter: () => (2*(x+y)),
                area:() => (x*y)
            }), 
            2000);
}
```

- Then,  update `index.js` as shown below:

```
. . .

function solveRect(l,b) {
    console.log("Solving for rectangle with l = "
                + l + " and b = " + b);
    rect(l,b, (err,rectangle) => {
        if (err) {
	        console.log("ERROR: ", err.message);
	    }
        else {
            console.log("The area of the rectangle of dimensions l = "
                + l + " and b = " + b + " is " + rectangle.area());
            console.log("The perimeter of the rectangle of dimensions l = "
                + l + " and b = " + b + " is " + rectangle.perimeter());
        }
    });
    console.log("This statement after the call to rect()");
};

. . .
```

- Run the Node application as before and see the result. Do a Git commit with the message "Node Callbacks and Error Handling".

## Node and the HTTP Module

- Implement a simple HTTP Server

- Implement a server that returns html files from a folder

### A Simple HTTP Server
Create a file named `index-http.js` and add the following code to it:
```
const http = require('http');

const hostname = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
    console.log(req.headers);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<html><body><h1>Hello, World!</h1></body></html>');
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

- Then you can type http://localhost:3000 in your browser address bar and see the result.

- You can also use postman chrome extension to send requests to the server and see the response. Alternately, you can download the stand-alone Postman tool from http://getpostman.com and install it on your computer.

- Initialize a Git repository, check in the files and do a Git commit with the message "Node HTTP Example 1".

### Serving HTML Files
-  Create a file named `index.html` and `about.html` in the public folder, then update `index-http.js`
```
. . .

const fs = require('fs');
const path = require('path');

. . .

const server = http.createServer((req, res) => {
  console.log('Request for ' + req.url + ' by method ' + req.method);

  if (req.method == 'GET') {
    var fileUrl;
    if (req.url == '/') fileUrl = '/index.html';
    else fileUrl = req.url;

    var filePath = path.resolve('./public'+fileUrl);
    const fileExt = path.extname(filePath);
    if (fileExt == '.html') {
      fs.exists(filePath, (exists) => {
        if (!exists) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end('<html><body><h1>Error 404: ' + fileUrl + 
                      ' not found</h1></body></html>');
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        fs.createReadStream(filePath).pipe(res);
      });
    }
    else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.end('<html><body><h1>Error 404: ' + fileUrl + 
              ' not a HTML file</h1></body></html>');
    }
  }
  else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.end('<html><body><h1>Error 404: ' + req.method + 
              ' not supported</h1></body></html>');
  }
})

. . .
```

## Introduction to Express
- Implement a simple web server using Express framework

- Implement a web server that serves static content

### A Simple Server using Express
- Install: `npm install express@4.16.3 --save`

- Create a file named `index-express.js` and add the following code to it:

```
const express = require('express'),
     http = require('http');

const hostname = 'localhost';
const port = 3000;

const app = express();

app.use((req, res, next) => {
  console.log(req.headers);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');

});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

### Serving Static Files
- Install morgan by typing the following at the prompt. Morgan is used for logging purposes: `npm install morgan@1.9.0 --save`

- Update `index-express.js` as follows:

```
. . .

const morgan = require('morgan');

. . .

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

. . .
```

- Start the server and interact with it and observe the behavior.

- Do a Git commit with the message "Express Serve Static Files".


## Express Router

- Use application routes in the Express framework to support REST API

- Use the Express Router in Express framework to support REST API


### Setting up a REST API

- Install body-parser by typing the following at the command prompt: `npm install body-parser@1.18.3 --save`

- Update index-express.js as shown below:

```
. . .

const bodyParser = require('body-parser');

. . .

app.use(bodyParser.json());

app.all('/dishes', (req,res,next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
});

app.get('/dishes', (req,res,next) => {
    res.end('Will send all the dishes to you!');
});

app.post('/dishes', (req, res, next) => {
 res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
});

app.put('/dishes', (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes');
});
 
app.delete('/dishes', (req, res, next) => {
    res.end('Deleting all dishes');
});

app.get('/dishes/:dishId', (req,res,next) => {
    res.end('Will send details of the dish: ' + req.params.dishId +' to you!');
});

app.post('/dishes/:dishId', (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/'+ req.params.dishId);
});

app.put('/dishes/:dishId', (req, res, next) => {
  res.write('Updating the dish: ' + req.params.dishId + '\n');
  res.end('Will update the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
});

app.delete('/dishes/:dishId', (req, res, next) => {
    res.end('Deleting dish: ' + req.params.dishId);
});

. . .
```

- Start the server and interact with it from the browser/postman. Do a Git commit with the message "Express Simple REST".

### Using Express Router
- Create a new folder named routes in the node-express folder.

- Create a new file named dishRouter.js in the routes folder and add the following code to it:
```
const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send all the dishes to you!');
})
.post((req, res, next) => {
    res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
    res.end('Deleting all dishes');
});

module.exports = dishRouter;
```

- Update index.js as follows: 
```
. . .


const dishRouter = require('./routes/dishRouter');

app.use('/dishes', dishRouter);

. . .
```

- Start the server and interact with it and see the result. Do a Git commit with the message "Express Router".

# Peer-graded Assignment: Assignment 1: Node Modules, Express and REST API

## Instructions

In this assignment you will continue the exploration of Node modules, Express and the REST API. You will design two new express routers to support REST API end points for promotions and leadership.

## Assignment Overview

At the end of this assignment, you should have completed the following tasks to update the server:

- Created a Node module using Express router to support the routes for the dishes REST API.

- Created a Node module using Express router to support the routes for the promotions REST API.

- Created a Node module using Express router to support the routes for the leaders REST API.
Assignment Requirements

The REST API for our Angular and Ionic/Cordova application that we built in the previous courses requires us to support the following REST API end points:

- http://localhost:3000/dishes/:dishId

- http://localhost:3000/promotions and http://localhost:3000/promotions/:promoId

- http://localhost:3000/leaders and http://localhost:3000/leaders/:leaderId

We need to support GET, PUT, POST and DELETE operations on each of the endpoints mentioned above, including supporting the use of route parameters to identify a specific promotion and leader. We have already constructed the REST API for the dishes route in the previous exercise.

This assignment requires you to complete the following three tasks. Detailed instructions for each task are given below.

<b>Task 1</b>

In this task you will create a separate Node module implementing an Express router to support the REST API for the dishes. You can reuse all the code that you implemented in the previous exercise. To do this, you need to complete the following:

    - Update the Node module named dishRouter.js to implements the Express router for the /dishes/:dishId REST API end point.

<b>Task 2</b>

In this task you will create a separate Node module implementing an Express router to support the REST API for the promotions. To do this, you need to complete the following:

    - Create a Node module named promoRouter.js that implements the Express router for the /promotions and /promotions/:promoId REST API end points.

    - Require the Node module you create above within your Express application and mount it on the /promotions route.

<b>Task 3</b>

In this task you will create a separate Node module implementing an Express router to support the REST API for the leaders. To do this, you need to complete the following:

    - Create a Node module named leaderRouter.js that implements the Express router for the /leaders  and /leaders/:leaderId REST API end points.

    - Require the Node module you create above within your Express application and mount it on the /leaders route.


## Review criteria

- Upon completion of the assignment, your submission will be reviewed based on the following criteria:

<b>Task 1</b>

- The REST API supports GET, PUT, POST and DELETE operations on /dishes/:dishId end point.

<b>Task 2</b>

- The new Node module, promoRouter is implemented and used within your server to support the /promotions end point.

- The REST API supports GET, PUT, POST and DELETE operations on /promotions and GET, PUT, POST and DELETE operations on /promotions/:promoId end points.

<b>Task 3</b>

- The new Node module, leaderRouter is implemented and used within your server to support the /leaders end point.

- The REST API supports GET, PUT, POST and DELETE operations on /leadership and GET, PUT, POST and DELETE operations on /leaders/:leaderId end points.