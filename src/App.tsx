import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Register } from './pages/Register';
import { GroupReveal } from './pages/GroupReveal';
import { AdminDashboard } from './pages/AdminDashboard';
import { EventMode } from './pages/EventMode';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/group" element={<GroupReveal />} />
          <Route path="/event" element={<EventMode />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
