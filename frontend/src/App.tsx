import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Future routes will go here */}
          <Route path="/login" element={<div className="p-8 text-center">Login Page (Coming Soon)</div>} />
          <Route path="/register" element={<div className="p-8 text-center">Register Page (Coming Soon)</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
