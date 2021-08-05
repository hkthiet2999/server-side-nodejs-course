const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

/**
 * Task 01: The Promotions schema and model correctly supports all the fields as per the example document given above
 */

// create Promotions Schema
const promoSchema = new Schema({
    // "Weekend Grand Buffet"
    name: {
        type: String,
        required: true,
        unique: true
    },
    // "images/buffet.png"
    image: {
        type: String,
        required: true
    },
    // "New"
    label: {
        type: String,
        default: ' ' // Task 01: The label field is set to an empty string by default
    },
    // "19.99"
    price: {
        type: Currency, // Task 01: The price schema is be supported with a new SchemaType called Currency.
        required: true,
        min: 0
    },
    // "Featuring . . ."
    description: {
        type: String,
        required: true
    },
    // false
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true 
});

// exports Promotions to Node application
const Promotions = mongoose.model('Promotion', promoSchema);
module.exports = Promotions;