const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: String,
    email: String,
    google_id: String
}, { timestamps: true });


const Users = mongoose.model('users', UserSchema);
module.exports = Users; // this is what you want