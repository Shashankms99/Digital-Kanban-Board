const BacklogModel = require("../Models/backlog");
const ProjectModel = require("../Models/project");
const UserModel = require("../Models/user");
const SprintItemModel = require("../Models/sprintitems");

const createBacklog = async (req, res) => {
    const { projectId, summary, issueType, description, priority, reporter, assignee, storyPoints, parent, child } = req.body;

    try {
        if (!projectId || !summary || !issueType || !reporter) {
            return res.status(400).json({
                message: "Missing required fields: projectId, summary, issueType, or reporter.",
                success: false,
            });
        }

        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Project not found. Please check the project ID.",
                success: false,
            });
        }

        const existingIssue = await BacklogModel.findOne({ projectId, summary });
        if (existingIssue) {
            return res.status(409).json({
                message: `An issue with the summary "${summary}" already exists in this project.`,
                success: false,
            });
        }

        let parentRecord = null;
        if (parent) {
            const parentModel = parent.model === 'backlogs' ? BacklogModel : SprintItemModel;
            parentRecord = await parentModel.findById(parent.id);
            if (!parentRecord) {
                return res.status(404).json({
                    message: "Parent record not found. Please check the parent ID and model.",
                    success: false,
                });
            }
        }

        if (child && child.length > 0) {
            for (const item of child) {
                const childModel = item.model === 'backlogs' ? BacklogModel : SprintItemModel;
                const childRecord = await childModel.findById(item.id);
                if (!childRecord) {
                    return res.status(404).json({
                        message: `Child record with ID "${item.id}" not found. Please check the child IDs and models.`,
                        success: false,
                    });
                }
            }
        }

        const newBacklog = new BacklogModel({
            projectId,
            summary,
            issueType,
            description,
            priority,
            reporter,
            assignee,
            storyPoints,
            parent: parent ? parent.id : null,
            parentModel: parent ? parent.model : null,
            child,
        });

        await newBacklog.save();

        if (parentRecord) {
            await parentRecord.updateOne({
                $push: {
                    child: newBacklog._id,
                    childModel: 'backlogs',
                },
            });
        }

        project.backlogs.push(newBacklog._id);
        await project.save();

        const updates = [
            UserModel.findOneAndUpdate(
                { email: reporter },
                { $addToSet: { backlogsReported: newBacklog._id } },
                { new: true }
            )
        ];

        if (assignee) {
            updates.push(
                UserModel.findOneAndUpdate(
                    { email: assignee },
                    { $addToSet: { backlogsAssigned: newBacklog._id } },
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

        res.status(201).json({
            message: "Backlog created successfully.",
            success: true,
            backlog: newBacklog,
            members: project.members,
        });
    } catch (err) {
        console.error('Create backlog error:', err);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
            success: false,
            error: err.message || "An unknown error occurred.",
        });
    }
};

module.exports = { createBacklog };