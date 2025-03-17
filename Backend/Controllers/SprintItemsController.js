const SprintItemModel = require('../Models/sprintitems');
const SprintModel = require('../Models/sprint');
const UserModel = require('../Models/user');
const BacklogModel = require('../Models/backlog');

const createSprintItem = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const {
            projectId,
            sprintId,
            summary,
            issueType,
            description,
            priority,
            reporter,
            assignee,
            storyPoints,
            backlogId,
            parent,
            child,
        } = req.body;

        const existingItem = await SprintItemModel.findOne({ projectId, sprintId, summary });
        if (existingItem) {
            return res.status(400).json({
                message: 'Sprint item creation failed.',
                reason: `A sprint item with the summary "${summary}" already exists in this sprint.`,
                success: false,
            });
        }

        let parentId = null;
        let parentModel = null;
        if (parent && parent.id && parent.model) {
            const parentRef = parent.model === 'backlogs' ? BacklogModel : SprintItemModel;
            const parentRecord = await parentRef.findById(parent.id);
            if (!parentRecord) {
                return res.status(404).json({
                    message: 'Parent record not found.',
                    success: false,
                });
            }
            parentId = parent.id;
            parentModel = parent.model;
        }

        const childIds = [];
        const childModels = [];
        if (Array.isArray(child) && child.length > 0) {
            for (const item of child) {
                const childRef = item.model === 'backlogs' ? BacklogModel : SprintItemModel;
                const childRecord = await childRef.findById(item.id);
                if (!childRecord) {
                    return res.status(404).json({
                        message: `Child record with ID "${item.id}" not found.`,
                        success: false,
                    });
                }
                childIds.push(item.id);
                childModels.push(item.model);
            }
        }

        const newSprintItem = new SprintItemModel({
            projectId,
            sprintId,
            summary,
            issueType,
            description,
            priority,
            reporter,
            assignee,
            storyPoints,
            parent: parentId,
            parentModel,
            child: childIds,
            childModel: childModels,
        });

        const savedSprintItem = await newSprintItem.save();

        await SprintModel.findByIdAndUpdate(sprintId, {
            $push: { sprintItems: savedSprintItem._id },
        });

        if (parentId && parentModel) {
            const parentRef = parentModel === 'backlogs' ? BacklogModel : SprintItemModel;
            const parentRecord = await parentRef.findById(parentId);
            if (parentRecord) {
                const index = parentRecord.child.indexOf(backlogId);
                if (index !== -1) {
                    parentRecord.child.splice(index, 1);
                    parentRecord.childModel.splice(index, 1);
                }
                
                parentRecord.child.push(savedSprintItem._id);
                parentRecord.childModel.push('sprintitems');
                await parentRecord.save();
            }
        }
        
        if (childIds.length > 0) {
            for (let i = 0; i < childIds.length; i++) {
                const childRef = childModels[i] === 'backlogs' ? BacklogModel : SprintItemModel;
                const childRecord = await childRef.findById(childIds[i]);
                if (childRecord) {
                    childRecord.parent = savedSprintItem._id;
                    childRecord.parentModel = 'sprintitems';
                    await childRecord.save();
                }
            }
        }

        const updates = [
            UserModel.findOneAndUpdate(
                { email: reporter },
                { $addToSet: { sprintItemsReported: savedSprintItem._id } },
                { new: true }
            ),
        ];

        if (assignee) {
            updates.push(
                UserModel.findOneAndUpdate(
                    { email: assignee },
                    { $addToSet: { sprintItemsAssigned: savedSprintItem._id } },
                    { new: true }
                )
            );
        }

        const [updatedReporter, updatedAssignee] = await Promise.all(updates);

        if (!updatedReporter) {
            return res.status(404).json({
                message: "Reporter not found. Please check the reporter's email.",
                success: false,
            });
        }

        if (assignee && !updatedAssignee) {
            return res.status(404).json({
                message: "Assignee not found. Please check the assignee's email.",
                success: false,
            });
        }

        if (backlogId) {
            await UserModel.updateOne(
                { email: reporter },
                { $pull: { backlogsReported: backlogId } }
            );

            if (assignee) {
                await UserModel.updateOne(
                    { email: assignee },
                    { $pull: { backlogsAssigned: backlogId } }
                );
            }

            await BacklogModel.findByIdAndDelete(backlogId);
        }

        res.status(201).json({
            message: 'Sprint item created successfully.',
            sprintItem: savedSprintItem,
            success: true,
        });
    } catch (err) {
        console.error('Error creating sprint item:', err);
        res.status(500).json({
            message: 'Internal server error.',
            reason: 'Unexpected error occurred while creating sprint item.',
            success: false,
        });
    }
};

const getSprintItems = async (req, res) => {
    try {
        const { sprintitemid } = req.params;
        const sprintItems = await SprintItemModel.find({ sprintitemid }).populate('parent').populate('child');
        res.status(200).json({ sprintItems, success: true });
    } catch (err) {
        console.error('Error fetching sprint items:', err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

module.exports = { createSprintItem, getSprintItems };