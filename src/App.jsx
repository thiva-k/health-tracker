// App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import PatientsPage from './components/PatientsPage';
import { Navbar } from './components/Navbar';
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
import Footer from './components/Footer';
import ReportListPage from './components/ReportListPage';
import ReportViewPage  from './components/ReportViewPage';
import PatientsReportListPage from './components/PatientsReportListPage';
import PatientsReportViewPage from './components/PatientsReportViewPage';
import './App.css'; // Import CSS file

function App() {
  return (
    <AuthContextProvider>
      <UserRoleProvider>
        <Router>
          <div className="App">
            <Navbar />
            <div className="MainContent">
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/dashboard" element={<Dashboard />} />
                <Route exact path="/patients" element={<PatientsPage />} />
                <Route exact path="/diary" element={<HealthDiaryPage />} />
                <Route exact path="/patients/diary/:userId" element={<PatientDiary />} />
                <Route exact path="/patients/metrics/:userId" element={<PatientsMetricPage />} />
                <Route exact path="/appointment" element={<BookAppointmentPage />} />
                <Route exact path="/tracker" element={<HealthMetricTrackerPage />} />
                <Route exact path="/chat" element={<ChatListPage />} />
                <Route path="/chat/:doctorId" element={<ChatPage />} />
                <Route exact path="/doctor/chat" element={<DoctorChatList />} />
                <Route path="/doctor/chat/:patientId" element={<DoctorChatPage />} />
                <Route path="/reports" element={<ReportListPage />} />
                <Route path="/report/:section" element={<ReportViewPage />} />
                <Route path="/patients/reports/:patientId" element={<PatientsReportListPage />} />
                <Route path="/patients/reports/:patientId/:section" element={<PatientsReportViewPage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </UserRoleProvider>
    </AuthContextProvider>
  );
}

export default App;
