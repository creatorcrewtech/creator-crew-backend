const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserTokenSchema = new Schema({
    user_id: Schema.Types.ObjectId,
    access_token: String,
    refresh_token: String,
    expiry_date: Date
}, { timestamps: true });


const UserToken = mongoose.model('tokens', UserTokenSchema);
module.exports = UserToken;