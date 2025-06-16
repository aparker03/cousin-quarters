import './index.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AppLayout from './layout/AppLayout';
import Dashboard from './App.jsx';
import HouseSelection from './pages/HouseSelection.jsx';
import Results from './pages/Results.jsx';
import GroceryList from './pages/GroceryList.jsx';
import Budget from './pages/Budget.jsx';
import Rentals from './pages/Rentals.jsx';
import RentalResults from './pages/RentalResults.jsx';
import Stiizy from './pages/Stiizy.jsx';

function AppRouter() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cq-username');
    if (saved) setUsername(saved);
  }, []);

  return (
    <Routes>
      <Route element={<AppLayout username={username} />}>
        <Route path="/" element={<Dashboard appUsername={username} />} />
        <Route path="/house" element={<HouseSelection appUsername={username} />} />
        <Route path="/results" element={<Results appUsername={username} />} />
        <Route path="/grocery" element={<GroceryList appUsername={username} />} />
        <Route path="/budget" element={<Budget appUsername={username} />} />
        <Route path="/rentals" element={<Rentals appUsername={username} />} />
        <Route path="/rental-results" element={<RentalResults appUsername={username} />} />
        <Route path="/stiizy" element={<Stiizy appUsername={username} />} />
      </Route>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);
