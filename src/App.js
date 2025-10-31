import logo from './logo.svg';
// import './App.css';
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './views/Login';
import MainDashboard from './views/MainDashboard';
import Studentmanagement from './views/StudentManagement';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<LoginPage/>}></Route>
    <Route path='/admin' element={<MainDashboard/>}></Route>
    <Route path='/admin/management' element={<Studentmanagement/>}></Route>
   </Routes>
   </BrowserRouter>

  );
}

export default App;
