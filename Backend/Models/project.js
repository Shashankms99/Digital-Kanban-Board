const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    projectName: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
        unique: true, 
    },
    lead: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now, 
    },
    members: {
        type: [String], 
        default: [], 
    },
    backlogs: [{ 
        type: Schema.Types.ObjectId,
        ref: 'backlogs',
    }],
    sprints: [{ 
        type: Schema.Types.ObjectId,
        ref: 'sprints',
    }]
});

const ProjectModel = mongoose.model('projects', ProjectSchema);
module.exports = ProjectModel;