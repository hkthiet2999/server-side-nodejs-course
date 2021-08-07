# Week 04 - Backend as a Service (BaaS)
In this module we learn about Mongoose population, a way of cross-referencing documents and populating the documents from other documents. We then review secure communication using HTTPS. We look at Backend as a Service (BaaS) and take a brief look at Loopback.

## HTTPS and Secure Communication

Configure a secure server in Node using the core HTTPS module

Generate the private key and public certificate and configure the HTTPS server

Redirect traffic from the insecure HTTP server to a secure HTTPS server.

###  Setup OpenSSL
Downloads: [openssl](http://slproweb.com/products/Win32OpenSSL.html)

Setup Follow: [blog.didierstevens.com](https://blog.didierstevens.com/2015/03/30/howto-make-your-own-cert-with-openssl-on-windows/) (recommend, for Windows users) or [faqforge.com](https://www.faqforge.com/windows/use-openssl-on-windows/) (for Windows users) or [stackjava.com](https://stackjava.com/ssl/huong-dan-cai-dat-openssl-tren-windows-10.html) (for Windows Users with Vietnamese)

Documentations: [wiki.openssl.org](https://wiki.openssl.org/index.php/Binaries) and [Self-Signed Certificate Generator](https://www.selfsignedcertificate.com/)


### Generating Private Key and Certificate
Go to the bin folder (bin folder of your Open-SSL setup) and then create the private key and certificate by typing the following at the prompt:
```
openssl genrsa 1024 > private.key
openssl req -new -key private.key -out cert.csr
openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem
```
### Configuring the HTTPS Server
Open the www file in the bin directory and update its contents as follows:
```
. . .

var https = require('https');
var fs = require('fs');

. . .

app.set('secPort',port+443);

. . .

/**
 * Create HTTPS server.
 */ 
 
var options = {
  key: fs.readFileSync(__dirname+'/private.key'),
  cert: fs.readFileSync(__dirname+'/certificate.pem')
};

var secureServer = https.createServer(options,app);

/**
 * Listen on provided port, on all network interfaces.
 */

secureServer.listen(app.get('secPort'), () => {
   console.log('Server listening on port ',app.get('secPort'));
});
secureServer.on('error', onError);
secureServer.on('listening', onListening);

. . .
```

Open app.js and add the following code to the file:
```
. . .

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

. . .
```

Run the server and test.


## Uploading Files
Configure the Multer module to enable file uploads

Use the Multer module in your Express application to enable file uploads to a designated folder

### Installing Multer
At the prompt in your conFusionServer project, type the following to install Multer:
`npm install multer@1.3.1 --save`

### Setting up File Uploading
Add a new Express router named uploadRouter.js in the routes folder and add the following code to it:

```
const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;
```
Then update app.js to import the uploadRouter and configure the new route as follows:
```
. . .

const uploadRouter = require('./routes/uploadRouter');


. . .

app.use('/imageUpload',uploadRouter);

. . .
```

Save all the changes and test your server.

## Cross-Origin Resource Sharing

Install and configure the cors Node module

Configure your Express application to use the cors module to support CORS on various endpoints

### Installing cors Module
To install the cors module, type the following at the prompt: `npm install cors@2.8.4 --save`

### Configuring the Server for CORS
In the routes folder, add a new file named cors.js and add the following code to it:
```
const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
```

Then, open dishRouter.js and update it as follows:
```
. . .

const cors = require('./cors');

. . .

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  
. . .

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

. . .

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  
. . .

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

. . .

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  
. . .

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

. . .

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  
. . .

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

. . .

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {


. . .
```

Do similar updates to promoRouter.js, leaderRouter.js, uploadRouter.js and users.js. Save all the changes and test your server.


## Using OAuth with Passport and Facebook
Configure your server to support user authentication based on OAuth providers

Use Passport OAuth support through the passport-facebook-token module to support OAuth based authentication with Facebook for your users.

### Registering your app on Facebook
Go to https://developers.facebook.com/apps/ and register your app by following the instructions there and obtain your App ID and App Secret.

In the index.html file into the public folder, replace the "YOUR CLIENT ID" with the Client App ID that you obtain above.

### Installing passport-facebook-token Module
Install passport-facebook-token module by typing the following at the prompt: `npm install passport-facebook-token@3.3.0 --save`

Updating config.js. Update config.js with the App ID and App Secret that you obtained earlier as follows:
```
module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl': 'mongodb://localhost:27017/conFusion',
    'facebook': {
        clientId: 'Your Client App ID',
        clientSecret: 'Your Client App Secret'
    }
}
```


Updating User Model
Open user.js from the models folder and update the User schema as follows:
```
var User = new Schema({
  . . .

    facebookId: String,

  . . .
});
```

### Setting up Facebook Authentication
Open authenticate.js and add in the following line to add Facebook strategy:
```
. . .

var FacebookTokenStrategy = require('passport-facebook-token');

. . .

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                })
            }
        });
    }
));
```

Open users.js and add the following code to it:
```
. . .

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

. . .
```

Start your server and test your application. 

In a browser, open https://localhost:3443/index.html to open the index.html file. Then click on the Facebook Login button to log into Facebook. At the end of the login process, open your browser's JavaScript console and then obtain the Access Token from there.

Then you can use the access token to contact the server at https://localhost:3443/users/facebook/token and pass in the token using the Authorization header with the value as Bearer <Access Token> to obtain the JWT token from the server.

## Peer-graded Assignment: Backend as a Service

In this assignment, you will be extending the router to support the ability to save and retrieve a list of favorite dishes by each of the registered users. All registered users in the system should have the ability to save any dish as their favorite dish, retrieve all their favorite dishes and remove one or all their favorite dishes.

### Assignment Overview

At the end of this assignment, your should have completed the following:

- Allowed users to select a dish as their favorite, and add it to the list of favorites that are saved on the server.

-Allowed users to retrieve the list of their favorite dishes from the server

- Delete one or all of their favorite dishes from their favorites list on the server.

### Assignment Resources

[db.json](https://d3c33hcgiwev3.cloudfront.net/_811ae978a255224eeecc8809c00fa9b0_db.json?Expires=1628467200&Signature=LEjDp37G5m6Q0-tf-vN8tmHNQAyhcGyeVjJfxF4v97dVLjAqAasmjApFqQU~l3vyMjzOicRf1o97Ld2gGMw0yfCFurWFOlfleHJUbtEFlSPl3DaRPmV--V18YUW8pDAQi39xGNlOd5aj8s~wLYqS35~~GifBI9fAdjot3LkPUQ0_&Key-Pair-Id=APKAJLTNE6QMUY6HBC5A)

### Assignment Requirements

In this assignment, you will be supporting a new route https://localhost:3443/favorites, where the users can do a GET to retrieve all their favorite dishes, a POST to add a list of dishes to their favorites, and a DELETE to delete the list of their favorites. In addition, you will support the new route  https://localhost:3443/favorites/:dishId where  the users can issue a POST request to add the dish to their list of favorite dishes, and a DELETE request to delete the specific dish from the list of their favorite dishes.

This assignment consists of the following three tasks:

<b> Task 1 </b>

In this task you will be implementing a new Mongoose schema named favoriteSchema, and a model named Favorites in the file named favorite.js in the models folder. This schema should take advantage of the mongoose population support to populate the information about the user and the list of dishes when the user does a GET operation.

<b> Task 2 </b>

In this task, you will implement the Express router() for the '/favorites' URI such that you support GET, POST and DELETE operations

- When the user does a GET operation on '/favorites', you will populate the user information and the dishes information before returning the favorites to the user.
When the user does a POST operation on '/favorites' by including [{"_id":"dish ObjectId"}, . . .,  {"_id":"dish ObjectId"}] in the body of the message, you will (a) create a favorite document if such a document corresponding to this user does not already exist in the system, (b) add the dishes specified in the body of the message to the list of favorite dishes for the user, if the dishes do not already exists in the list of favorites.

- When the user performs a DELETE operation on '/favorites', you will delete the list of favorites corresponding to the user, by deleting the favorite document corresponding to this user from the collection.

- When the user performs a POST operation on '/favorites/:dishId', then you will add the specified dish to the list of the user's list of favorite dishes, if the dish is not already in the list of favorite dishes.

- When the user performs a DELETE operation on '/favorites/:dishId', then you will remove the specified dish from the list of the user's list of favorite dishes.

<b> Task 3 </b>

You will update app.js to support the new '/favorites' route.

### Review criteria
Your assignment will be graded on the basis of the following review criteria:

- A new favoriteSchema and Favorites model has been correctly implemented to take advantage of Mongoose Population support to track the users and the list of favorite dishes using their ObjectIds in the favoriteSchema and Favorites model.

- The GET, POST and DELETE operations are well supported as per the specifications above

- The app.js has been updated to support the new route.
