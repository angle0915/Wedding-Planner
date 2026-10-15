import React, { useState } from 'react';
import { Guest, TableItem, UserProfile, LanguageCode } from '../types/wedding';
import { TRANSLATIONS } from '../i18n/translations';
import {
  calculateRSVPSummary,
  calculateTableOccupancies,
} from '../utils/weddingLogic';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Utensils,
  Plus,
  Search,
  Download,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Armchair,
} from 'lucide-react';

interface GuestSeatingViewProps {
  currentLang: LanguageCode;
  currentUser: UserProfile;
  guests: Guest[];
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onUpdateGuest: (guest: Guest) => void;
  onDeleteGuest: (guestId: string) => void;
  tables: TableItem[];
  onAssignGuestToTable: (guestId: string, tableId: string | undefined) => void;
  onAddTable: (table: Omit<TableItem, 'id'>) => void;
}

export const GuestSeatingView: React.FC<GuestSeatingViewProps> = ({
  currentLang,
  currentUser,
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
  tables,
  onAssignGuestToTable,
  onAddTable,
}) => {
  const t = TRANSLATIONS[currentLang];
  const rsvp = calculateRSVPSummary(guests);
  const tableOccupancies = calculateTableOccupancies(tables, guests);

  const [activeTab, setActiveTab] = useState<'floorplan' | 'guestlist'>('floorplan');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [selectedGuestForSeating, setSelectedGuestForSeating] = useState<Guest | null>(null);
  const [activeTableDetail, setActiveTableDetail] = useState<TableItem | null>(tables[0] || null);

  // Add guest modal state
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPartySize, setNewGuestPartySize] = useState(1);
  const [newGuestMeal, setNewGuestMeal] = useState<Guest['mealChoice']>('beef');
  const [newGuestDietary, setNewGuestDietary] = useState('');
  const [newGuestGroup, setNewGuestGroup] = useState<Guest['group']>('mutual_friends');

  // Filtered guest list
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGroup = filterGroup === 'all' || g.group === filterGroup;
    const matchesRsvp = filterRsvp === 'all' || g.rsvpStatus === filterRsvp;
    return matchesSearch && matchesGroup && matchesRsvp;
  });

  const unseatedAttendingGuests = guests.filter(
    (g) => g.rsvpStatus === 'attending' && !g.tableId
  );

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    onAddGuest({
      name: newGuestName,
      email: newGuestEmail || `${newGuestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      partySize: newGuestPartySize || 1,
      rsvpStatus: 'attending',
      mealChoice: newGuestMeal,
      dietaryRestrictions: newGuestDietary,
      tableId: undefined,
      invitationSent: true,
      group: newGuestGroup,
    });
    setShowAddGuestModal(false);
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestDietary('');
  };

  const handleExportManifest = () => {
    let manifestText = `AETHEL & EVER · WEDDING GUEST SEATING MANIFEST\nDate: September 18, 2026\n\n`;
    tables.forEach((t) => {
      const occ = tableOccupancies.find((o) => o.tableId === t.id);
      manifestText += `--------------------------------------------------\nTABLE: ${t.name} (${occ?.seatedCount || 0}/${t.capacity} seats)\n--------------------------------------------------\n`;
      if (occ?.guests && occ.guests.length > 0) {
        occ.guests.forEach((g) => {
          manifestText += ` • ${g.name} (${g.mealChoice.toUpperCase()}${g.dietaryRestrictions ? ' - DIET: ' + g.dietaryRestrictions : ''})\n`;
        });
      } else {
        manifestText += ` (No guests seated)\n`;
      }
      manifestText += `\n`;
    });

    const blob = new Blob([manifestText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wedding_seating_manifest_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {t.navGuestSeating}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track RSVPs, manage dietary protocols, and arrange interactive reception table seating.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Manifest */}
          <button
            onClick={handleExportManifest}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportManifest}</span>
          </button>

          {/* Add Guest Button */}
          <button
            onClick={() => setShowAddGuestModal(true)}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addGuest}</span>
          </button>
        </div>
      </div>

      {/* 4 RSVP & Seating Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Attending</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
            {rsvp.attending} <span className="text-xs font-sans text-stone-400">/ {rsvp.totalGuests}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {rsvp.attendanceRate}% Response Confirmed
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Pending RSVP</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
            {rsvp.pending}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {rsvp.declined} declined
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Seated at Tables</span>
            <Armchair className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
            {rsvp.seatedGuests} <span className="text-xs font-sans text-stone-400">/ {rsvp.attending}</span>
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            {rsvp.unseatedGuests} unseated guests remaining
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>{t.dietaryAllergies}</span>
            <Utensils className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
            {rsvp.totalDietaryRestrictions} <span className="text-xs font-sans text-stone-400">alerts</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Beef ({rsvp.meals.beef}) · Fish ({rsvp.meals.fish}) · Veg ({rsvp.meals.vegetarian})
          </div>
        </div>
      </div>

      {/* Segmented View Switcher: Interactive Floor Plan vs Guest Table Roster */}
      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('floorplan')}
          className={`px-4 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeTab === 'floorplan'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Interactive Venue Floor Plan & Seating
        </button>
        <button
          onClick={() => setActiveTab('guestlist')}
          className={`px-4 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeTab === 'guestlist'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Guest Manifest & RSVP Roster ({guests.length})
        </button>
      </div>

      {/* FLOOR PLAN & SEATING ASSIGNMENT TAB */}
      {activeTab === 'floorplan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Interactive Floor Plan Canvas */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Reception Grand Hall · Floor Layout
                </h2>
                <p className="text-xs text-stone-500">
                  {t.dragTip}
                </p>
              </div>

              {selectedGuestForSeating && (
                <div className="bg-rose-50 border border-rose-200 px-3 py-1 rounded text-xs text-rose-900 flex items-center gap-2 animate-pulse">
                  <span>Placing: <strong>{selectedGuestForSeating.name}</strong></span>
                  <button
                    onClick={() => setSelectedGuestForSeating(null)}
                    className="text-stone-400 hover:text-stone-600 text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* 2D Floor Plan Surface */}
            <div className="relative w-full h-[600px] bg-stone-50 rounded-xl border border-stone-200 p-4 overflow-hidden select-none">
              {/* Architecture Marks */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase text-stone-400 font-medium">
                Altar & Limonaia Garden Entrance
              </div>

              {/* Stage & DJ Booth */}
              <div className="absolute top-4 left-6 w-28 h-12 bg-stone-200 border border-stone-300 rounded flex items-center justify-center text-[10px] font-medium text-stone-600">
                Live Jazz Quartet
              </div>

              {/* Dance Floor */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-44 h-20 bg-rose-50 border border-rose-200 rounded-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs font-serif font-bold text-rose-900">Custom Monogram Dance Floor</span>
                <span className="text-[10px] text-rose-500">C & J · 18.09.27</span>
              </div>

              {/* Bar / Beverage Station */}
              <div className="absolute top-4 right-6 w-28 h-12 bg-stone-200 border border-stone-300 rounded flex items-center justify-center text-[10px] font-medium text-stone-600">
                Chianti Cocktail Bar
              </div>

              {/* Interactive Tables */}
              {tableOccupancies.map((tItem) => {
                const isSelectedTable = activeTableDetail?.id === tItem.tableId;
                const isHeadTable = tItem.tableId === 't1';

                // Spacious, perfectly proportioned table coordinates
                let positionClasses = 'top-4 left-1/2 -translate-x-1/2';
                if (tItem.tableId === 't2') positionClasses = 'top-48 left-12';
                if (tItem.tableId === 't3') positionClasses = 'top-48 right-12';
                if (tItem.tableId === 't4') positionClasses = 'bottom-8 left-16';
                if (tItem.tableId === 't5') positionClasses = 'bottom-8 right-16';

                return (
                  <div
                    key={tItem.tableId}
                    onClick={() => {
                      const matchedTable = tables.find((tb) => tb.id === tItem.tableId);
                      if (matchedTable) setActiveTableDetail(matchedTable);

                      // If a guest was selected, assign them to this table!
                      if (selectedGuestForSeating) {
                        onAssignGuestToTable(selectedGuestForSeating.id, tItem.tableId);
                        setSelectedGuestForSeating(null);
                      }
                    }}
                    className={`absolute ${positionClasses} cursor-pointer transition-all transform hover:scale-105 ${
                      isHeadTable
                        ? 'w-56 h-14 rounded-xl'
                        : 'w-28 h-28 rounded-full'
                    } flex flex-col items-center justify-center text-center p-2 shadow-sm border ${
                      isSelectedTable
                        ? 'bg-rose-100/90 border-rose-400 ring-2 ring-rose-300'
                        : tItem.isOverCapacity
                        ? 'bg-red-50 border-red-300'
                        : 'bg-white border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-stone-900 leading-tight">
                      {tItem.name}
                    </span>

                    <span className="text-[10px] text-stone-500 tabular-nums mt-0.5">
                      {tItem.seatedCount} / {tItem.capacity} seats
                    </span>

                    {tItem.isOverCapacity ? (
                      <span className="text-[9px] text-red-600 font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Over Capacity
                      </span>
                    ) : (
                      <span className="text-[9px] text-emerald-700">
                        {tItem.availableSeats} available
                      </span>
                    )}

                    {selectedGuestForSeating && tItem.availableSeats > 0 && (
                      <span className="text-[9px] bg-rose-900 text-white px-1.5 py-0.5 rounded mt-1 font-medium">
                        Click to Seat
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (4 cols): Table Details & Unseated Guests Queue */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Table Seat Inspector */}
            {activeTableDetail && (
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {activeTableDetail.name}
                    </h3>
                    <span className="text-xs text-stone-500">
                      Capacity: {activeTableDetail.capacity} guests
                    </span>
                  </div>

                  <span className="text-xs bg-stone-100 px-2 py-0.5 rounded font-medium text-stone-700">
                    {activeTableDetail.shape} table
                  </span>
                </div>

                {/* Seated Guests at this table */}
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {guests.filter((g) => g.tableId === activeTableDetail.id).length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-4 text-center">
                      No guests assigned to this table yet.
                    </p>
                  ) : (
                    guests
                      .filter((g) => g.tableId === activeTableDetail.id)
                      .map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between p-2 bg-stone-50 rounded border border-stone-200 text-xs"
                        >
                          <div>
                            <span className="font-medium text-stone-900 block">
                              {g.name}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {g.mealChoice} {g.dietaryRestrictions && `· ${g.dietaryRestrictions}`}
                            </span>
                          </div>

                          <button
                            onClick={() => onAssignGuestToTable(g.id, undefined)}
                            title="Unseat guest"
                            className="text-[10px] text-red-600 hover:text-red-800 px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                          >
                            Unseat
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Unseated Attending Guests Drawer */}
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                  {t.unassignedGuests} ({unseatedAttendingGuests.length})
                </h3>
                <span className="text-xs text-rose-700 font-medium">
                  Needs Placement
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {unseatedAttendingGuests.length === 0 ? (
                  <div className="p-6 text-center text-stone-400 text-xs">
                    All attending guests have been seated at reception tables!
                  </div>
                ) : (
                  unseatedAttendingGuests.map((g) => {
                    const isSelected = selectedGuestForSeating?.id === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGuestForSeating(isSelected ? null : g)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-300'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                        }`}
                      >
                        <div>
                          <strong className="text-stone-900 block">{g.name}</strong>
                          <span className="text-[10px] text-stone-500">
                            {g.mealChoice} · Party of {g.partySize}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            isSelected
                              ? 'bg-rose-900 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {isSelected ? 'Click Table' : 'Select'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GUEST MANIFEST & RSVP ROSTER TAB */}
      {activeTab === 'guestlist' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by guest name, email, or allergy..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterRsvp}
                onChange={(e) => setFilterRsvp(e.target.value)}
                aria-label="Filter by RSVP status"
                className="bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none"
              >
                <option value="all">All RSVPs</option>
                <option value="attending">Attending</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>

              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                aria-label="Filter by party affiliation"
                className="bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none"
              >
                <option value="all">All Groups</option>
                <option value="bride_family">Bride Family</option>
                <option value="groom_family">Groom Family</option>
                <option value="mutual_friends">Mutual Friends</option>
                <option value="wedding_party">Wedding Party</option>
                <option value="colleagues">Colleagues</option>
              </select>
            </div>
          </div>

          {/* High-Density Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-medium">
                  <th className="py-2.5 px-3">Guest Name & Email</th>
                  <th className="py-2.5 px-3">Affiliation</th>
                  <th className="py-2.5 px-3">RSVP Status</th>
                  <th className="py-2.5 px-3">Meal & Dietary</th>
                  <th className="py-2.5 px-3">Assigned Table</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.map((g) => {
                  const assignedTable = tables.find((t) => t.id === g.tableId);
                  return (
                    <tr key={g.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-stone-900 block">{g.name}</span>
                        <span className="text-[11px] text-stone-400">{g.email}</span>
                      </td>

                      <td className="py-3 px-3 text-stone-600 capitalize">
                        {g.group.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            g.rsvpStatus === 'attending'
                              ? 'bg-emerald-50 text-emerald-800'
                              : g.rsvpStatus === 'declined'
                              ? 'bg-stone-100 text-stone-500 line-through'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {g.rsvpStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-stone-800 capitalize block">
                          {g.mealChoice}
                        </span>
                        {g.dietaryRestrictions ? (
                          <span className="text-[10px] text-rose-700 font-medium">
                            {g.dietaryRestrictions}
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">None</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {assignedTable ? (
                          <span className="font-medium text-stone-800">
                            {assignedTable.name}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <select
                          value={g.tableId || ''}
                          onChange={(e) =>
                            onAssignGuestToTable(g.id, e.target.value ? e.target.value : undefined)
                          }
                          aria-label={`Assign table for ${g.name}`}
                          className="bg-stone-50 border border-stone-200 text-stone-700 text-[11px] rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="">(No Table)</option>
                          {tables.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Add Wedding Guest
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter attendee specifications to update catering headcounts and seating charts.
            </p>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Lord Alistair Croft"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="e.g. alistair@croftmanor.co.uk"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Party Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newGuestPartySize}
                    onChange={(e) => setNewGuestPartySize(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Meal Preference
                  </label>
                  <select
                    value={newGuestMeal}
                    onChange={(e) => setNewGuestMeal(e.target.value as Guest['mealChoice'])}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                  >
                    <option value="beef">Plated Beef Fillet</option>
                    <option value="fish">Pan-Seared Sea Bass</option>
                    <option value="vegetarian">Truffle Risotto</option>
                    <option value="vegan">Heirloom Vegan</option>
                    <option value="kids">Children Menu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Dietary Restrictions / Allergies
                </label>
                <input
                  type="text"
                  value={newGuestDietary}
                  onChange={(e) => setNewGuestDietary(e.target.value)}
                  placeholder="e.g. Gluten-Free, Severe Peanut Allergy"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Affiliation Group
                </label>
                <select
                  value={newGuestGroup}
                  onChange={(e) => setNewGuestGroup(e.target.value as Guest['group'])}
                  className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                >
                  <option value="bride_family">Bride’s Family</option>
                  <option value="groom_family">Groom’s Family</option>
                  <option value="mutual_friends">Mutual Friends</option>
                  <option value="wedding_party">Wedding Party</option>
                  <option value="colleagues">Colleagues</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
