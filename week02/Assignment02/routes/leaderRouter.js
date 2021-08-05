const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Leaders = require('../models/leaders');


const leaderRouter = express.Router();

/**Task 02:
 * The REST API endpoints /leaders and /leaders/:leaderId are implemented to interact with the MongoDB database
 */

// GET, POST, PUT, DELETE for '/' in leaderRouter
leaderRouter.route('/')
.options((req, res) => { res.sendStatus(200); })
.get((req,res,next)=>{
   Leaders.find({})
   .then((leaders) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(leaders); 
   }, (err) => next(err))
   .catch((err) => next(err));
})
.post((req, res, next)=>{
   Leaders.create(req.body)
   .then((leader) => {
      console.log('Leader Created', leader);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(leader);
   }, (err) => next(err));
})
.put((req,res,next)=>{
    res.statusCode = 403; //403 means operation not supported
   res.end('PUT operation not supported on /leaders');
})
.delete((req,res,next)=>{
   Leaders.remove({})
   .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
   }, (err) => next(err));
});

// GET, POST, PUT, DELETE for '/:leaderId' in leaderRouter
leaderRouter.route('/:leaderId') 
.options((req, res) => { res.sendStatus(200); })
.get((req,res,next)=>{
   Leaders.findById(req.params.leaderId)
   .then((leader) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(leader); 
   }, (err) => next(err))
   .catch((err) => next(err));
})
.post((req,res,next)=>{
   res.end('POST operation not supported on /leaders/'+ req.params.leaderId);
})
.put((req,res,next)=>{
   Leaders.findByIdAndUpdate(req.params.leaderId, {
      $set: req.body
   }, {new: true })
   .then((leader) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(leader);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.delete((req,res,next)=>{
   Leaders.findByIdAndRemove(req.params.leaderId)
   .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
   }, (err) => next(err));
});


module.exports = leaderRouter;