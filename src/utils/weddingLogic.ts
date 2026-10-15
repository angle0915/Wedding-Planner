/**
 * Pure business logic and calculation helpers for Wedding Planner
 */

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

export interface MilestoneItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  assigneeRole: string;
  priority: 'high' | 'medium' | 'low';
}

export type UserRole = 'bride' | 'groom' | 'lead_planner' | 'maid_of_honor' | 'vendor_coordinator';

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalSpent: number;
  totalPaid: number;
  remainingBudget: number;
  variance: number;
  percentSpent: number;
  isOverBudget: boolean;
  categoryBreakdown: Record<string, { estimated: number; spent: number; paid: number }>;
}

export function calculateBudgetSummary(items: BudgetItem[], totalBudget: number): BudgetSummary {
  let totalEstimated = 0;
  let totalSpent = 0;
  let totalPaid = 0;
  const categoryBreakdown: Record<string, { estimated: number; spent: number; paid: number }> = {};

  for (const item of items) {
    totalEstimated += item.estimatedCost || 0;
    totalSpent += item.actualCost || 0;
    totalPaid += item.paidAmount || 0;

    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = { estimated: 0, spent: 0, paid: 0 };
    }
    categoryBreakdown[item.category].estimated += item.estimatedCost || 0;
    categoryBreakdown[item.category].spent += item.actualCost || 0;
    categoryBreakdown[item.category].paid += item.paidAmount || 0;
  }

  const remainingBudget = totalBudget - totalSpent;
  const variance = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    totalBudget,
    totalEstimated,
    totalSpent,
    totalPaid,
    remainingBudget,
    variance,
    percentSpent,
    isOverBudget: totalSpent > totalBudget,
    categoryBreakdown,
  };
}

export interface RSVPSummary {
  totalGuests: number;
  attending: number;
  declined: number;
  pending: number;
  attendanceRate: number;
  meals: Record<string, number>;
  totalDietaryRestrictions: number;
  seatedGuests: number;
  unseatedGuests: number;
}

export function calculateRSVPSummary(guests: Guest[]): RSVPSummary {
  const totalGuests = guests.reduce((sum, g) => sum + (g.partySize || 1), 0);
  let attending = 0;
  let declined = 0;
  let pending = 0;
  let totalDietary = 0;
  let seated = 0;
  const meals: Record<string, number> = {
    beef: 0,
    fish: 0,
    vegetarian: 0,
    vegan: 0,
    kids: 0,
  };

  for (const g of guests) {
    const size = g.partySize || 1;
    if (g.rsvpStatus === 'attending') {
      attending += size;
      if (meals[g.mealChoice] !== undefined) {
        meals[g.mealChoice] += size;
      }
    } else if (g.rsvpStatus === 'declined') {
      declined += size;
    } else {
      pending += size;
    }

    if (g.dietaryRestrictions && g.dietaryRestrictions.trim().length > 0) {
      totalDietary += 1;
    }

    if (g.tableId) {
      seated += size;
    }
  }

  const attendanceRate = totalGuests > 0 ? Math.round((attending / totalGuests) * 100) : 0;

  return {
    totalGuests,
    attending,
    declined,
    pending,
    attendanceRate,
    meals,
    totalDietaryRestrictions: totalDietary,
    seatedGuests: seated,
    unseatedGuests: attending - seated,
  };
}

export interface TableOccupancy {
  tableId: string;
  name: string;
  capacity: number;
  seatedCount: number;
  availableSeats: number;
  isOverCapacity: boolean;
  guests: Guest[];
}

export function calculateTableOccupancies(tables: TableItem[], guests: Guest[]): TableOccupancy[] {
  return tables.map(table => {
    const assignedGuests = guests.filter(g => g.tableId === table.id && g.rsvpStatus === 'attending');
    const seatedCount = assignedGuests.reduce((sum, g) => sum + (g.partySize || 1), 0);
    return {
      tableId: table.id,
      name: table.name,
      capacity: table.capacity,
      seatedCount,
      availableSeats: Math.max(0, table.capacity - seatedCount),
      isOverCapacity: seatedCount > table.capacity,
      guests: assignedGuests,
    };
  });
}

export function calculateMilestoneProgress(milestones: MilestoneItem[], currentDateStr?: string): {
  total: number;
  completed: number;
  overdue: number;
  upcoming: number;
  percentCompleted: number;
} {
  const now = currentDateStr ? new Date(currentDateStr).getTime() : Date.now();
  let completed = 0;
  let overdue = 0;
  let upcoming = 0;

  for (const m of milestones) {
    if (m.completed) {
      completed++;
    } else {
      const due = new Date(m.dueDate).getTime();
      if (due < now) {
        overdue++;
      } else {
        upcoming++;
      }
    }
  }

  const total = milestones.length;
  const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    overdue,
    upcoming,
    percentCompleted,
  };
}

export function interpolateVendorTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

export type PermissionAction =
  | 'view_budget'
  | 'edit_budget'
  | 'manage_guests'
  | 'edit_seating'
  | 'communicate_vendors'
  | 'manage_backups'
  | 'manage_team';

export function evaluatePermissions(role: UserRole, action: PermissionAction): boolean {
  switch (role) {
    case 'bride':
    case 'groom':
      // Full access to everything
      return true;
    case 'lead_planner':
      // Planner can edit all logistics & vendors, but backup deletion/restores require couple sign-off
      return action !== 'manage_backups';
    case 'maid_of_honor':
      // MOH can help with guests, seating, and moodboard, but not budget modification or vendor contracts
      return action === 'manage_guests' || action === 'edit_seating';
    case 'vendor_coordinator':
      // Can communicate with vendors and view seating, cannot view or edit budget
      return action === 'communicate_vendors' || action === 'edit_seating';
    default:
      return false;
  }
}

export interface VendorReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedCouple: boolean;
}

export interface MarketplaceVendor {
  id: string;
  name: string;
  category: string;
  location: string;
  country: string;
  priceTier: '$' | '$$' | '$$$' | '$$$$';
  minBudget: number;
  maxBudget: number;
  rating: number;
  reviewsCount: number;
  reviews: VendorReview[];
  services: { title: string; price: number; description: string }[];
  portfolioImages: string[];
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  featured: boolean;
}

export function calculateVendorAverageRating(reviews: VendorReview[]): { rating: number; count: number } {
  if (!reviews || reviews.length === 0) {
    return { rating: 5.0, count: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;
  return { rating: avg, count: reviews.length };
}

export function filterMarketplaceVendors(
  vendors: MarketplaceVendor[],
  filters: {
    category?: string;
    location?: string;
    priceTier?: string;
    maxPrice?: number;
    query?: string;
  }
): MarketplaceVendor[] {
  return vendors.filter((v) => {
    if (filters.category && filters.category !== 'all' && v.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    if (filters.location && filters.location !== 'all' && !v.location.toLowerCase().includes(filters.location.toLowerCase()) && !v.country.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.priceTier && filters.priceTier !== 'all' && v.priceTier !== filters.priceTier) {
      return false;
    }
    if (filters.maxPrice && v.minBudget > filters.maxPrice) {
      return false;
    }
    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.toLowerCase();
      const match =
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.services.some((s) => s.title.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

export interface TwoWaySyncEvent {
  id: string;
  author: 'bride' | 'groom' | 'planner';
  authorName: string;
  action: string;
  entityType: 'guest' | 'table' | 'vendor' | 'budget';
  entityId: string;
  timestamp: string;
}

export function recordSyncMutation(
  log: TwoWaySyncEvent[],
  event: Omit<TwoWaySyncEvent, 'id' | 'timestamp'>
): TwoWaySyncEvent[] {
  const newEvent: TwoWaySyncEvent = {
    ...event,
    id: 'sync_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toLocaleTimeString(),
  };
  return [newEvent, ...log.slice(0, 49)];
}

export function generateSimpleChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'chk_' + Math.abs(hash).toString(16).padStart(8, '0');
}

