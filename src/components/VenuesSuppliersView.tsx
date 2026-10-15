import React, { useState } from 'react';
import { Venue, Supplier, UserProfile, LanguageCode } from '../types/wedding';
import { TRANSLATIONS } from '../i18n/translations';
import { interpolateVendorTemplate } from '../utils/weddingLogic';
import {
  MapPin,
  Users,
  Clock,
  Sparkles,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Copy,
  Send,
  Plus,
  Star,
  ExternalLink,
} from 'lucide-react';

interface VenuesSuppliersViewProps {
  currentLang: LanguageCode;
  currentUser: UserProfile;
  venues: Venue[];
  onSelectVenue: (venueId: string) => void;
  suppliers: Supplier[];
  onAddMessageToSupplier: (supplierId: string, messageText: string) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'messages'>) => void;
  weddingDate: string;
  guestCount: number;
}

export const VenuesSuppliersView: React.FC<VenuesSuppliersViewProps> = ({
  currentLang,
  currentUser,
  venues,
  onSelectVenue,
  suppliers,
  onAddMessageToSupplier,
  onAddSupplier,
  weddingDate,
  guestCount,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [activeSubTab, setActiveSubTab] = useState<'venues' | 'suppliers'>('venues');
  const [selectedSupplierForChat, setSelectedSupplierForChat] = useState<Supplier | null>(suppliers[0] || null);
  const [chatInput, setChatInput] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Template drafter state
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('dietary');
  const [customDraft, setCustomDraft] = useState<string>('');

  // New supplier modal state
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierCat, setNewSupplierCat] = useState<Supplier['category']>('Florals');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierQuoted, setNewSupplierQuoted] = useState(3500);

  const selectedVenue = venues.find((v) => v.selected) || venues[0];

  const TEMPLATES: Record<string, { label: string; text: string }> = {
    dietary: {
      label: 'Dietary Headcount Confirmation',
      text: 'Dear {vendor_contact},\n\nWe are pleased to provide our updated dietary specifications for the wedding of {couple_name} on {wedding_date} at {venue_name}. We currently anticipate {guest_count} guests, including 4 gluten-free and 3 vegan attendees.\n\nPlease confirm receipt and let us know if additional prep requirements are needed.\n\nWarm regards,\n{sender_name}\n{couple_name} Wedding Planning Team',
    },
    quote: {
      label: 'Initial Quote & Availability Request',
      text: 'Dear {vendor_name},\n\nWe admire your portfolio and would love to inquire about your availability for our luxury celebration on {wedding_date} at {venue_name}. Our gathering will host approximately {guest_count} guests.\n\nCould you please share your updated packages, retainer terms, and sample contracts?\n\nSincerely,\n{sender_name}',
    },
    logistics: {
      label: 'Day-of Logistics & Load-in Timeline',
      text: 'Dear {vendor_contact},\n\nHere is the logistical briefing for {wedding_date} at {venue_name}. Vendor load-in begins at 08:30 AM via the South Gate. First look portraits commence at 01:30 PM, with guest arrivals at 03:00 PM.\n\nPlease find the on-site logistics coordinator contact attached.\n\nBest regards,\n{sender_name}',
    },
  };

  const currentTemplateText = TEMPLATES[selectedTemplateKey]?.text || '';
  const interpolatedDraft = interpolateVendorTemplate(
    customDraft || currentTemplateText,
    {
      vendor_contact: selectedSupplierForChat?.contactPerson || 'Partner',
      vendor_name: selectedSupplierForChat?.name || 'Partner',
      couple_name: 'Camille & Julian',
      wedding_date: 'September 18, 2026',
      venue_name: selectedVenue?.name || 'Villa di Monticelli',
      guest_count: guestCount,
      sender_name: currentUser.name,
    }
  );

  const handleCopyDraft = () => {
    navigator.clipboard?.writeText(interpolatedDraft);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleSendDraft = () => {
    if (!selectedSupplierForChat || !interpolatedDraft.trim()) return;
    onAddMessageToSupplier(selectedSupplierForChat.id, interpolatedDraft);
    setChatInput('');
    setCustomDraft('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForChat || !chatInput.trim()) return;
    onAddMessageToSupplier(selectedSupplierForChat.id, chatInput);
    setChatInput('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    onAddSupplier({
      name: newSupplierName,
      category: newSupplierCat,
      contactPerson: newSupplierContact || 'Account Rep',
      email: newSupplierEmail || 'contact@vendor.com',
      phone: '+39 055 000 0000',
      quotedCost: Number(newSupplierQuoted) || 3000,
      contractedCost: Number(newSupplierQuoted) || 3000,
      status: 'Inquired',
      rating: 5,
      notes: 'Custom vendor partner added to directory.',
    });
    setShowAddSupplierModal(false);
    setNewSupplierName('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Subtab Segmented Navigation */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {activeSubTab === 'venues' ? t.findVenues : t.vendorDirectory}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {activeSubTab === 'venues'
              ? 'Curated luxury estates, coastal terraces, and glasshouse marquis with logistical specs.'
              : 'End-to-end partner directory with integrated quotes, contracts, and personalized communications.'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('venues')}
            className={`px-4 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              activeSubTab === 'venues'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Venues ({venues.length})
          </button>
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              activeSubTab === 'suppliers'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Vendors ({suppliers.length})
          </button>
        </div>
      </div>

      {/* VENUES SUBTAB */}
      {activeSubTab === 'venues' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((venue) => {
              const isSelected = venue.selected;
              return (
                <div
                  key={venue.id}
                  className={`bg-white rounded-xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                    isSelected ? 'ring-2 ring-rose-500/80 border-rose-300' : 'border-stone-200'
                  }`}
                >
                  <div>
                    {/* Venue Image */}
                    <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-stone-100 text-[11px] px-2.5 py-1 rounded font-medium">
                        {venue.style}
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-rose-800 text-rose-100 text-[11px] px-2.5 py-1 rounded font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-rose-200" />
                          <span>Primary Venue</span>
                        </div>
                      )}
                    </div>

                    {/* Venue Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-xs text-rose-800 font-semibold uppercase tracking-wider">
                          {venue.region}, {venue.country}
                        </div>
                        <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                          {venue.name}
                        </h3>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {venue.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>Up to {venue.capacityMax} guests</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Curfew: {venue.curfew}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-stone-900">
                          <span>Rental: ${venue.rentalFee.toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {venue.indoorOutdoor}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {venue.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => onSelectVenue(venue.id)}
                      className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-stone-100'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      {isSelected ? 'Selected Primary Location' : 'Select as Wedding Venue'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUPPLIERS SUBTAB */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 cols): Vendor Directory List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-600">
                Partner Directory
              </h2>
              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="text-xs bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vendor</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {suppliers.map((s) => {
                const isCurrent = selectedSupplierForChat?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSupplierForChat(s);
                      setCustomDraft('');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200 shadow-sm'
                        : 'bg-white hover:bg-stone-50 border-stone-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-medium text-rose-800 uppercase tracking-wide">
                          {s.category}
                        </span>
                        <h3 className="text-sm font-semibold text-stone-900">
                          {s.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {s.contactPerson} · {s.email}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold text-stone-900 tabular-nums">
                          ${s.contractedCost.toLocaleString()}
                        </div>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-medium">
                          {s.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 mt-3 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="tabular-nums font-medium">{s.rating}</span>
                      </div>
                      <span className="text-rose-700 font-medium">
                        {s.messages.length} messages
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Communication Hub & Email Drafter */}
          <div className="lg:col-span-7 space-y-6">
            {selectedSupplierForChat ? (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                {/* Header */}
                <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-rose-300 uppercase tracking-wide">
                      {selectedSupplierForChat.category} Partner
                    </div>
                    <h3 className="text-base font-serif font-bold text-white">
                      {selectedSupplierForChat.name}
                    </h3>
                    <p className="text-xs text-stone-300">
                      {selectedSupplierForChat.contactPerson} · {selectedSupplierForChat.phone}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-stone-300 block">Contracted:</span>
                    <strong className="text-rose-200 text-sm tabular-nums">
                      ${selectedSupplierForChat.contractedCost.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Tab switcher: Quick Draft vs Message Thread */}
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-700">Template Drafter:</span>
                    <select
                      value={selectedTemplateKey}
                      onChange={(e) => {
                        setSelectedTemplateKey(e.target.value);
                        setCustomDraft('');
                      }}
                      className="bg-white border border-stone-300 rounded px-2.5 py-1 text-stone-800 text-xs focus:outline-none"
                    >
                      <option value="dietary">Dietary Headcount Confirmation</option>
                      <option value="quote">Initial Quote & Retainer</option>
                      <option value="logistics">Day-of Load-in Briefing</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyDraft}
                      className="px-3 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedTemplate ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                    <button
                      onClick={handleSendDraft}
                      className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded flex items-center gap-1.5 cursor-pointer font-medium"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Draft</span>
                    </button>
                  </div>
                </div>

                {/* Pre-filled interpolated draft box */}
                <div className="p-4 bg-rose-50/20 border-b border-stone-100 text-xs">
                  <textarea
                    rows={4}
                    value={customDraft || interpolatedDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    className="w-full bg-white p-2.5 rounded border border-rose-200 text-stone-800 text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none resize-none font-sans"
                    placeholder="Customize your draft with dynamic tags..."
                  />
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
                    <span>Tags available: &#123;couple_name&#125;, &#123;wedding_date&#125;, &#123;guest_count&#125;, &#123;venue_name&#125;</span>
                    <span className="text-emerald-700 font-medium">Interpolated with live wedding data</span>
                  </div>
                </div>

                {/* Message Log Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
                  {selectedSupplierForChat.messages.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-xs">
                      No communications recorded yet. Use the drafter above to send the first inquiry!
                    </div>
                  ) : (
                    selectedSupplierForChat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          msg.sender === 'Vendor' ? 'self-start' : 'self-end items-end'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-0.5">
                          <span className="font-semibold text-stone-600">{msg.sender}</span>
                          <span>·</span>
                          <span className="tabular-nums">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`p-3 rounded-xl text-xs whitespace-pre-wrap leading-relaxed ${
                            msg.sender === 'Vendor'
                              ? 'bg-white border border-stone-200 text-stone-800'
                              : 'bg-rose-900 text-rose-50'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Live Message Reply Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Reply to ${selectedSupplierForChat.contactPerson}...`}
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400 text-xs">
                Select a vendor from the directory to start communicating.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Add New Vendor Partner
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter supplier coordinates to track quotes and communications.
            </p>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="e.g. Florence String Quartet"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newSupplierCat}
                    onChange={(e) => setNewSupplierCat(e.target.value as Supplier['category'])}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                  >
                    <option value="Photography">Photography</option>
                    <option value="Florals">Florals</option>
                    <option value="Catering & Bar">Catering & Bar</option>
                    <option value="Music & DJ">Music & DJ</option>
                    <option value="Hair & Makeup">Hair & Makeup</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Cake & Confection">Cake & Confection</option>
                    <option value="Bridal Attire">Bridal Attire</option>
                    <option value="Transportation">Transportation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Quoted Fee ($)
                  </label>
                  <input
                    type="number"
                    value={newSupplierQuoted}
                    onChange={(e) => setNewSupplierQuoted(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={newSupplierContact}
                  onChange={(e) => setNewSupplierContact(e.target.value)}
                  placeholder="e.g. Beatrice Rossi"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newSupplierEmail}
                  onChange={(e) => setNewSupplierEmail(e.target.value)}
                  placeholder="e.g. beatrice@atelierbotanique.it"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
