import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import CreateProject1 from './pages/CreateProject1';
import Board from './pages/Board';
import Backlog from './pages/Backlog';
import Report from './pages/Report';
import AddUser from './pages/AddUser';
import AddUser2 from './pages/AddUser2';
import AddUser1 from './pages/AddUser1'; 
import Details from './pages/Details'; 
import Dashboard from './pages/Dashboard';
import Cumulativeflow from './pages/reports/cumulative-flow';
import Cycletime from './pages/reports/cycle-time';
import Velocityreport from './pages/reports/velocity-report';
import Sprintburndown from './pages/reports/sprint-burn-down';
import Sprintburnup from './pages/reports/sprint-burn-up';
import { useState } from 'react';
import RefrshHandler from './RefrshHandler';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  }

  return (
    <div className="App">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path='/' element={<Navigate to="/homepage" />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/home' element={<PrivateRoute element={<Home />} />} />
        <Route path="/create-project" element={<PrivateRoute element={<CreateProject />} />} />
        <Route path="/adduser" element={<PrivateRoute element={<AddUser />} />} />
        <Route path="/create-project1" element={<PrivateRoute element={<CreateProject1 />} />} />
        <Route path="/adduser1" element={<PrivateRoute element={<AddUser1 />} />} />
        <Route path="/adduser2" element={<PrivateRoute element={<AddUser2 />} />} />
        <Route path="/board" element={<PrivateRoute element={<Board />} />} />
        <Route path="/projects" element={<PrivateRoute element={<Projects />} />} />
        <Route path="/backlog" element={<PrivateRoute element={<Backlog />} />} />
        <Route path="/reports" element={<PrivateRoute element={<Report />} />} />
        <Route path="/details" element={<PrivateRoute element={<Details />} />} />
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/reports/sprint-burn-up" element={<PrivateRoute element={<Sprintburnup />} />} />
        <Route path="/reports/sprint-burn-down" element={<PrivateRoute element={<Sprintburndown />} />} />
        <Route path="/reports/velocity-report" element={<PrivateRoute element={<Velocityreport />} />} />
        <Route path="/reports/cycle-time" element={<PrivateRoute element={<Cycletime />} />} />
        <Route path="/reports/cumulative-flow" element={<PrivateRoute element={<Cumulativeflow />} />} />
      </Routes>
    </div>
  );
}

export default App;