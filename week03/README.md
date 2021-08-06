# Week 03
This module is dedicated to user authentication. We first develop a full-fledged REST API server with Express, Mongo and Mongoose. Thereafter we examine basic authentication and session-based authentication briefly. We then develop token-based authentication with the support of JSON web tokens and the Passport module.

## Basic Authentication
- Set up an Express server to handle basic authentication

- Use the basic access authentication approach to do basic authentication.

### Setting up Basic Authentication
You will continue with the Express REST API server that you have been working on in the previous module in the conFusionServer folder.

Open the app.js file and update its contents as follows:

```
. . .

function auth (req, res, next) {
  console.log(req.headers);
  var authHeader = req.headers.authorization;
  if (!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
  }

  var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  var user = auth[0];
  var pass = auth[1];
  if (user == 'admin' && pass == 'password') {
      next(); // authorized
  } else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');      
      err.status = 401;
      next(err);
  }
}

app.use(auth);

. . .
```

- Save the changes and start the server. Access the server from a browser by opening an incognito window and see the result.

## Using Cookies

Set up your Express application to send signed cookies.

Set up your Express application to parse the cookies in the header of the incoming request messages

### Using cookie-parser

- The cookie-parser Express middleware is already included in the Express REST API application. If you need to add Cookie parser middleware then you can install the NPM module as follows: `npm install cookie-parser --save`

- Update app.js as follows:
```
. . .

app.use(cookieParser('12345-67890-09876-54321'));

function auth (req, res, next) {

  if (!req.signedCookies.user) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');              
        err.status = 401;
        next(err);
        return;
    }
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
    if (user == 'admin' && pass == 'password') {
        res.cookie('user','admin',{signed: true});
        next(); // authorized
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');              
        err.status = 401;
        next(err);
    }
  }
  else {
      if (req.signedCookies.user === 'admin') {
          next();
      }
      else {
          var err = new Error('You are not authenticated!');
          err.status = 401;
          next(err);
      }
  }
}

. . .
```
- Save the changes, run the server and test the behavior.

## Express Sessions

Set up your Express server to use Express sessions to track authenticated users

Enable clients to access secure resources on the server after authentication.

### Installing express-session

Install express-session and session-file-store Node modules as follows: `npm install express-session session-file-store --save`

### Using express-session
Then, update app.js as follows to use Express session:

```
. . .

var session = require('express-session');
var FileStore = require('session-file-store')(session);

. . .

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

function auth (req, res, next) {
    console.log(req.session);

    if (!req.session.user) {
        var authHeader = req.headers.authorization;
        if (!authHeader) {
            var err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');                        
            err.status = 401;
            next(err);
            return;
        }
        var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        var user = auth[0];
        var pass = auth[1];
        if (user == 'admin' && pass == 'password') {
            req.session.user = 'admin';
            next(); // authorized
        } else {
            var err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            next(err);
        }
    }
    else {
        if (req.session.user === 'admin') {
            console.log('req.session: ',req.session);
            next();
        }
        else {
            var err = new Error('You are not authenticated!');
            err.status = 401;
            next(err);
        }
    }
}

. . .
```
- Save the changes, run the server and examine the behavior.

### User Model and User Authentication 

Add a new Mongoose model for users in the file named user.js in the models folder, and add the following to it:
```
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:  {
        type: String,
        required: true
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', User);
```

- Update users.js in the routes folder to support user registration, login and logout:

```
. . .

const bodyParser = require('body-parser');
var User = require('../models/user');

router.use(bodyParser.json());

. . .

router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(user != null) {
      var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password});
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req, res, next) => {

  if(!req.session.user) {
    var authHeader = req.headers.authorization;
    
    if (!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];
  
    User.findOne({username: username})
    .then((user) => {
      if (user === null) {
        var err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      else if (user.password !== password) {
        var err = new Error('Your password is incorrect!');
        err.status = 403;
        return next(err);
      }
      else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!')
      }
    })
    .catch((err) => next(err));
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
})

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

. . .
```

- Next, update app.js as follows to use the user authentication support:

```
. . .

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth (req, res, next) {
    console.log(req.session);

  if(!req.session.user) {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
  }
  else {
    if (req.session.user === 'authenticated') {
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
    }
  }
}

. . .
```

- Save the changes and test the server.

## User Authentication with Passport

Use Passport module together with passport-local and passport-local-mongoose for setting up local authentication within your server.

Use Passport together with sessions to set up user authentication.

### Installing Passport

You will continue working with the Express REST API Server in the conFusionServer folder. You will modify this project to set up user authentication support using Passport.

Install the Passport and related Node modules as follows: `npm install passport@0.4.0 passport-local@1.0.0 passport-local-mongoose@5.0.1 --save`

### Updating User Schema and Model
In the models folder, update user.js by adding the following code to it:
```
. . .

var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);

. . .
```

### Adding Passport-based Authentication
Add a new file named authenticate.js to the project folder and initialize it as follows:
```
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```
Open users.js file in the routes folder and update the code as follows:
```
. . .

var passport = require('passport');

. . .


router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});

. . .
```

Finally, update app.js as follows:

```
. . .

var passport = require('passport');
var authenticate = require('./authenticate');

. . .

app.use(passport.initialize());
app.use(passport.session());

. . .

function auth (req, res, next) {
    console.log(req.user);

    if (!req.user) {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      next(err);
    }
    else {
          next();
    }
}

. . .
```

Save the changes and test the server by sending various requests.

## User Authentication with Passport and JSON Web Token
Use JSON web tokens for token-based user authentication

Use Passport module together with passport-local and passport-local-mongoose for setting up local authentication within your server.

### Installing passport-jwt and jsonwebtoken Node Modules
You will continue working with the Express REST API Server in the conFusionServer folder. You will modify this project to set up user authentication support using tokens and Passport.

Install the passport-jwt and the jsonwebtoken modules as follows: `npm install passport-jwt@4.0.0 jsonwebtoken@8.3.0 --save`

Updating the App to use JSON Web Tokens
Create a new file named config.js and add the following code to it:
```
module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl' : 'mongodb://localhost:27017/conFusion'
}
```

Supporting JSON Web Tokens and Verification
Update authenticate.js as follows:
```
. . .

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

. . .


exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});
```

Open users.js file in the routes folder and update the code as follows:
```
. . .

var authenticate = require('../authenticate');

. . .

router.post('/login', passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

. . .
```

Update app.js to remove the auth function and the app.use(auth), and update as follows:
```
. . .

var config = require('./config');


. . .

const url = config.mongoUrl;

. . .
```

Controlling Routes with Authentication
Open dishRouter.js and updated the code for the '/' route as follows:
```
. . .

var authenticate = require('../authenticate');

. . .


dishRouter.route('/')


.post(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.put(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.delete(authenticate.verifyUser, (req, res, next) => {

   . . .

});


dishRouter.route('/:dishId')


.post(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.put(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.delete(authenticate.verifyUser, (req, res, next) => {

   . . .

});


dishRouter.route('/:dishId/comments')


.post(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.put(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.delete(authenticate.verifyUser, (req, res, next) => {

   . . .

});


dishRouter.route('/:dishId/comments/:commentId')


.post(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.put(authenticate.verifyUser, (req, res, next) => {

   . . .

})

.delete(authenticate.verifyUser, (req, res, next) => {

   . . .

});


. . .
```
Do similar updates to promoRouter.js and leaderRouter.js.

Save the changes and test the server by sending various requests.

## Peer-graded Assignment: User Authentication

In this assignment you will continue the exploration of user authentication. We have already set up the REST API server to validate an ordinary user. Now, you will extend this to verify an Admin and grant appropriate privileges to an Admin. In addition you will allow only a registered user to update and delete his/her submitted comments. Neither another user, nor an Admin can edit these comments.
### Assignment Overview

At the end of this assignment, you would have completed the following:

    - Check if a verified ordinary user also has Admin privileges.
    
    - Allow any one to perform GET operations
    
    - Allow only an Admin to perform POST, PUT and DELETE operations
    
    - Allow an Admin to be able to GET all the registered users' information from the database
    
    - Allow a registered user to submit comments (already completed), update a submitted comment and delete a submitted comment. The user should be restricted to perform such operations only on his/her own comments. No user or even the 
    
    - Admin can edit or delete the comments submitted by other users.
### Assignment Requirements
This assignment is divided into three tasks as detailed below:

<b> Task 1 </b>

In this task you will implement a new function named verifyAdmin() in authenticate.js file. This function will check an ordinary user to see if s/he has Admin privileges. In order to perform this check, note that all users have an additional field stored in their records named admin, that is a boolean flag, set to false by default. Furthermore, when the user's token is checked in verifyOrdinaryUser() function, it will load a new property named user to the request object. This will be available to you if the verifyAdmin() follows verifyUser() in the middleware order in Express. From this req object, you can obtain the admin flag of the user's information by using the following expression: `req.user.admin`

You can use this to decide if the user is an administrator. The verifyAdmin() function will call next(); if the user is an Admin, otherwise it will return next(err); If an ordinary user performs this operation, you should return an error by calling next(err) with the status of 403, and a message "You are not authorized to perform this operation!".

Note: See the video on how to set up an Admin account

<b> Task 2 </b>

In this task you will update all the routes in the REST API to ensure that only the Admins can perform POST, PUT and DELETE operations. Update the code for all the routers to support this. These operations should be supported for the following end points:

- POST, PUT and DELETE operations on /dishes and /dishes/:dishId

- DELETE operation on /dishes/:dishId/comments

- POST, PUT and DELETE operations on /promotions and /promotions/:promoId

-- POST, PUT and DELETE operations on /leaders and /leaders/:leaderId

<b> Task 3 </b>

In this task you will now activate the /users REST API end point. When an Admin sends a GET request to http://localhost:3000/users you will return the details of all the users. Ordinary users are forbidden from performing this operation.

<b> Task 4 </b>

In this task you will allow a registered user to update or delete his/her own comment. Recall that the comment already stores the author's ID. When a user performs a PUT or DELETE operation on the /dishes/:dishId/comments/:commentId REST API end point, you will check to ensure that the user performing the operation is the same as the user that submitted the comment. You will allow the operation to be performed only if the user's ID matches the id of the comment's author. Note that the User's ID is available from the req.user property of the req object. Also ObjectIDs behave like Strings, and hence when comparing two ObjectIDs, you should use the Id1.equals(id2) syntax.

### Review criteria

Your assignment will be graded based on the following criteria:

<b> Task 1 </b>

You have implemented the verifyAdmin() function in authenticate.js.
The verifyAdmin() function will allow you to proceed forward along the normal path of middleware execution if you are an Admin
The verifyAdmin() function will prevent you from proceeding further if you do not have Admin privileges, and will send an error message to you in the reply.

<b> Task 2 </b>

Any one is restricted to perform only the GET operation on the resources/REST API end points.
An Admin (who must be first checked to make sure is an ordinary user), can perform the GET, PUT, POST and DELETE operations on any of the resources/ REST API end points.

<b> Task 3 </b>

A GET operation on http://localhost:3000/users by an Admin will return the details of the registered users
An ordinary user (without Admin privileges) cannot perform the GET operation on http://localhost:3000/users.

<b> Task 4 </b>

A registered user is allowed to update and delete his/her own comments.
Any user or an Admin cannot update or delete the comment posted by other users.