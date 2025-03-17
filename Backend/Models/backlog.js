const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BacklogSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'projects',
        required: true,
    },
    summary: {  
        type: String,
        required: true,
    },
    issueType: {
        type: String,
        enum: ['Epic', 'Bug', 'Story', 'Task'],
        required: true,
    },
    description: {
        type: String,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done'],
        default: 'To Do',
    },
    reporter: {
        type: String,
        required: true, 
    },
    assignee: {
        type: String,
    },
    storyPoints: {
        type: Number,
        min: 0,
        required: true,
    },
    parent: {
        type: Schema.Types.ObjectId,
        refPath: 'parentModel',
    },
    parentModel: {
        type: String,
        enum: ['backlogs', 'sprintitems'],
    },
    child: [
        {
            type: Schema.Types.ObjectId,
            refPath: 'childModel',
        }
    ],
    childModel: [
        {
            type: String,
            enum: ['backlogs', 'sprintitems'],
        }
    ],
    createdDate: {
        type: Date,
        default: Date.now,
    },
    updatedDate: {
        type: Date,
        default: Date.now,
    },
});

BacklogSchema.index({ projectId: 1, summary: 1 }, { unique: true });

BacklogSchema.pre('save', function(next) {
    this.updatedDate = Date.now();
    next();
});

const BacklogModel = mongoose.model('backlogs', BacklogSchema);
module.exports = BacklogModel;