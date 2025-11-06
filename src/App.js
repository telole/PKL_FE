// import logo from './logo.svg';
// import './App.css';
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './views/Login';
import MainDashboard from './views/MainDashboard';
import Studentmanagement from './views/StudentManagement';
import StoreStudent from './composables/cards/StudentManagementCard/StoreStudentDataPanel';
import Document from './views/StudentDocument';
import { RequireAuth } from './composables/hooks/useAuth';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<LoginPage/>}></Route>
    <Route path='/admin' element={<RequireAuth roles={["teacher","admin","supervisor"]}><MainDashboard/></RequireAuth>}></Route>
    <Route path='/admin/management' element={<RequireAuth roles={["teacher","admin","supervisor"]}><Studentmanagement/></RequireAuth>}></Route>
    <Route path='/admin/Student' element={<RequireAuth roles={["teacher","admin","supervisor"]}><StoreStudent/></RequireAuth>}></Route>
    <Route path='/admin/document' element={<RequireAuth roles={["teacher","admin","supervisor"]}><Document/></RequireAuth>}></Route>
   </Routes>
   </BrowserRouter>

  );
}

export default App;
