const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const HomeRouter = require('./Routes/HomeRouter');
const CreateProjectRouter = require('./Routes/CreateProjectRouter');
const AddUserRouter = require('./Routes/AddUserRouter');
const BacklogRouter = require('./Routes/BacklogRouter');
const ProjectRouter = require('./Routes/ProjectRouter');
const SprintRouter = require('./Routes/SprintRouter');
const SprintItemsRouter = require('./Routes/SprintItemsRouter');
const UserTaskRouter = require('./Routes/UserTaskRouter');

require('dotenv').config();
require('./Models/db');

const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

app.get('/ping', (req, res) => {
    res.send('PONG');
});

app.use(bodyParser.json());
app.use(cors());
app.use('/auth', AuthRouter);
app.use('/home', HomeRouter);
app.use('/createproject', CreateProjectRouter);
app.use('/adduser', AddUserRouter);
app.use('/backlogs', BacklogRouter);
app.use('/projects', ProjectRouter);
app.use('/sprints', SprintRouter);
app.use('/sprintitems', SprintItemsRouter);
app.use('/usertasks', UserTaskRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});