let mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: [true, 'We need to know your name']
},
	username: {
        type: String,
        required :[true, 'You must enter a username']
    },
	email:{
		type: String,
		required: [true, 'You must enter an email']
	},
	password: {
        type: String,
        required: [true, 'You must enter a password']
    }
});
const userCol=mongoose.model('User', userSchema)

module.exports = userCol;