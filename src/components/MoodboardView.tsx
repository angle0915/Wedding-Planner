import React, { useState } from 'react';
import { MoodboardPin, ColorSwatch, UserProfile, LanguageCode } from '../types/wedding';
import { TRANSLATIONS } from '../i18n/translations';
import {
  Palette,
  Heart,
  Plus,
  Copy,
  Check,
  Sparkles,
  Tag,
  Share2,
} from 'lucide-react';

interface MoodboardViewProps {
  currentLang: LanguageCode;
  currentUser: UserProfile;
  pins: MoodboardPin[];
  onToggleLikePin: (pinId: string) => void;
  onAddPin: (pin: Omit<MoodboardPin, 'id' | 'likes' | 'likedBy'>) => void;
  swatches: ColorSwatch[];
}

export const MoodboardView: React.FC<MoodboardViewProps> = ({
  currentLang,
  currentUser,
  pins,
  onToggleLikePin,
  onAddPin,
  swatches,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Add pin modal
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinCategory, setNewPinCategory] = useState<MoodboardPin['category']>('Florals');
  const [newPinImage, setNewPinImage] = useState('/src/assets/images/moodboard_floral_palette_1792069436179.jpg');
  const [newPinNotes, setNewPinNotes] = useState('');
  const [newPinSwatch, setNewPinSwatch] = useState('#C86D51');

  const filteredPins = pins.filter(
    (p) => activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase()
  );

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinTitle.trim()) return;
    onAddPin({
      title: newPinTitle,
      category: newPinCategory,
      imageUrl: newPinImage,
      colorSwatch: newPinSwatch,
      notes: newPinNotes || 'Curated inspiration element for wedding styling aesthetic.',
    });
    setShowAddPinModal(false);
    setNewPinTitle('');
    setNewPinNotes('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {t.navMoodboard} & Style Direction
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Collaborative visual mood board: color harmonies, tablescape vignettes, floral designs, and tactile details.
          </p>
        </div>

        <button
          onClick={() => setShowAddPinModal(true)}
          className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Inspiration Pin</span>
        </button>
      </div>

      {/* Interactive Color Palette Swatches Bar */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-stone-700" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              Harmonic Color Palette · Tuscan Sunset & Silk
            </h2>
          </div>
          <span className="text-xs text-stone-400">Click swatch to copy HEX</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {swatches.map((swatch) => {
            const isCopied = copiedHex === swatch.hex;
            return (
              <button
                key={swatch.hex}
                onClick={() => handleCopyHex(swatch.hex)}
                className="group p-3 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50/50 hover:bg-white transition-all text-left cursor-pointer flex flex-col justify-between"
              >
                <div
                  className="w-full h-12 rounded-md shadow-inner mb-2 border border-black/5"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div>
                  <span className="font-semibold text-xs text-stone-900 block truncate">
                    {swatch.name}
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 mt-1">
                    <span>{swatch.hex}</span>
                    {isCopied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-stone-300 group-hover:text-stone-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                    {swatch.role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
          {['all', 'Florals', 'Tablescapes', 'Stationery', 'Lighting'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat === 'all' ? 'All Pins' : cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-400">
          Showing {filteredPins.length} curated pins
        </div>
      </div>

      {/* Visual Moodboard Masonry-Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPins.map((pin) => {
          const hasLiked = pin.likedBy.includes(currentUser.id);
          return (
            <div
              key={pin.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-stone-300 transition-all"
            >
              <div>
                {/* Pin Image */}
                <div className="relative h-64 overflow-hidden bg-stone-100">
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded font-medium">
                    {pin.category}
                  </div>
                  {pin.colorSwatch && (
                    <div
                      className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: pin.colorSwatch }}
                      title={`Key Accent: ${pin.colorSwatch}`}
                    />
                  )}
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                    {pin.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pin.notes}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                <span className="text-[11px] text-stone-400">
                  Curated for Camille & Julian
                </span>

                <button
                  onClick={() => onToggleLikePin(pin.id)}
                  aria-label={`${hasLiked ? 'Unlike' : 'Like'} this pin`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    hasLiked
                      ? 'text-rose-700 bg-rose-50 font-semibold'
                      : 'text-stone-500 hover:text-stone-800 bg-stone-50'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      hasLiked ? 'fill-rose-600 text-rose-600' : 'text-stone-400'
                    }`}
                  />
                  <span className="tabular-nums">{pin.likes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Inspiration Pin Modal */}
      {showAddPinModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Add Inspiration Pin
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Pin a styling reference, floral concept, or tablescape visual.
            </p>

            <form onSubmit={handleCreatePin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pin Title
                </label>
                <input
                  type="text"
                  required
                  value={newPinTitle}
                  onChange={(e) => setNewPinTitle(e.target.value)}
                  placeholder="e.g. Garden Rose & Silk Ribbons Flatlay"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newPinCategory}
                    onChange={(e) => setNewPinCategory(e.target.value as MoodboardPin['category'])}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                  >
                    <option value="Florals">Florals</option>
                    <option value="Tablescapes">Tablescapes</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Attire">Attire</option>
                    <option value="Catering">Catering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Accent Swatch
                  </label>
                  <select
                    value={newPinSwatch}
                    onChange={(e) => setNewPinSwatch(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded focus:outline-none font-mono"
                  >
                    <option value="#C86D51">Terracotta (#C86D51)</option>
                    <option value="#5C674E">Tuscan Olive (#5C674E)</option>
                    <option value="#F3D8D0">Blush Silk (#F3D8D0)</option>
                    <option value="#C5A059">Antiqued Gold (#C5A059)</option>
                    <option value="#FBF8F3">Champagne (#FBF8F3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Image Source
                </label>
                <select
                  value={newPinImage}
                  onChange={(e) => setNewPinImage(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded focus:outline-none"
                >
                  <option value="/src/assets/images/moodboard_floral_palette_1792069436179.jpg">
                    Calligraphy Flatlay & Garden Roses
                  </option>
                  <option value="/src/assets/images/venue_tuscan_villa_1792069435818.jpg">
                    Tuscan Villa Candlelit Reception
                  </option>
                  <option value="/src/assets/images/hero_grand_reception_1792069436371.jpg">
                    Glasshouse Marquee & Wisteria
                  </option>
                  <option value="/src/assets/images/venue_coastal_cliff_1792069436582.jpg">
                    Amalfi Cliffside Floral Terrace
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Styling Notes
                </label>
                <textarea
                  rows={3}
                  value={newPinNotes}
                  onChange={(e) => setNewPinNotes(e.target.value)}
                  placeholder="Notes on textures, flower varieties, candle heights..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddPinModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
                >
                  Save Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
