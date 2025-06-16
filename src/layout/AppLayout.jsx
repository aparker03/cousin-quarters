import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import NameLogin from '../components/NameLogin';

function AppLayout() {
  const [username, setUsername] = useState('');

  // Load username on mount (in case page refresh happens)
  useEffect(() => {
    const saved = localStorage.getItem('cq-username');
    if (saved) setUsername(saved);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-800 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Cousin Quarters</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/" className="hover:text-purple-300">🏠 Dashboard</Link>
          <Link to="/house" className="hover:text-purple-300">🏡 House Selection</Link>
          <Link to="/results" className="hover:text-purple-300">📊 Results</Link>
          <Link to="/grocery" className="hover:text-purple-300">🛒 Grocery List</Link>
          <Link to="/budget" className="hover:text-purple-300">💰 Cost Split</Link>
          <Link to="/rentals" className="hover:text-purple-300">🚗 Rentals</Link>
          <Link to="/rental-results" className="hover:text-purple-300">🧾 Rental Results</Link>
          <Link to="/stiizy" className="hover:text-purple-300">🔐 Secret List</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <NameLogin onNameChange={setUsername} />
        <Outlet context={{ appUsername: username }} />
      </main>
    </div>
  );
}

export default AppLayout;
