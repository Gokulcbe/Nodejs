const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    postId:{
        required: true,
        type: Number,
    },
    content:{
        required: true,
        type: String,
    },
    location: {
        required: true,
        type: String,
    },
    author: {
        required: true,
        type: String,
    }
})

module.exports = mongoose.model('postData', dataSchema);