const mongoose = require('mongoose'); 
const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        require: true, 
        unique: true, 
    }, 
    password: {
        type: String, 
        require: true, 
    }, 
    createdAt: {
        type: Date, 
        default: Date.now, 
    }
}); 
module.exports = mongoose.model('User', userSchema); 