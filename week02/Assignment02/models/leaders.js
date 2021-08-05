const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

/** Task 02:
 * The Leaders schema and model correctly supports all the fields as per the example document given above.
 */

// Create new Leader Schema
const leaderSchema = new Schema({
    // "name": "Peter Pan",
    name: {
        type: String,
        required: true,
        unique: true
    },
    // "image": "images/alberto.png",
    image: {
        type: String,
        required: true
    },
    // "designation": "Chief Epicurious Officer",
    designation: {
        type: String,
        required: true
    },
    // "abbr": "CEO",
    abbr: {
        type: String,
        default: ' ' 
    },
    // "description": "Our CEO, Peter, . . .",
    description: {
        type: String,
        required: true
    },
    // "featured": false
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // no need
});

// exports Leaders to Node application
const Leaders = mongoose.model('Leader', leaderSchema);
module.exports = Leaders;