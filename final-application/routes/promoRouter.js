const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');

const promoRouter = express.Router();

/** Task 01:
 * The REST API endpoints /promotions and /promotions/:promoId are implemented to interact with the MongoDB database
 */


//  GET, POST, PUT, DELETE for '/' in promoRouter
promoRouter.route('/')
.options((req, res) => { res.sendStatus(200); }) 
.get((req,res,next)=>{
   Promotions.find({})
   .then((promotions) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promotions); 
   }, (err) => next(err))
   .catch((err) => next(err));
})
.post((req, res, next)=>{
   Promotions.create(req.body)
   .then((promotion) => {
      console.log('Promotion Created', promotion);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promotion);
   }, (err) => next(err));
})
.put((req,res,next)=>{
    res.statusCode = 403; //403 means operation not supported
   res.end('PUT operation not supported on /Promotions');
})
.delete((req,res,next)=>{
   Promotions.remove({})
   .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
   }, (err) => next(err));
});

// GET, POST, PUT, DELETE for '/:promoId' in promoRouter
promoRouter.route('/:promoId') 
.options((req, res) => { res.sendStatus(200); }) //espec. o endpoint
.get((req,res,next)=>{
   Promotions.findById(req.params.promoId)
   .then((promo) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promo); 
   }, (err) => next(err))
   .catch((err) => next(err));
})
.post((req,res,next)=>{
   res.end('POST operation not supported on /promotions/'+ req.params.promoId);
})
.put((req,res,next)=>{
   Promotions.findByIdAndUpdate(req.params.promoId, {
      $set: req.body
   }, {new: true })
   .then((promo) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promo);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.delete((req,res,next)=>{
   Promotions.findByIdAndRemove(req.params.promoId)
   .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
   }, (err) => next(err));
});

// exports to Node applications
module.exports = promoRouter;