import { useState } from 'react';
import { CustomerHeader } from '../../components/customer/customer-header';
import { useBooking } from '../../lib/context';
import { Cottage, Booking } from '../../lib/types';
import { Button } from '../../components/ui/button';
import { CalendarDays, Search, Users, X } from 'lucide-react';
import { showErrorNotification, showSuccessNotification } from '../../lib/notifications';

const datesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean =>
  start1 < end2 && start2 < end1;

export default function CustomerCottagesPage() {
  const { cottages, bookings, addBooking, currentUser } = useBooking();
  const [selected, setSelected] = useState<Cottage | null>(null);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '', guests: 1 });
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const filtered = cottages.filter(c => c.status !== 'maintenance' && (activeQuery === '' ||
    c.name.toLowerCase().includes(activeQuery.toLowerCase()) ||
    c.cottageNumber.toLowerCase().includes(activeQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(activeQuery.toLowerCase())));

  const submit = () => {
    if (!selected || !dates.checkIn || !dates.checkOut || dates.checkOut <= dates.checkIn) { showErrorNotification({ title: 'Choose valid dates', description: 'Select a check-in and check-out date before booking.' }); return; }
    if (dates.guests > selected.capacity) { showErrorNotification({ title: 'Capacity exceeded', description: `This cottage accommodates up to ${selected.capacity} guests.` }); return; }
    const conflict = bookings.find(booking =>
      booking.bookingType === 'cottage' &&
      booking.cottageId === selected.id &&
      !['cancelled', 'checked-out', 'rejected'].includes(booking.status) &&
      datesOverlap(dates.checkIn, dates.checkOut, booking.checkInDate, booking.checkOutDate)
    );
    if (conflict) {
      showErrorNotification({ title: 'Cottage unavailable', description: `This cottage is reserved from ${conflict.checkInDate} to ${conflict.checkOutDate}. Choose different dates.` });
      return;
    }
    const nights = Math.max(1, Math.ceil((new Date(`${dates.checkOut}T00:00:00`).getTime() - new Date(`${dates.checkIn}T00:00:00`).getTime()) / 86400000));
    const booking: Booking = { id: `BOOKING-${Date.now()}`, guestName: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(), guestEmail: currentUser.email, guestPhone: currentUser.phone || '', bookingType: 'cottage', cottageId: selected.id, cottageNumber: selected.cottageNumber, checkInDate: dates.checkIn, checkOutDate: dates.checkOut, status: 'pending', totalPrice: selected.pricePerNight * nights, numberOfGuests: dates.guests, createdAt: new Date().toISOString(), paymentStatus: 'pending', createdBy: 'customer' };
    addBooking(booking); setSelected(null); setDates({ checkIn: '', checkOut: '', guests: 1 }); showSuccessNotification({ title: 'Cottage requested', description: 'Your cottage reservation is now pending confirmation.' });
  };

  return <div className="min-h-screen bg-slate-50"><CustomerHeader currentPage="cottages" /><main className="mx-auto max-w-7xl px-4 py-10"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Stay your way</p><h1 className="mt-2 text-4xl font-bold text-slate-900">Private cottages</h1><p className="mt-3 max-w-2xl text-slate-600">Find a quiet base for pool days, family gatherings, and weekends away.</p></div><div className="mb-6 flex gap-3"><div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setActiveQuery(query); }} placeholder="Search by name, number, or keyword" className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" /></div><Button onClick={() => setActiveQuery(query)} className="bg-blue-600 text-white hover:bg-blue-700">Search</Button>{activeQuery && <Button variant="outline" onClick={() => { setQuery(''); setActiveQuery(''); }} className="border-slate-300 text-slate-600 hover:bg-slate-50">Clear</Button>}</div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.length === 0 ? <p className="col-span-full py-12 text-center text-slate-500">No cottages match "{activeQuery}". Try a different search.</p> : filtered.map(cottage => <article key={cottage.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">{cottage.image ? <img src={cottage.image} alt={cottage.name} className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center bg-blue-50 text-blue-300"><CalendarDays size={42} /></div>}<div className="p-6"><div className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">{cottage.cottageNumber}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{cottage.name}</h2></div><p className="font-bold text-blue-700">₱{cottage.pricePerNight}<span className="block text-xs font-normal text-slate-500">per night</span></p></div><p className="mt-3 text-slate-600">{cottage.description || 'A comfortable private cottage for your next stay.'}</p><div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Users size={16} /> Up to {cottage.capacity} guests</div><Button onClick={() => setSelected(cottage)} className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700">Book this cottage</Button></div></article>)}</div></main>{selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold uppercase tracking-widest text-blue-600">{selected.cottageNumber}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Book {selected.name}</h2></div><button onClick={() => setSelected(null)} aria-label="Close booking dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div><div className="mt-6 space-y-4"><label className="block text-sm font-medium text-slate-700">Check in<input type="date" value={dates.checkIn} onChange={e => setDates({ ...dates, checkIn: e.target.value })} min={new Date().toISOString().split('T')[0]} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm font-medium text-slate-700">Check out<input type="date" value={dates.checkOut} onChange={e => setDates({ ...dates, checkOut: e.target.value })} min={dates.checkIn || new Date().toISOString().split('T')[0]} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm font-medium text-slate-700">Guests<input type="number" min="1" max={selected.capacity} value={dates.guests} onChange={e => setDates({ ...dates, guests: Number(e.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><Button onClick={submit} className="w-full bg-blue-600 text-white hover:bg-blue-700">Request reservation</Button></div></div></div>}</div>;
}
