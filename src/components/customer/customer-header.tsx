import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';

interface CustomerHeaderProps {
  currentPage?: 'rooms' | 'cottages' | 'events' | 'bookings';
}

export function CustomerHeader({ currentPage = 'rooms' }: CustomerHeaderProps) {
  const navigate = useNavigate();
  const { logout, currentUser } = useBooking();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">PRING KUYA'S INN</h1>
            <p className="text-sm text-gray-600">Online Booking System</p>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 font-medium hidden sm:block">
                Hi, {currentUser.firstName || currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

        <nav className="flex gap-6">
          <Link
            to="/customer"
            className={`pb-2 font-medium transition-colors duration-0 ${
              currentPage === 'rooms'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Room Bookings
          </Link>
          <Link
            to="/customer/cottages"
            className={`pb-2 font-medium transition-colors duration-0 ${
              currentPage === 'cottages'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cottages
          </Link>
          <Link
            to="/customer/events"
            className={`pb-2 font-medium transition-colors duration-0 ${
              currentPage === 'events'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events
          </Link>
          <Link
            to="/customer/my-bookings"
            className={`pb-2 font-medium transition-colors duration-0 ${
              currentPage === 'bookings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Bookings
          </Link>
</nav>
      </div>
    </header>
  );
}
