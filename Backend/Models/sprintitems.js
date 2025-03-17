const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SprintItemSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'projects',
        required: true,
    },
    sprintId: {
        type: Schema.Types.ObjectId,
        ref: 'sprints',
        required: true,
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        unique: false,
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
    completionDate: {
        type: Date,
        default: null,
    },
});

SprintItemSchema.index({ projectId: 1, sprintId: 1, summary: 1 }, { unique: true });

SprintItemSchema.pre('save', function(next) {
    if (this.status === 'Done' && !this.completionDate) {
        this.completionDate = new Date();
    } else if (this.status !== 'Done') {
        this.completionDate = null;
    }
    this.updatedDate = Date.now();
    next();
});

SprintItemSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.status) {
        if (update.status === 'Done') {
            update.completionDate = new Date();
        } else {
            update.completionDate = null;
        }
    }
    update.updatedDate = Date.now();
    next();
});

const SprintItemModel = mongoose.model('sprintitems', SprintItemSchema);
module.exports = SprintItemModel;