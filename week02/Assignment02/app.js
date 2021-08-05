const express = require('express');
const app = express();

// Routes
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

// Connect to Database

const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connected correctly to server')
}, (err) => { console.log(err); });


app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
//   });
  
// // error handler
// app.use(function (err, req, res, next) {
// // set locals, only providing error in development
// res.locals.message = err.message;
// res.locals.error = req.app.get('env') === 'development' ? err : {};

// // render the error page
// res.status(err.status || 500);
// res.render('error');
// });

// Connect to Server
const hostname = 'localhost';
const port = 3000;

app.listen(port, hostname, function(){

    console.log(`Server running at http://${hostname}:${port}/`);
});
