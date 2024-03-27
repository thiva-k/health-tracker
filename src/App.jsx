// App.js
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import PatientsPage from './components/PatientsPage';
import {Navbar} from './components/Navbar';
import HealthDiaryPage from './components/HealthDiaryPage';
import { AuthContextProvider } from "./context/AuthContext";
import { UserRoleProvider } from './context/UserRoleContext';
import PatientDiary from './components/PatientDiary';
import BookAppointmentPage from './components/BookAppointmentPage';
import HealthMetricTrackerPage from './components/HealthMetricPage';
import PatientsMetricPage from './components/PatientsMetric';
import ChatListPage from './components/ChatListPage';
import ChatPage from './components/ChatPage';
import DoctorChatList from './components/DoctorChatList';
import DoctorChatPage from './components/DoctorChatPage';

function App() {
  return (
  <AuthContextProvider>
    <UserRoleProvider>
    <Router>
      <Navbar />
      <Routes>
      <Route exact path="/" element = <Home /> />
      <Route exact path="/dashboard" element = <Dashboard /> />
      <Route exact path="/patients" element = <PatientsPage /> />
      <Route exact path="/diary" element = <HealthDiaryPage/> />
      <Route exact path="/patients/diary/:userId" element=<PatientDiary /> />
      <Route exact path="/patients/metrics/:userId" element=<PatientsMetricPage /> />
      <Route exact path="/appointment" element=<BookAppointmentPage /> />
      <Route exact path="/tracker" element=<HealthMetricTrackerPage /> />
      <Route exact path="/chat" element=<ChatListPage/> />
      <Route path="/chat/:doctorId" element=<ChatPage/> />
      <Route exact path="/doctor/chat" element=<DoctorChatList/> />
      <Route path="/doctor/chat/:patientId" element=<DoctorChatPage/> />
      </Routes>
  </Router>
  </UserRoleProvider>
</AuthContextProvider>
 );
}

export default App;
