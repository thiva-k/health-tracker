// App.js
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import {Navbar} from './components/Navbar';
import { AuthContextProvider } from "./context/AuthContext";

function App() {
  return (
  <AuthContextProvider>
    <Router>
      <Navbar />
      <Routes>
      <Route exact path="/" element = <Home /> />
      <Route exact path="/dashboard" element = <Dashboard /> />
      </Routes>
  </Router>
</AuthContextProvider>
 );
}

export default App;
