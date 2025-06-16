import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import NameLogin from '../components/NameLogin';
import { useUser } from '../context/UserContext';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('cq-sidebar-open');
    return saved === 'true';
  });

  const { name } = useUser();

  useEffect(() => {
    localStorage.setItem('cq-sidebar-open', sidebarOpen.toString());
  }, [sidebarOpen]);

  const handleMobileNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center bg-purple-800 text-white px-4 py-3 shadow">
        <h2 className="text-xl font-bold">Cousin Quarters</h2>
        <button
          className="text-white focus:outline-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      {(sidebarOpen || window.innerWidth >= 768) && (
        <aside
          className={`bg-purple-800 text-white p-6 md:w-64 w-full md:block ${
            sidebarOpen ? 'block' : 'hidden'
          }`}
        >
          <h2 className="text-2xl font-bold mb-6 hidden md:block">Cousin Quarters</h2>
          <nav className="flex flex-col gap-4">
            <Link to="/" className="hover:text-purple-300" onClick={handleMobileNavClick}>🏠 Dashboard</Link>
            <Link to="/house" className="hover:text-purple-300" onClick={handleMobileNavClick}>🏡 House Selection</Link>
            <Link to="/results" className="hover:text-purple-300" onClick={handleMobileNavClick}>📊 Results</Link>
            <Link to="/grocery" className="hover:text-purple-300" onClick={handleMobileNavClick}>🛒 Grocery List</Link>
            <Link to="/budget" className="hover:text-purple-300" onClick={handleMobileNavClick}>💰 Cost Split</Link>
            <Link to="/rentals" className="hover:text-purple-300" onClick={handleMobileNavClick}>🚗 Rentals</Link>
            <Link to="/rental-results" className="hover:text-purple-300" onClick={handleMobileNavClick}>🧾 Rental Results</Link>
            <Link to="/stiizy" className="hover:text-purple-300" onClick={handleMobileNavClick}>🔐 Secret List</Link>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-auto max-w-full">
        <NameLogin />
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
