import logo from './logo.svg';
// import './App.css';
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './views/Login';
import MainDashboard from './views/MainDashboard';
import Studentmanagement from './views/StudentManagement';
import StoreStudent from './composables/cards/StudentManagementCard/StoreStudentDataPanel';
import Document from './views/StudentDocument';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<LoginPage/>}></Route>
    <Route path='/admin' element={<MainDashboard/>}></Route>
    <Route path='/admin/management' element={<Studentmanagement/>}></Route>
    <Route path='/admin/Student' element={<StoreStudent/>}></Route>
    <Route path='/admin/document' element={<Document/>}></Route>
   </Routes>
   </BrowserRouter>

  );
}

export default App;
