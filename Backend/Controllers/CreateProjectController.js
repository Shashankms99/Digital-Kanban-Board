const ProjectModel = require("../Models/project");
const UserModel = require("../Models/user");

const createProject = async (req, res) => {
    try {
        const { projectName, key, lead, members = [] } = req.body;

        if (!projectName || !key) {
            return res.status(400).json({
                message: "Project Name and Key are required.",
                success: false,
            });
        }

        const existingProject = await ProjectModel.findOne({ key });
        if (existingProject) {
            return res.status(400).json({
                message: "Project Key already exists.",
                success: false,
            });
        }

        const newProject = new ProjectModel({
            projectName,
            key,
            lead,
            members: [...members, lead],
        });

        await newProject.save();

        const leadUser = await UserModel.findOne({ email: lead });

        if (!leadUser) {
            return res.status(404).json({ 
                message: 'Lead user not found.', 
                success: false 
            });
        }

        leadUser.projects.push(newProject._id);
        await leadUser.save();

        res.status(201).json({
            message: "Project created successfully and assigned to lead user.",
            success: true,
            project: newProject,
        });
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};

module.exports = { createProject };