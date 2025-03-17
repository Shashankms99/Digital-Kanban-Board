const SprintItemModel = require('../Models/sprintitems');
const SprintModel = require('../Models/sprint');
const UserModel = require('../Models/user');
const BacklogModel = require('../Models/backlog');

const getUsertasks = async (req, res) => {
    try {
        const { email } = req.user; 
        const user = await UserModel.findOne({ email })
        .populate('backlogsAssigned')
        .populate('backlogsReported')
        .populate('sprintItemsAssigned')
        .populate('sprintItemsReported');

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        const tasks = {
            backlogsAssigned: user.backlogsAssigned,
            backlogsReported: user.backlogsReported,
            sprintItemsAssigned: user.sprintItemsAssigned,
            sprintItemsReported: user.sprintItemsReported,
        };

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsertasks };