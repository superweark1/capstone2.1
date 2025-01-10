import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardHome from './Home/Dasboard-Home/DashboardHome';
import StudentHome from './Home/Student-Home/StudentHome';
import TeachersHome from './Home/Teacher-Home/TeachersHome';
import AsignsHome from './Home/Asign-Home/AsignsHome';
import ScheduleHome from './Home/Schedule-Home/ScheduleHome';
import ResearchHome from './Home/Research-Home/ResearcHome';
import PresentationHome from './Home/Presentation-Home/PresentationHome';
import SchedulerHome from './Home/Scheduler-Home/SchedulerHome';
import Login from './components/Login/Login';
import Forgotpassword from './components/forgot-password/Forgotpassword';
import Otp from './components/otp/Otp';
import NewPassword from './components/new-password/NewPassword';
import RegisterHome from './components/Register/Register-Home/RegisterHome';
import RegisterUserDashboard from './Home/Register-User-Dasboard/RegisterUserDashboard';
import Adduser from './Home/Register-AddUser-Dashboard/Adduser';
import Studentuserhome from './studentdashboard home/studentuserhome/Studentuserhome';
import Teacheruserhome from './teacherdashboard home/teacheruserhome/Teacheruserhome';
import AssignStudentPage from './studentdashboard home/AssighStudentsPage/AssignStudentPage';
import ScheduleStudentDashboard from './studentdashboard home/Schedule-stduent-Dashboard/ScheduleStudentDashboard';
import ResearchStudentDashboard from './studentdashboard home/Research-Student-Dashboard/ResearchStudentDashboard';


import Assigndasboardt from './teacherdashboard home/AssignDashboard/Assigndasboardt';
import Scheduledashboardt from './teacherdashboard home/ScheduleT/Scheduledashboardt';
import ResearchTdash from './teacherdashboard home/ResearchTdashboard/ResearchTdash';
import TeacherPresentation from './teacher components/TeacherPresentation/TeacherPresentation';
import Presentation from './components/Presentation/Presentation';
import PresentationT from './teacherdashboard home/PresentationT/PresentationT';
import MyProfileDashboard from './Home/Profile-Dashboard/Myprofile-Dashboard/MyProfileDashboard';
import EditProfileDashboard from './Home/Profile-Dashboard/EditProfile-Dashboard/EditProfileDashboard';
import TeacherProfilehome from './teacherdashboard home/TeacherProfile/TeacherProfilehome/TeacherProfilehome';
import TeacherEditprofilehome from './teacherdashboard home/TeacherProfile/TeacherEditprofilehome/TeacherEditprofilehome';
import StudentprofileHome from './studentdashboard home/Studentprofilehome/StudentprofileHome/StudentprofileHome';
import Studenteditprofile from './student components/StudentProfile/Studenteditprofile/Studenteditprofile';
import StudenteditfileHome from './studentdashboard home/Studentprofilehome/StudenteditfileHome/StudenteditfileHome';
import Gradehome from './Home/Gradehome/Gradehome';
import Gradeteacherhome from './teacherdashboard home/Gradeteacherhome/Gradeteacherhome';





function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/email-request" element={<Forgotpassword/>} />
      <Route path="/otp" element={<Otp/>} />
      <Route path="/new-password" element={<NewPassword/>} />
      <Route path="/dashboard" element={<DashboardHome/>} />
      <Route path="/student" element={<StudentHome/>} />
      <Route path="/teacher" element={<TeachersHome/>} />
      <Route path="/assign" element={<AsignsHome/>} />
      <Route path="/Schedule" element={<ScheduleHome/>} />
      <Route path="/Research" element={<ResearchHome/>} />
      <Route path="/Presentation" element={<PresentationHome/>} />
      <Route path="/Scheduler" element={<SchedulerHome/>} />
      <Route path="/User" element={<RegisterUserDashboard/>} />
      <Route path="/User/register-user" element={<Adduser/>} />
      <Route path="/MyProfile" element={<MyProfileDashboard/>} />
      <Route path="/EditProfile" element={<EditProfileDashboard/>} />
      <Route path="/Presentation/Grade" element={<Gradehome/>} />

      <Route path="/student-Dashboard" element={<Studentuserhome/>} />
      <Route path="/Assigned" element={<AssignStudentPage/>} />
      <Route path="/student-Schedule" element={<ScheduleStudentDashboard/>} />
      <Route path="/student-Research" element={<ResearchStudentDashboard/>} />
      <Route path="/student-profile" element={<StudentprofileHome/>} />
      <Route path="/student-editprofile" element={<StudenteditfileHome/>} />

      <Route path="/teacher-Dashboard" element={<Teacheruserhome/>} />
      <Route path="/teacher-assign" element={<Assigndasboardt/>} />
      <Route path="/teacher-schedule" element={<Scheduledashboardt/>} />
      <Route path="/teacher-presentation" element={<PresentationT/>} />
      <Route path="/teacher-Research" element={<ResearchTdash/>} />
      <Route path="/teacher-Profile" element={<TeacherProfilehome/>} />
      <Route path="/teacher-EditProfile" element={<TeacherEditprofilehome/>} />
      <Route path="/teacher-grading" element={<Gradeteacherhome/>} />
      









  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
