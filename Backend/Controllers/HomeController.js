const ProjectModel = require("../Models/project");
const UserModel = require("../Models/user");

const getUserProjects = async (req, res) => {
    try {
        const { email } = req.user; 
        const user = await UserModel.findOne({ email }).populate('projects');

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        if (!user.projects || user.projects.length === 0) {
            return res.status(200).json({
                message: "No projects found for this user.",
                success: true,
                projects: [],
            });
        }

        const projects = user.projects.map((project) => ({
            _id: project._id,
            projectName: project.projectName,
            key: project.key,
            lead: project.lead,
        }));

        res.status(200).json({
            message: "Projects retrieved successfully.",
            success: true,
            projects,
        });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};

module.exports = { getUserProjects };