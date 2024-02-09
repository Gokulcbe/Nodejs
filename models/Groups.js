const mongoose = require('mongoose');

const Group = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupDescription: {
        type: String
    },
    groupCurrency: {
        type: String,
        default: "INR"
    },
    groupOwner: {
        type: String,
        required: true
    },
    groupMembers: {
        type: Array,
        required: true
    },
    groupCategory: {
        type: String,
        default: "Others"
    },
    groupTotal: {
        type: Number, 
        default: 0
    },
    split: {
        type: Array
    }
})

module.exports = mongoose.model('groups', Group)