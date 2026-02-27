import React, { useState, useEffect } from 'react';
import { useRealtime } from '../../contexts/RealtimeContext';
import { GlassCard } from '../../components/layout/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter } from 'lucide-react';

export const BedsTab: React.FC = () => {
  const { beds } = useRealtime();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredBeds = beds.filter(bed => {
    if (filter !== 'all' && bed.status !== filter) return false;
    if (search && !bed.bedNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <p className="text-sm text-neutral-500">Total Beds</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-green-500">
          <p className="text-sm text-neutral-500">Available</p>
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-red-500">
          <p className="text-sm text-neutral-500">Occupied</p>
          <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-neutral-500">Cleaning</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.cleaning}</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search bed number..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
        </select>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filteredBeds.map((bed) => (
          <GlassCard key={bed.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-lg">{bed.bedNumber}</span>
              <Badge variant={
                bed.status === 'available' ? 'success' :
                bed.status === 'occupied' ? 'danger' :
                bed.status === 'cleaning' ? 'warning' : 'outline'
              }>
                {bed.status}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500">{bed.ward} • Floor {bed.floor}</p>
            {bed.currentPatientName && (
              <div className="mt-3 p-2 bg-neutral-50 rounded">
                <p className="text-xs text-neutral-500">Patient</p>
                <p className="font-medium">{bed.currentPatientName}</p>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
