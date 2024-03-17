// App.js
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import {Navbar} from './components/Navbar';
import { AuthContextProvider } from "./context/AuthContext";
import { UserRoleProvider } from './context/UserRoleContext';

function App() {
  return (
  <AuthContextProvider>
    <UserRoleProvider>
    <Router>
      <Navbar />
      <Routes>
      <Route exact path="/" element = <Home /> />
      <Route exact path="/dashboard" element = <Dashboard /> />
      <Route exact path="/patients" element = <Patients /> />
      </Routes>
  </Router>
  </UserRoleProvider>
</AuthContextProvider>
 );
}

export default App;
