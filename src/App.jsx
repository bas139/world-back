import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import FloorSelection from './pages/FloorSelection';
import SlotSelection from './pages/SlotSelection';
import Information from './pages/Information';
import Ticket from './pages/Ticket';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/floor" element={<FloorSelection />} />
        <Route path="/slot" element={<SlotSelection />} />
        <Route path="/information" element={<Information />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
