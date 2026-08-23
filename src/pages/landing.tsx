import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../lib/context';
import { Users, Wifi, Wind, Tv, Star, ArrowRight, LogOut, Eye, CheckCircle2, Home, Sparkles, Facebook, Phone, MapPin, User as UserIcon } from 'lucide-react';

const HERO_BG = '/login-bg.jpg';

const ROOM_IMAGES = [
  'https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/2736384/pexels-photo-2736384.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/6466484/pexels-photo-6466484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/97083/pexels-photo-97083.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const TYPE_LABELS: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  suite: 'Suite',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  single: 'bg-white text-gray-800',
  double: 'bg-white text-gray-800',
  suite: 'bg-red-500 text-white',
};

function amenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi') || lower.includes('wi-fi')) return <Wifi size={13} />;
  if (lower.includes('air') || lower.includes('ac')) return <Wind size={13} />;
  if (lower.includes('tv') || lower.includes('television')) return <Tv size={13} />;
  return null;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout, rooms, cottages, services, businessInfo } = useBooking();
  const roomsRef = useRef<HTMLDivElement>(null);
  const cottagesRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const availableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'reserved');
  const availableCottages = cottages.filter((c) => c.status === 'available' || c.status === 'reserved');
  const availableServices = services.filter((s) => s.available);

  const handleExploreRooms = () => {
    roomsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreCottages = () => {
    cottagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewBook = () => {
    if (isAuthenticated && currentUser.role === 'customer') {
      navigate('/customer');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = currentUser.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : currentUser.name || currentUser.email;

  const roomTypes = [...new Set(rooms.map((r) => r.type))].length || 3;

  const SERVICE_CATEGORY_LABELS: Record<string, string> = {
    'swimming-pool': 'Swimming Pool',
    'videoke': 'Videoke',
    'cottages': 'Cottages',
    'foods': 'Foods',
  };

  const SERVICE_CATEGORY_ICONS: Record<string, string> = {
    'swimming-pool': '🏊',
    'videoke': '🎤',
    'cottages': '🏠',
    'foods': '🍽️',
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/image%20copy.png" alt="Pring Kuyas Inn" className="h-10 w-auto object-contain" />
            <span className="font-serif text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
              PRING KUYA'S INN
            </span>
          </Link>

          {/* Auth buttons / user */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/signup"
                className="text-sm font-semibold bg-amber-900 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative h-[580px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/62" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Stars */}
          <div className="flex justify-center gap-1.5 mb-5 landing-pop-up" style={{ animationDelay: '0.1s' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h1
            className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-5 landing-pop-up"
            style={{ animationDelay: '0.25s' }}
          >
            Your Perfect Stay<br />Awaits
          </h1>
          <p
            className="text-gray-200 text-lg mb-8 max-w-xl mx-auto leading-relaxed landing-fade-up"
            style={{ animationDelay: '0.5s' }}
          >
            Discover our beautifully appointed rooms, cozy cottages, and curated services — everything you need for a perfect stay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 landing-pop-in" style={{ animationDelay: '0.7s' }}>
            <button
              onClick={handleExploreRooms}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              <Home size={17} /> Explore Rooms
            </button>
            <button
              onClick={handleExploreCottages}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/20 transition-all border border-white/30 backdrop-blur-sm"
            >
              <Home size={17} /> Explore Cottages
            </button>
            <button
              onClick={handleExploreServices}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/20 transition-all border border-white/30 backdrop-blur-sm"
            >
              <Sparkles size={17} /> Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-3 divide-x divide-gray-200 text-center">
          <div className="px-6 landing-fade-up">
            <p className="text-4xl font-bold text-gray-900">{roomTypes}</p>
            <p className="text-sm text-gray-500 mt-1">Room Types</p>
          </div>
          <div className="px-6 landing-fade-up" style={{ animationDelay: '0.15s' }}>
            <p className="text-4xl font-bold text-gray-900">100%</p>
            <p className="text-sm text-gray-500 mt-1">Guest Satisfaction</p>
          </div>
          <div className="px-6 landing-fade-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-4xl font-bold text-gray-900">24/7</p>
            <p className="text-sm text-gray-500 mt-1">Concierge Service</p>
          </div>
        </div>
      </section>

      {/* ── Rooms ── */}
      <section ref={roomsRef} className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3 landing-fade-up">Our Rooms &amp; Suites</h2>
          <p className="text-gray-500 max-w-lg leading-relaxed landing-fade-up" style={{ animationDelay: '0.15s' }}>
            From cozy standard rooms to lavish suites — find the perfect space for your stay.
          </p>
        </div>

        {availableRooms.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-lg">No rooms available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {availableRooms.map((room, idx) => {
              const imgSrc = room.image || ROOM_IMAGES[idx % ROOM_IMAGES.length];
              const visibleAmenities = room.amenities.slice(0, 3);
              const extraCount = room.amenities.length - 3;

              return (
                <div
                  key={room.id}
                  className="room-card-float landing-fade-up bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer"
                  style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={`Room ${room.roomNumber}`}
                      className="room-card-img w-full h-full object-cover transition-transform duration-500"
                    />
                    <span
                      className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${TYPE_BADGE_COLORS[room.type] || 'bg-white text-gray-800'}`}
                    >
                      {TYPE_LABELS[room.type] || room.type}
                    </span>
                    {/* Hover overlay */}
                    <div className="room-card-overlay absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                      <span className="text-white text-sm font-medium flex items-center gap-1.5">
                        <Eye size={15} /> Click to view details
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">
                        Room {room.roomNumber}
                      </h3>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-xl font-bold text-gray-900">
                          ₱{room.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 block">/night</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">
                      {TYPE_LABELS[room.type]} room — a comfortable stay with all essential amenities for up to {room.capacity} guest{room.capacity !== 1 ? 's' : ''}.
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <Users size={13} />
                      <span>Up to {room.capacity} guest{room.capacity !== 1 ? 's' : ''}</span>
                    </div>

                    {room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {visibleAmenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                          >
                            {amenityIcon(amenity)}
                            {amenity}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <span className="text-xs text-gray-400 self-center">+{extraCount} more</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto">
                      <button
                        onClick={handleViewBook}
                        className="room-card-book-btn w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 text-sm"
                      >
                        View &amp; Book
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Cottages ── */}
      <section ref={cottagesRef} className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3 landing-fade-up">Our Cottages</h2>
            <p className="text-gray-500 max-w-lg leading-relaxed landing-fade-up" style={{ animationDelay: '0.15s' }}>
              Cozy cottages perfect for families and groups — enjoy privacy and comfort surrounded by nature.
            </p>
          </div>

          {availableCottages.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-lg">No cottages available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {availableCottages.map((cottage, idx) => {
                const imgSrc = cottage.image || ROOM_IMAGES[(idx + 2) % ROOM_IMAGES.length];
                return (
                  <div
                    key={cottage.id}
                    className="room-card-float landing-fade-up bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer"
                    style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={cottage.name}
                        className="room-card-img w-full h-full object-cover transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-600 text-white">
                        Cottage
                      </span>
                      <div className="room-card-overlay absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                        <span className="text-white text-sm font-medium flex items-center gap-1.5">
                          <Eye size={15} /> Click to view details
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">
                          {cottage.name}
                        </h3>
                        <div className="text-right flex-shrink-0 ml-3">
                          <span className="text-xl font-bold text-gray-900">
                            ₱{cottage.pricePerNight.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 block">/night</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">
                        {cottage.description || `Cottage ${cottage.cottageNumber} — a comfortable private space for up to ${cottage.capacity} guest${cottage.capacity !== 1 ? 's' : ''}.`}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <Users size={13} />
                        <span>Up to {cottage.capacity} guest{cottage.capacity !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="mt-auto">
                        <button
                          onClick={handleViewBook}
                          className="room-card-book-btn w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 text-sm"
                        >
                          View &amp; Book
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Services ── */}
      <section ref={servicesRef} className="bg-[#f5f0eb] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3 landing-fade-up">Our Services</h2>
            <p className="text-gray-500 max-w-lg leading-relaxed landing-fade-up" style={{ animationDelay: '0.15s' }}>
              Enhance your stay with our add-on services — from swimming pools to delicious food and entertainment.
            </p>
          </div>

          {availableServices.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-lg">No services available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableServices.map((service, idx) => (
                <div
                  key={service.id}
                  className="room-card-float landing-fade-up bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                  style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                >
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{SERVICE_CATEGORY_ICONS[service.category] || '✨'}</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {SERVICE_CATEGORY_LABELS[service.category] || service.category}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2 flex-1">
                      {service.description}
                    </p>
                    {service.capacity && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <Users size={13} />
                        <span>Up to {service.capacity} guest{service.capacity !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          ₱{service.price.toLocaleString()}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 size={14} /> Available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
              {/* Business info — stacked column on the left */}
              {(businessInfo.ownerName || businessInfo.fbLink || businessInfo.contactNumber || businessInfo.location) && (
                <div className="flex flex-col gap-2.5 text-sm text-gray-600">
                  {businessInfo.ownerName && (
                    <span className="inline-flex items-center gap-2">
                      <UserIcon size={15} className="text-amber-900 shrink-0" />
                      {businessInfo.ownerName}
                    </span>
                  )}
                  {businessInfo.contactNumber && (
                    <span className="inline-flex items-center gap-2">
                      <Phone size={15} className="text-amber-900 shrink-0" />
                      {businessInfo.contactNumber}
                    </span>
                  )}
                  {businessInfo.location && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={15} className="text-amber-900 shrink-0" />
                      {businessInfo.location}
                    </span>
                  )}
                  {businessInfo.fbLink && (
                    <a
                      href={businessInfo.fbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors w-fit"
                    >
                      <Facebook size={15} />
                      Facebook
                    </a>
                  )}
                </div>
              )}
              {/* Copyright — fully right-aligned */}
              <div className="text-sm text-gray-400 text-right">
                &copy; {new Date().getFullYear()} Pring Kuya's Inn. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
