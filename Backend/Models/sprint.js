const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SprintSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'projects',
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        default: function() {
            return this.startDate ? new Date(this.startDate.getTime() + 14 * 24 * 60 * 60 * 1000) : Date.now() + 14 * 24 * 60 * 60 * 1000;
        },
    },
    duration: {
        type: String,
        enum: ['2 weeks', '3 weeks', '4 weeks'],
        default: '2 weeks',
    },
    status: {
        type: String,
        enum: ['created', 'started', 'completed'],
        default: 'created',
    },
    sprintItems: [{
        type: Schema.Types.ObjectId,
        ref: 'sprintitems',
    }],
    createdDate: {
        type: Date,
        default: Date.now,
    },
    updatedDate: {
        type: Date,
        default: Date.now,
    },
});

SprintSchema.pre('save', function(next) {
    this.updatedDate = new Date();
    next();
});

const Sprint = mongoose.model('sprints', SprintSchema);
module.exports = Sprint;