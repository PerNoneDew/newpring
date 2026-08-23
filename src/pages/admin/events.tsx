import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, Users, DollarSign, Edit2, CheckCircle, XCircle, X, CreditCard, Plus, Trash2, PartyPopper, Search } from 'lucide-react';
import { EventBooking } from '../../lib/types';
import { showSuccessNotification } from '../../lib/notifications';

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const { eventBookings, updateEventBooking, services, eventTypePrices, setEventTypePrice, addEventType, updateEventType, deleteEventType } = useBooking();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingBooking, setEditingBooking] = useState<EventBooking | null>(null);
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editAdditionalCharges, setEditAdditionalCharges] = useState<number>(0);
  const [showPricingSection, setShowPricingSection] = useState<boolean>(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventPrice, setNewEventPrice] = useState(0);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeDesc, setEditTypeDesc] = useState('');
  const [editTypePrice, setEditTypePrice] = useState(0);

  const getEventName = (type: string) => {
    const et = eventTypePrices.find(p => p.type === type);
    return et?.name || type;
  };

  const filteredBookings = eventBookings.filter((booking) => {
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
    const typeMatch = filterType === 'all' || booking.eventType === filterType;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch = !q ||
      booking.guestName.toLowerCase().includes(q) ||
      booking.guestEmail.toLowerCase().includes(q) ||
      getEventName(booking.eventType).toLowerCase().includes(q);
    return statusMatch && typeMatch && searchMatch;
  });

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    updateEventBooking(bookingId, { status: newStatus as any });
  };

  const handleEditClick = (booking: EventBooking) => {
    setEditingBooking(booking);
    setEditBasePrice(booking.basePrice || 0);
    const serviceTotal = booking.serviceIds.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    setEditAdditionalCharges(booking.totalPrice - (booking.basePrice || 0));
  };

  const handleSavePrice = () => {
    if (editingBooking) {
      const newTotal = editBasePrice + editAdditionalCharges;
      updateEventBooking(editingBooking.id, {
        basePrice: editBasePrice,
        totalPrice: newTotal,
      });
      setEditingBooking(null);
    }
  };

  const handleUpdateEventPrice = (type: string, price: number) => {
    setEventTypePrice(type, price);
    showSuccessNotification({
      title: 'Price Updated',
      description: 'Event price has been saved successfully.',
    });
  };

  const handleAddEventSubmit = () => {
    if (!newEventName.trim()) return;
    addEventType(newEventName, newEventName.trim(), newEventDesc.trim(), newEventPrice);
    setShowAddEventModal(false);
    setNewEventName('');
    setNewEventDesc('');
    setNewEventPrice(0);
    showSuccessNotification({
      title: 'Event Type Added',
      description: `${newEventName} has been added as a new event type.`,
    });
  };

  const handleEditTypeSubmit = () => {
    if (!editingType || !editTypeName.trim()) return;
    updateEventType(editingType, editTypeName.trim(), editTypeDesc.trim(), editTypePrice);
    setEditingType(null);
    showSuccessNotification({
      title: 'Event Type Updated',
      description: `${editTypeName} has been updated successfully.`,
    });
  };

  const handleDeleteType = (type: string, name: string) => {
    if (window.confirm(`Delete "${name}"? Existing bookings of this type will keep their type but no new bookings can use it.`)) {
      deleteEventType(type);
      showSuccessNotification({
        title: 'Event Type Deleted',
        description: `${name} has been removed.`,
      });
    }
  };

  const startEditType = (type: string) => {
    const et = eventTypePrices.find(p => p.type === type);
    if (!et) return;
    setEditingType(type);
    setEditTypeName(et.name);
    setEditTypeDesc(et.description);
    setEditTypePrice(et.price);
  };

  const getEventTypeColor = (_eventType: string) => {
    return 'bg-purple-100 text-purple-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEventRevenue = filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const confirmedEvents = filteredBookings.filter((b) => b.status === 'confirmed').length;
  const totalGuests = filteredBookings.reduce((sum, b) => sum + b.numberOfGuests, 0);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <AdminHeader />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Event Bookings Management</h1>
            <p className="text-gray-600 mt-2">Track and manage all event bookings</p>
          </div>

          {/* Event Type Pricing Section */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={24} className="text-green-600" />
                  <CardTitle>Event Type Pricing</CardTitle>
                </div>
                <button
                  onClick={() => setShowPricingSection(!showPricingSection)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPricingSection ? 'Hide' : 'Manage'}
                </button>
              </div>
            </CardHeader>
            {showPricingSection && (
              <CardContent className="space-y-6 border-t">
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Manage event types and their base prices. These will be shown to customers when booking events.
                  </p>
                  <button
                    onClick={() => setShowAddEventModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    <Plus size={16} /> Add Event Type
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventTypePrices.map((et) => (
                    <div key={et.type} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      {editingType === et.type ? (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                            <input
                              type="text"
                              value={editTypeName}
                              onChange={(e) => setEditTypeName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <input
                              type="text"
                              value={editTypeDesc}
                              onChange={(e) => setEditTypeDesc(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Base Price (₱)</label>
                            <input
                              type="number"
                              value={editTypePrice}
                              onChange={(e) => setEditTypePrice(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleEditTypeSubmit} className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">Save</button>
                            <button onClick={() => setEditingType(null)} className="flex-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition">Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800">{et.name}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">{et.description}</p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => startEditType(et.type)} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition" title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteType(et.type, et.name)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-600">Base Price:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-600">₱{et.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Note:</span> These are the base prices shown to customers. Additional services can be added on top of these prices.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">{filteredBookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Confirmed Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{confirmedEvents}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Guests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{totalGuests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Event Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">₱{totalEventRevenue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Guest name or event type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Types</option>
                {eventTypePrices.map((p) => (
                  <option key={p.type} value={p.type}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Event Bookings Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Event Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Host
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Guests
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Base Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Additional Charges
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Total Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No event bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <Badge className={getEventTypeColor(booking.eventType)}>
                              {getEventName(booking.eventType)}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-2">
                              {new Date(booking.eventDate).toLocaleDateString()} to{' '}
                              {new Date(booking.eventEndDate).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{booking.guestName}</p>
                            <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {booking.numberOfGuests}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          ₱{booking.basePrice || 0}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          ₱{booking.totalPrice - (booking.basePrice || 0)}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold text-blue-600">
                          ₱{booking.totalPrice}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(booking)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                              title="Edit Price"
                            >
                              <Edit2 size={18} />
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                  title="Confirm"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                  title="Cancel"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                title="Complete"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Event Type Modal */}
          {showAddEventModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
                  <CardTitle className="flex items-center gap-2"><PartyPopper size={20} /> Add Custom Event Type</CardTitle>
                  <button onClick={() => setShowAddEventModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                    <input
                      type="text"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      placeholder="e.g. Debut, Anniversary, Corporate Seminar"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      placeholder="Short description shown to customers"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₱)</label>
                    <input
                      type="number"
                      value={newEventPrice}
                      onChange={(e) => setNewEventPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowAddEventModal(false)} className="flex-1">Cancel</Button>
                    <Button onClick={handleAddEventSubmit} className="flex-1" disabled={!newEventName.trim()}>Add Event Type</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Price Modal */}
          {editingBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
                  <CardTitle>Edit Event Price</CardTitle>
                  <button
                    onClick={() => setEditingBooking(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Event: {editingBooking.guestName}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Date: {new Date(editingBooking.eventDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Event Price (₱)
                      </label>
                      <input
                        type="number"
                        value={editBasePrice}
                        onChange={(e) => setEditBasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Base price for the event itself</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Charges (₱)
                      </label>
                      <input
                        type="number"
                        value={editAdditionalCharges}
                        onChange={(e) => setEditAdditionalCharges(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Services, add-ons, and other charges</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Base Price:</span>
                      <span className="font-semibold text-gray-800">₱{editBasePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">Additional Charges:</span>
                      <span className="font-semibold text-gray-800">₱{editAdditionalCharges.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₱{(editBasePrice + editAdditionalCharges).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setEditingBooking(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSavePrice} className="flex-1">
                      Save Price
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
