# Week 02 

This module looks in detail at data storage with MongoDB, the popular NoSQL database. You will learn first about Express generator for scaffolding an Express application. Then you will learn about MongoDB. You will learn how to interact with MongoDB from a Node application. Then you will learn the Mongoose ODM to create schemas and models, and interact with MongoDB server.

## Express Generator
- Generating an Express application using the express-generator

- Modify the Express application to support the REST API by adding routes

### Installing express-generator
Install express-generator by typing the following at the prompt: `npm install express-generator -g`

### Implementing a REST API
- Copy the dishRouter.js, promoRouter.js and leaderRouter.js from week01 to the routes folder within the Express application that you just scaffolded out.

- Furthermore, copy the index.html and aboutus.html file from the node-express/public folder to the public folder in your new project.

- Then, open the app.js file and then update the code in there as follows:
```
. . .

var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

. . .

app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);

. . .
```
- Save the changes and run the server. You can then test the server by sending requests and observing the behavior. Do a Git commit with the message "Express Generator REST API".


## Introduction to MongoDB, Node and MongoDB

- Download and Installing MongoDB. Start the server and interact with it using the Mongo REPL shell

- Install and use the Node MongoDB driver. Interact with the MongoDB database from a Node application

### Download and Installing MongoDB
- Go to http://www.mongodb.org, then download and install MongoDB as per the instructions given there.
### Installing the Node MongoDB Driver Module
- Install the Node MongoDB driver and the Assert module by typing the following at the prompt:
```
npm install mongodb@3.0.10 --save
npm install assert@1.4.1 --save
```
### A Simple Node-MongoDB Application
- Create a new file named index.js and add the following code to it:
```
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

MongoClient.connect(url, (err, client) => {

    assert.equal(err,null);

    console.log('Connected correctly to server');

    const db = client.db(dbname);
    const collection = db.collection("dishes");
    collection.insertOne({"name": "Uthappizza", "description": "test"},
    (err, result) => {
        assert.equal(err,null);

        console.log("After Insert:\n");
        console.log(result.ops);

        collection.find({}).toArray((err, docs) => {
            assert.equal(err,null);
            
            console.log("Found:\n");
            console.log(docs);

            db.dropCollection("dishes", (err, result) => {
                assert.equal(err,null);

                client.close();
            });
        });
    });

});
```

- Make sure that your MongoDB server is up and running. Type the `npm start` to start the server and see the result.

### Implementing a Node Module of Database Operations

- Create a new file named operations.js that contains a few MongoDB operations and add the following code:
```
const assert = require('assert');

exports.insertDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    coll.insert(document, (err, result) => {
        assert.equal(err, null);
        console.log("Inserted " + result.result.n +
            " documents into the collection " + collection);
        callback(result);
    });
};

exports.findDocuments = (db, collection, callback) => {
    const coll = db.collection(collection);
    coll.find({}).toArray((err, docs) => {
        assert.equal(err, null);
        callback(docs);        
    });
};

exports.removeDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    coll.deleteOne(document, (err, result) => {
        assert.equal(err, null);
        console.log("Removed the document ", document);
        callback(result);        
    });
};

exports.updateDocument = (db, document, update, collection, callback) => {
    const coll = db.collection(collection);
    coll.updateOne(document, { $set: update }, null, (err, result) => {
        assert.equal(err, null);
        console.log("Updated the document with ", update);
        callback(result);        
    });
};
```

Using the Node Module for Database Operations. Update the file named index.js as follows:
```
. . .
const dboper = require('./operations');
. . .
dboper.insertDocument(db, { name: "Vadonut", description: "Test"},
    "dishes", (result) => {
        console.log("Insert Document:\n", result.ops);

        dboper.findDocuments(db, "dishes", (docs) => {
            console.log("Found Documents:\n", docs);

            dboper.updateDocument(db, { name: "Vadonut" },
                { description: "Updated Test" }, "dishes",
                (result) => {
                    console.log("Updated Document:\n", result.result);

                    dboper.findDocuments(db, "dishes", (docs) => {
                        console.log("Found Updated Documents:\n", docs);
                        
                        db.dropCollection("dishes", (result) => {
                            console.log("Dropped Collection: ", result);

                            client.close();
                        });
                    });
                });
        });
});
. . .
```

- Run the server by typing the `npm start` and observe the results.

## Callback Hell and Promises

- Update operations.js as follows:

```
const assert = require('assert');

exports.insertDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    return coll.insert(document);
};

exports.findDocuments = (db, collection, callback) => {
    const coll = db.collection(collection);
    return coll.find({}).toArray();
};

exports.removeDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    return coll.deleteOne(document);
};

exports.updateDocument = (db, document, update, collection, callback) => {
    const coll = db.collection(collection);
    return coll.updateOne(document, { $set: update }, null);
};
```

- Open index.js and update it as follows:
```
. . .

MongoClient.connect(url).then((client) => {

    console.log('Connected correctly to server');
    const db = client.db(dbname);

    dboper.insertDocument(db, { name: "Vadonut", description: "Test"},
        "dishes")
        .then((result) => {
            console.log("Insert Document:\n", result.ops);

            return dboper.findDocuments(db, "dishes");
        })
        .then((docs) => {
            console.log("Found Documents:\n", docs);

            return dboper.updateDocument(db, { name: "Vadonut" },
                    { description: "Updated Test" }, "dishes");

        })
        .then((result) => {
            console.log("Updated Document:\n", result.result);

            return dboper.findDocuments(db, "dishes");
        })
        .then((docs) => {
            console.log("Found Updated Documents:\n", docs);
                            
            return db.dropCollection("dishes");
        })
        .then((result) => {
            console.log("Dropped Collection: ", result);

            return client.close();
        })
        .catch((err) => console.log(err));

})
.catch((err) => console.log(err));
```

- Run the node application and see the result

## Mongoose ODM

- Install Mongoose ODM and connect to a MongoDB Server

- Create Mongoose Schemas

- Perform Database operations with Mongoose methods

### Implementing a Node Application
- Create a sub-folder named models in the node-mongoose folder. Move to this folder.

- Create a file named dishes.js and add the following code to create a Mongoose schema:
```
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

var Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;
```

- Move to the node-mongoose folder and create a file named index.js and add the following code:
```
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {

    console.log('Connected correctly to server');

    var newDish = Dishes({
        name: 'Uthappizza',
        description: 'test'
    });

    newDish.save()
        .then((dish) => {
            console.log(dish);

            return Dishes.find({});
        })
        .then((dishes) => {
            console.log(dishes);

            return Dishes.remove({});
        })
        .then(() => {
            return mongoose.connection.close();
        })
        .catch((err) => {
            console.log(err);
        });

});
```

- Make sure that your MongoDB server is up and running. Then at the terminal prompt type `npm start` to start the server and see the result

### Mongoose Operations

- Update index.js as follows:
```
. . .
    
    Dishes.create({
        name: 'Uthapizza',
        description: 'Test'
    })
    .then((dish) => {
        console.log(dish);
        
        return Dishes.find({}).exec();
    })
    .then((dishes) => {
        console.log(dishes);

        return Dishes.remove({});
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch((err) => {
        console.log(err);
    });
    
. . .
```


- Adding Sub-documents to a Document. Update dishes.js in the models folder as follows:
```
. . .

var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    comments:[commentSchema]
}, {
    timestamps: true
});

. . .
```
- Update index.js as follows:

```
. . .

    Dishes.create({
        name: 'Uthappizza',
        description: 'test'
    })
    .then((dish) => {
        console.log(dish);

        return Dishes.findByIdAndUpdate(dish._id, {
            $set: { description: 'Updated test'}
        },{ 
            new: true 
        })
        .exec();
    })
    .then((dish) => {
        console.log(dish);

        dish.comments.push({
            rating: 5,
            comment: 'I\'m getting a sinking feeling!',
            author: 'Leonardo di Carpaccio'
        });

        return dish.save();
    })
    .then((dish) => {
        console.log(dish);

        return Dishes.remove({});
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch((err) => {
        console.log(err);
    });
    
. . .
```

- Run the server and observe the result.

## REST API with Express, MongoDB and Mongoose

- Develop a full-fledged REST API server with Express, MongoDB and Mongoose

- Serve up various REST API end points together with interaction with the MongoDB server.

<b>Exercise Resources: </b> [db](https://d3c33hcgiwev3.cloudfront.net/_811ae978a255224eeecc8809c00fa9b0_db.json?Expires=1628208000&Signature=E82PXJBdDTds4DbIwz8iyV~4dLvEwYnBhR9YSs97KFuy3ae5iD-o4-4tsQLb-qVQpCtzMRIdET7eYWeY6LJopPBojt0xbF8cSLTbNG64z40AhOHvkApWbp52CI5l4R2JoTE1sKpIeFvaVX~miuJl3JlIieb7~kEk4Tr9B16pYw8_&Key-Pair-Id=APKAJLTNE6QMUY6HBC5A)

### Update the Express Application

- Go to the conFusionServer folder where you had developed the REST API server using Express generator.

- Copy the models folder from the node-mongoose folder to the conFusionServer folder.

- Then install bluebird, mongoose and mongoose-currency Node modules by typing the following at the prompt: ` npm install mongoose@5.1.7 mongoose-currency@0.2.0 --save`

- Open app.js file and add in the code to connect to the MongoDB server as follows:
```
. . .

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

. . .
```
- Next open dishes.js in the models folder and update it as follows:

```
. . .

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default:false      
    },
    comments:[commentSchema]
}, {
    timestamps: true
});
. . .
```

- Now open dishRouter.js and update its code as follows:

```
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req,res,next) => {
    Dishes.find({})
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

dishRouter.route('/:dishId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;
```
- Save the changes and start the server. Make sure your MongoDB server is up and running.

- You can now fire up postman and then perform several operations on the REST API. You can use the data for all the dishes provided in the db.json file given above in the Exercise Resources to test your server

### Handling Comments
- Add the following code to dishRouter.js to handle comments:
```
. . .

dishRouter.route('/:dishId/comments')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'
        + req.params.dishId + '/comments');
})
.delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            for (var i = (dish.comments.length -1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
        + '/comments/' + req.params.commentId);
})
.put((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

. . .
```

- Save the changes and start the server. Make sure your MongoDB server is up and running.

- You can now fire up postman and then perform several operations on the REST API. You can use the data for all the dishes provided in the db.json file given above in the Exercise Resources to test your server


## Peer-graded Assignment: Assignment 2: MongoDB

### Instructions

In this assignment, you will continue your journey with MongoDB and Mongoose. You will then create two new schemas for promotions and leadership, and then extend the Express REST API server to support the /promotions and the /leaders REST API end points.

### Assignment Overview

At the end of this assignment you would have completed the following three tasks:

- Implemented the Promotions schema and model

- Implement a REST API to support the /promotions endpoint, and the /promotions/:promoId endpoint enabling the interaction with the MongoDB database

- Implemented the Leaders schema and model

- Implement a REST API to support the /leaders endpoint, and the /leaders/:leaderId endpoint enabling the interaction with the MongoDB database

### Assignment Requirements

This assignment consists of the following two tasks:

<b> Task 1 </b>

You are given the following example of a promotion document. You will now create the Promotions schema and model to support the document:
```
{
    "name": "Weekend Grand Buffet",
    "image": "images/buffet.png",
    "label": "New",
    "price": "19.99",
    "description": "Featuring . . .",
    "featured": false
}

```

Note in particular that the label and price fields should be implemented the same way as you did for the Dishes schema and model. The Promotions schema and model should be defined in a file named promotions.js.

Next, extend the promoRouter.js to enable the interaction with the MongoDB database to fetch, insert, update and delete information.

<b> Task 2 </b>
You are given the following example of a leadership document. You will now create the Leaders schema and model to support the document:
```
{
    "name": "Peter Pan",
    "image": "images/alberto.png",
    "designation": "Chief Epicurious Officer",
    "abbr": "CEO",
    "description": "Our CEO, Peter, . . .",
    "featured": false
}
```

The Leaders schema and model should be defined in a file named leaders.js.

Next, extend the leaderRouter.js to enable the interaction with the MongoDB database to fetch, insert, update and delete information.

### Review criteria


Upon completion of the assignment, your submission will be reviewed based on the following criteria:

<b> Task 1 </b>

- The Promotions schema and model correctly supports all the fields as per the example document given above

- The label field is set to an empty string by default

- The price schema is be supported with a new SchemaType called Currency.

- The REST API endpoints /promotions and /promotions/:promoId are implemented to interact with the MongoDB database

<b> Task 2 </b>
- The Leaders schema and model correctly supports all the fields as per the example document given above.

- The REST API endpoints /leaders and /leaders/:leaderId are implemented to interact with the MongoDB database
