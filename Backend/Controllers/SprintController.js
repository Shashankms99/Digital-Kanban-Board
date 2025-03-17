const Sprint = require('../Models/sprint');
const ProjectModel = require('../Models/project');

exports.createSprint = async (req, res) => {
    try {
        const { projectId, name, startDate, endDate, duration, status, sprintItems } = req.body;

        let uniqueName = name;
        let counter = 1;

        while (await Sprint.findOne({ projectId, name: uniqueName })) {
            uniqueName = `${name} sub${counter}`;
            counter++;
        }

        const newSprint = new Sprint({
            projectId,
            name: uniqueName,
            startDate: startDate || Date.now(), 
            endDate: endDate || (startDate ? new Date(new Date(startDate).getTime() + 14 * 24 * 60 * 60 * 1000) : Date.now() + 14 * 24 * 60 * 60 * 1000), 
            duration: duration || '2 weeks',
            status: status || 'created', 
            sprintItems: sprintItems || [],
        });

        const savedSprint = await newSprint.save();

        await ProjectModel.findByIdAndUpdate(
            projectId,
            { $push: { sprints: savedSprint._id } },
            { new: true, useFindAndModify: false }
        );

        res.status(201).json({ message: 'Sprint created successfully', sprint: savedSprint });
    } catch (error) {
        console.error('Error creating sprint:', error);
        res.status(500).json({ message: 'Error creating sprint' });
    }
};

exports.getSprints = async (req, res) => {
    try {
        const { projectId } = req.params;
        const sprints = await Sprint.find({ projectId })
            .sort({ startDate: -1 })
            .populate('sprintItems');
        res.status(200).json({ sprints });
    } catch (error) {
        console.error('Error fetching sprints:', error);
        res.status(500).json({ message: 'Error fetching sprints' });
    }
};

exports.getStartedSprints = async (req, res) => {
    try {
        const { projectId } = req.params;
        const sprints = await Sprint.find({ projectId, status: 'started' })
            .sort({ startDate: -1 })
            .populate({
                path: 'sprintItems',
                model: 'sprintitems',
            });

        if (!sprints || sprints.length === 0) {
            return res.status(404).json({ message: 'No started sprints found' });
        }

        res.status(200).json({ sprints });
    } catch (error) {
        console.error('Error fetching started sprints:', error);
        res.status(500).json({ message: 'Error fetching started sprints' });
    }
};

exports.completeSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const updatedSprint = await Sprint.findByIdAndUpdate(
            sprintId,
            { status: 'completed', updatedDate: new Date() },
            { new: true }
        );

        if (!updatedSprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        res.status(200).json({ message: 'Sprint completed successfully', sprint: updatedSprint });
    } catch (error) {
        console.error('Error completing sprint:', error);
        res.status(500).json({ message: 'Error completing sprint' });
    }
};

exports.changeSprintName = async (req, res) => {
    try {

        const { sprintId } = req.params;
        const { newName } = req.body;

        if (!newName || newName.trim() === "") {
            return res.status(400).json({ message: "Sprint name cannot be empty" });
        }

        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: "Sprint not found" });
        }

        const existingSprint = await Sprint.findOne({
            projectId: sprint.projectId,
            name: newName,
            _id: { $ne: sprintId },
        });

        if (existingSprint) {
            return res.status(400).json({ message: "A sprint with this name already exists in the project" });
        }

        const updatedSprint = await Sprint.findByIdAndUpdate(
            sprintId,
            { name: newName, updatedDate: new Date() },
            { new: true }
        );

        res.status(200).json({ message: "Sprint name updated successfully", sprint: updatedSprint });
    } catch (error) {
        console.error("Error changing sprint name:", error);
        res.status(500).json({ message: "Error changing sprint name" });
    }
};
exports.moveToNewSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const currentSprint = await Sprint.findById(sprintId).populate('sprintItems');
        if (!currentSprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        const incompleteItems = currentSprint.sprintItems.filter(
            (item) => item.status === 'To Do' || item.status === 'In Progress'
        );

        if (incompleteItems.length === 0) {
            return res.status(400).json({ message: 'No incomplete items to move' });
        }

        const newSprint = new Sprint({
            projectId: currentSprint.projectId,
            name: `${currentSprint.name} - Continuation`,
            startDate: Date.now(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            duration: '2 weeks',
            status: 'created',
            sprintItems: incompleteItems.map((item) => item._id),
        });

        const savedNewSprint = await newSprint.save();

        await ProjectModel.findByIdAndUpdate(
            currentSprint.projectId,
            { $push: { sprints: savedNewSprint._id } },
            { new: true, useFindAndModify: false }
        );

        currentSprint.sprintItems = currentSprint.sprintItems.filter(
            (item) => item.status === 'Done'
        );
        await currentSprint.save();

        currentSprint.status = 'completed';
        currentSprint.endDate = Date.now();
        await currentSprint.save();

        res.status(200).json({
            message: 'Moved incomplete items to a new sprint and completed the current sprint',
            newSprint: savedNewSprint,
        });
    } catch (error) {
        console.error('Error moving items to new sprint:', error);
        res.status(500).json({ message: 'Error moving items to new sprint' });
    }
};