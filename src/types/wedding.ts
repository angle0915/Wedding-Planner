/**
 * Type definitions for Aethel & Ever Luxury Wedding Planner
 */

export type LanguageCode = 'en' | 'es' | 'fr' | 'it' | 'de' | 'ja';

export type UserRole = 'bride' | 'groom' | 'lead_planner' | 'maid_of_honor' | 'vendor_coordinator';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  email: string;
  pin: string;
}

export interface Venue {
  id: string;
  name: string;
  region: string;
  country: string;
  image: string;
  capacityMax: number;
  capacityIdeal: number;
  rentalFee: number;
  curfew: string;
  style: 'Historic Villa' | 'Coastal Cliff' | 'Glasshouse Orangerie' | 'French Chateau' | 'Cotswolds Barn';
  features: string[];
  description: string;
  shortlisted: boolean;
  selected: boolean;
  indoorOutdoor: 'Both' | 'Outdoor Only' | 'Indoor Only';
}

export interface Supplier {
  id: string;
  name: string;
  category: 'Photography' | 'Florals' | 'Catering & Bar' | 'Music & DJ' | 'Hair & Makeup' | 'Stationery' | 'Cake & Confection' | 'Bridal Attire' | 'Transportation';
  contactPerson: string;
  email: string;
  phone: string;
  quotedCost: number;
  contractedCost: number;
  status: 'Inquired' | 'Proposal Received' | 'Contract Signed' | 'Deposit Paid' | 'Completed';
  rating: number;
  notes: string;
  messages: VendorMessage[];
}

export interface VendorMessage {
  id: string;
  sender: 'Couple' | 'Vendor' | 'Planner';
  text: string;
  timestamp: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  partySize: number;
  rsvpStatus: 'attending' | 'declined' | 'pending';
  mealChoice: 'beef' | 'fish' | 'vegetarian' | 'vegan' | 'kids';
  dietaryRestrictions?: string;
  tableId?: string;
  invitationSent: boolean;
  notes?: string;
  group: 'bride_family' | 'groom_family' | 'mutual_friends' | 'colleagues' | 'wedding_party';
}

export interface TableItem {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'head';
  capacity: number;
  x: number;
  y: number;
}

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  vendorId?: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  assigneeRole: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DayOfScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  responsible: string;
  notes: string;
}

export interface MoodboardPin {
  id: string;
  title: string;
  category: 'Florals' | 'Stationery' | 'Tablescapes' | 'Lighting' | 'Attire' | 'Catering';
  imageUrl: string;
  colorSwatch?: string;
  likes: number;
  likedBy: string[];
  notes: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'timeline' | 'budget' | 'guest' | 'vendor' | 'system';
}

export interface IntegrationWebhook {
  id: string;
  platform: 'Notion' | 'Google Sheets' | 'Trello' | 'Asana';
  name: string;
  status: 'active' | 'paused';
  lastSynced: string;
  endpointUrl: string;
}
