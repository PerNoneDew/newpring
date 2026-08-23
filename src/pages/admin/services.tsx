import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { AddServiceModal } from '../../components/admin/add-service-modal';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Edit2, Plus, Check, Trash2, Search } from 'lucide-react';
import { Service } from '../../lib/types';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { services, addService, updateService, deleteService } = useBooking();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handlePriceUpdate = (serviceId: string, newPrice: number) => {
    updateService(serviceId, { price: newPrice });
    setEditingId(null);
  };

  const handleAddService = (newService: Service) => {
    addService(newService);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <AdminHeader />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
              <p className="text-gray-600 mt-2">Manage event add-on services and pricing</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={20} />
                Add Service
              </Button>
            </div>
          </div>

          {/* Services Grid */}
          {(() => {
            const q = searchQuery.trim().toLowerCase();
            const filtered = q
              ? services.filter((s) =>
                  s.name.toLowerCase().includes(q) ||
                  (s.description || '').toLowerCase().includes(q)
                )
              : services;
            return filtered.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <p className="text-gray-500">{services.length === 0 ? 'No services found' : 'No services match your search.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((service) => (
                <Card key={service.id} className="border-l-4 border-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                      </div>
                      <Badge
                        className={service.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {service.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{service.description}</p>

                    {service.capacity && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Capacity</p>
                        <p className="text-lg font-semibold text-gray-800">{service.capacity} people</p>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Price</p>
                      {editingId === service.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            min="0"
                          />
                          <button
                            onClick={() => handlePriceUpdate(service.id, editPrice)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-2xl font-bold text-blue-600">₱{service.price}</p>
                          <button
                            onClick={() => {
                              setEditingId(service.id);
                              setEditPrice(service.price);
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <Button
                      variant={service.available ? 'outline' : 'default'}
                      onClick={() => updateService(service.id, { available: !service.available })}
                      className="w-full"
                    >
                      {service.available ? 'Disable' : 'Enable'}
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(service.id)}
                      className="w-full mt-2"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddService}
      />

      {/* Delete Service Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone and all associated records will be permanently removed."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
      />
    </div>
  );
}
