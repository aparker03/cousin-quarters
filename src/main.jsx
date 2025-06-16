import './index.css';
import './App.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { UserProvider } from './context/UserContext';

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
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/house" element={<HouseSelection />} />
        <Route path="/results" element={<Results />} />
        <Route path="/grocery" element={<GroceryList />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/rental-results" element={<RentalResults />} />
        <Route path="/stiizy" element={<Stiizy />} />
      </Route>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
