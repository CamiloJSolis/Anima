import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Analizar from './pages/Analizar.jsx';
import Historial from './pages/Historial.jsx';
import Login from './pages/Login.jsx';

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analizar" element={<Analizar />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
