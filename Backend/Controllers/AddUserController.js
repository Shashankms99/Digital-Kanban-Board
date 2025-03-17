const ProjectModel = require("../Models/project");
const UserModel = require("../Models/user");

const addUserToProject = async (req, res) => {
    try {
        const { email, projectId } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Project not found",
                success: false,
            });
        }

        if (user.projects.includes(projectId)) {
            return res.status(400).json({
                message: "User is already added to the project",
                success: false,
            });
        }

        if (project.members.includes(email)) {
            return res.status(400).json({
                message: "User is already a member of this project",
                success: false,
            });
        }

        user.projects.push(projectId);
        await user.save();

        project.members.push(email);
        await project.save();

        res.status(200).json({
            message: "User added to project successfully",
            success: true,
        });
    } catch (err) {
        console.error('Error adding user to project:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

module.exports = { addUserToProject };