const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    employeeId: { 
        type: String,
        required: true,
        unique: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    projects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'projects', 
        default: []
    }],
    backlogsAssigned: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'backlogs', 
        default: []
    }],
    backlogsReported: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'backlogs', 
        default: []
    }],
    sprintItemsReported: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'sprintitems', 
        default: []
    }],
    sprintItemsAssigned: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'sprintitems', 
        default: []
    }]
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;