import { useState, useRef } from 'react';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useBooking } from '../../lib/context';
import { supabase } from '../../lib/supabase';
import { Cottage } from '../../lib/types';
import { Plus, Trash2, Save, Pencil, Upload, Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog';

const emptyCottage: Omit<Cottage, 'id'> = {
  cottageNumber: '',
  name: '',
  description: '',
  pricePerNight: 0,
  capacity: 1,
  status: 'available',
  image: '',
};

export default function AdminCottagesPage() {
  const { cottages, addCottage, updateCottage, deleteCottage } = useBooking();
  const [draft, setDraft] = useState(emptyCottage);
  const [addOpen, setAddOpen] = useState(false);
  const [editCottage, setEditCottage] = useState<Cottage | null>(null);
  const [editDraft, setEditDraft] = useState<Omit<Cottage, 'id'>>(emptyCottage);
  const [saveTarget, setSaveTarget] = useState<Cottage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cottage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, onDone: (url: string) => void) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cottage-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error } = await supabase.storage
        .from('cottage-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('cottage-images').getPublicUrl(fileName);
      onDone(urlData.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setDraft(emptyCottage);
    setAddOpen(true);
  };

  const submitAdd = () => {
    if (!draft.cottageNumber.trim() || !draft.name.trim() || draft.pricePerNight < 0) return;
    addCottage({ ...draft, id: `cottage-${Date.now()}` });
    setDraft(emptyCottage);
    setAddOpen(false);
  };

  const openEdit = (cottage: Cottage) => {
    setEditCottage(cottage);
    setEditDraft({
      cottageNumber: cottage.cottageNumber,
      name: cottage.name,
      description: cottage.description || '',
      pricePerNight: cottage.pricePerNight,
      capacity: cottage.capacity,
      status: cottage.status,
      image: cottage.image || '',
    });
  };

  const submitEdit = () => {
    if (!editCottage) return;
    updateCottage(editCottage.id, editDraft);
    setEditCottage(null);
  };

  const confirmSave = () => {
    if (!saveTarget) return;
    updateCottage(saveTarget.id, { pricePerNight: saveTarget.pricePerNight });
    setSaveTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCottage(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Accommodation</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Cottages</h1>
                <p className="mt-2 text-slate-600">Manage cottage numbers, rates, capacity, and availability.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search cottages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <Button onClick={openAdd} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus size={18} /> Add Cottage
                </Button>
              </div>
            </div>

            {(() => {
              const q = searchQuery.trim().toLowerCase();
              const filtered = q
                ? cottages.filter((c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.cottageNumber.toLowerCase().includes(q) ||
                    (c.description || '').toLowerCase().includes(q)
                  )
                : cottages;
              return filtered.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-slate-500">{cottages.length === 0 ? 'No cottages yet.' : 'No cottages match your search.'}</p>
                    {cottages.length === 0 && (
                      <Button onClick={openAdd} className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                        <Plus size={18} /> Add your first cottage
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filtered.map((cottage) => (
                    <CottageCard
                      key={cottage.id}
                      cottage={cottage}
                      onStatusChange={(status) => updateCottage(cottage.id, { status })}
                      onEdit={() => openEdit(cottage)}
                      onDelete={() => setDeleteTarget(cottage)}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </main>
      </div>

      {/* Add Cottage Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Cottage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cottage Number</label>
                <input
                  placeholder="e.g. C-01"
                  value={draft.cottageNumber}
                  onChange={(e) => setDraft({ ...draft, cottageNumber: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cottage Name</label>
                <input
                  placeholder="e.g. Beachfront Cottage"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Short description of the cottage..."
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.pricePerNight}
                  onChange={(e) => setDraft({ ...draft, pricePerNight: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={draft.capacity}
                  onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cottage Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, (url) => setDraft({ ...draft, image: url }));
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
              {draft.image && (
                <img
                  src={draft.image}
                  alt="Preview"
                  className="mt-2 h-32 w-full rounded-lg object-cover border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAdd}
              disabled={!draft.cottageNumber.trim() || !draft.name.trim() || uploading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Add Cottage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cottage Modal */}
      <Dialog open={!!editCottage} onOpenChange={(open) => !open && setEditCottage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Cottage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cottage Number</label>
                <input
                  value={editDraft.cottageNumber}
                  onChange={(e) => setEditDraft({ ...editDraft, cottageNumber: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cottage Name</label>
                <input
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editDraft.description}
                onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={editDraft.pricePerNight}
                  onChange={(e) => setEditDraft({ ...editDraft, pricePerNight: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={editDraft.capacity}
                  onChange={(e) => setEditDraft({ ...editDraft, capacity: Number(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cottage Image</label>
              <input
                type="file"
                accept="image/*"
                ref={editFileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, (url) => setEditDraft({ ...editDraft, image: url }));
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => editFileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
              {editDraft.image && (
                <img
                  src={editDraft.image}
                  alt="Preview"
                  className="mt-2 h-32 w-full rounded-lg object-cover border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editDraft.status}
                onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as Cottage['status'] })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCottage(null)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} className="bg-blue-600 text-white hover:bg-blue-700">
              <Save size={16} /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.name || 'Cottage'}?`}
        description={
          deleteTarget
            ? `Are you sure you want to delete cottage ${deleteTarget.cottageNumber} (${deleteTarget.name})? This will permanently remove it from your listings.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function CottageCard({
  cottage,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  cottage: Cottage;
  onStatusChange: (status: Cottage['status']) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      {cottage.image ? (
        <img
          src={cottage.image}
          alt={cottage.name}
          className="h-44 w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-slate-100 text-slate-400">
          No image
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              {cottage.cottageNumber}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{cottage.name}</h2>
          </div>
          <select
            value={cottage.status}
            onChange={(e) => onStatusChange(e.target.value as Cottage['status'])}
            className="rounded-full border px-3 py-1 text-sm"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <p className="mt-3 text-slate-600">{cottage.description || 'No description added.'}</p>
        <div className="mt-5 flex items-center gap-3">
          <span className="text-slate-500">₱</span>
          <span className="font-semibold text-lg">{cottage.pricePerNight}</span>
          <span className="text-sm text-slate-500">per night · {cottage.capacity} guests</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil size={15} /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
