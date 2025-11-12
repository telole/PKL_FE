// import logo from './logo.svg';
// import './App.css';
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './views/Login';
import MainDashboard from './views/MainDashboard';
import Studentmanagement from './views/StudentManagement';
import StoreStudent from './composables/cards/StudentManagementCard/StoreStudentDataPanel';
import Document from './views/StudentDocument';
import Location from './views/Location';
import { RequireAuth } from './composables/hooks/useAuth';
import Teachermanagement from './views/Teachermanagement';
import CompaniesPartner from './views/CompaniesPartner';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<LoginPage/>}></Route>
    <Route path='/admin' element={<RequireAuth roles={["teacher","admin","supervisor"]}><MainDashboard/></RequireAuth>}></Route>
    <Route path='/admin/management' element={<RequireAuth roles={["teacher","admin","supervisor"]}><Studentmanagement/></RequireAuth>}></Route>
    <Route path='/admin/Student' element={<RequireAuth roles={["teacher","admin","supervisor"]}><StoreStudent/></RequireAuth>}></Route>
    <Route path='/admin/document' element={<RequireAuth roles={["teacher","admin","supervisor"]}><Document/></RequireAuth>}></Route>
    <Route path='/admin/teacher' element={<RequireAuth roles={["teacher","admin","supervisor"]}><Teachermanagement/></RequireAuth>}></Route>
    <Route path='/admin/locations' element={<RequireAuth roles={["teacher","admin","supervisor"]}><Location/></RequireAuth>}></Route>
    <Route path='/admin/partners' element={<RequireAuth roles={["teacher","admin","supervisor"]}><CompaniesPartner/></RequireAuth>}></Route>
   </Routes>
   </BrowserRouter
  );
}

export default App;
