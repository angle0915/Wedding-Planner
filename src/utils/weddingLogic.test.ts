import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetSummary,
  calculateRSVPSummary,
  calculateTableOccupancies,
  calculateMilestoneProgress,
  interpolateVendorTemplate,
  evaluatePermissions,
  generateSimpleChecksum,
  calculateVendorAverageRating,
  filterMarketplaceVendors,
} from './weddingLogic.ts';
import type {
  BudgetItem,
  Guest,
  TableItem,
  MilestoneItem,
} from './weddingLogic.ts';

test('calculateBudgetSummary calculates totals and remaining budget accurately', () => {
  const items: BudgetItem[] = [
    { id: '1', category: 'Venue', name: 'Estate Rental', estimatedCost: 15000, actualCost: 16000, paidAmount: 8000, dueDate: '2026-06-01', status: 'partial' },
    { id: '2', category: 'Catering', name: 'Plated Dinner', estimatedCost: 12000, actualCost: 11500, paidAmount: 11500, dueDate: '2026-07-01', status: 'paid' },
    { id: '3', category: 'Photography', name: 'Full Day Coverage', estimatedCost: 4500, actualCost: 4500, paidAmount: 2000, dueDate: '2026-08-01', status: 'partial' },
  ];

  const summary = calculateBudgetSummary(items, 40000);
  assert.equal(summary.totalBudget, 40000);
  assert.equal(summary.totalEstimated, 31500);
  assert.equal(summary.totalSpent, 32000);
  assert.equal(summary.totalPaid, 21500);
  assert.equal(summary.remainingBudget, 8000);
  assert.equal(summary.isOverBudget, false);
  assert.equal(summary.percentSpent, 80);
  assert.equal(summary.categoryBreakdown['Venue'].spent, 16000);
});

test('calculateRSVPSummary breaks down attendance and dietary requirements', () => {
  const guests: Guest[] = [
    { id: 'g1', name: 'Eleanor Vance', email: 'eleanor@example.com', partySize: 2, rsvpStatus: 'attending', mealChoice: 'beef', dietaryRestrictions: 'Gluten Free', tableId: 't1', invitationSent: true, group: 'mutual_friends' },
    { id: 'g2', name: 'Julian Hayes', email: 'julian@example.com', partySize: 1, rsvpStatus: 'attending', mealChoice: 'fish', tableId: 't1', invitationSent: true, group: 'groom_family' },
    { id: 'g3', name: 'Marcus Sterling', email: 'marcus@example.com', partySize: 1, rsvpStatus: 'declined', mealChoice: 'vegetarian', invitationSent: true, group: 'colleagues' },
    { id: 'g4', name: 'Sophie Laurent', email: 'sophie@example.com', partySize: 2, rsvpStatus: 'pending', mealChoice: 'beef', invitationSent: false, group: 'bride_family' },
  ];

  const rsvp = calculateRSVPSummary(guests);
  assert.equal(rsvp.totalGuests, 6);
  assert.equal(rsvp.attending, 3);
  assert.equal(rsvp.declined, 1);
  assert.equal(rsvp.pending, 2);
  assert.equal(rsvp.attendanceRate, 50);
  assert.equal(rsvp.meals.beef, 2);
  assert.equal(rsvp.meals.fish, 1);
  assert.equal(rsvp.totalDietaryRestrictions, 1);
  assert.equal(rsvp.seatedGuests, 3);
  assert.equal(rsvp.unseatedGuests, 0);
});

test('calculateTableOccupancies correctly flags capacity and available seats', () => {
  const tables: TableItem[] = [
    { id: 't1', name: 'Table 1 - Olive Grove', shape: 'round', capacity: 8, x: 100, y: 100 },
    { id: 't2', name: 'Table 2 - Cypress', shape: 'round', capacity: 4, x: 250, y: 100 },
  ];

  const guests: Guest[] = [
    { id: 'g1', name: 'Alice', email: 'a@test.com', partySize: 2, rsvpStatus: 'attending', mealChoice: 'beef', tableId: 't1', invitationSent: true, group: 'mutual_friends' },
    { id: 'g2', name: 'Bob', email: 'b@test.com', partySize: 4, rsvpStatus: 'attending', mealChoice: 'fish', tableId: 't1', invitationSent: true, group: 'mutual_friends' },
    { id: 'g3', name: 'Charlie', email: 'c@test.com', partySize: 5, rsvpStatus: 'attending', mealChoice: 'vegetarian', tableId: 't2', invitationSent: true, group: 'bride_family' },
  ];

  const occupancies = calculateTableOccupancies(tables, guests);
  assert.equal(occupancies[0].seatedCount, 6);
  assert.equal(occupancies[0].availableSeats, 2);
  assert.equal(occupancies[0].isOverCapacity, false);

  assert.equal(occupancies[1].seatedCount, 5);
  assert.equal(occupancies[1].availableSeats, 0);
  assert.equal(occupancies[1].isOverCapacity, true); // 5 > 4 capacity
});

test('calculateMilestoneProgress correctly computes progress and overdue items', () => {
  const milestones: MilestoneItem[] = [
    { id: 'm1', title: 'Book Venue', category: 'Venue', dueDate: '2026-01-01', completed: true, assigneeRole: 'bride', priority: 'high' },
    { id: 'm2', title: 'Send Save the Dates', category: 'Stationery', dueDate: '2026-03-01', completed: false, assigneeRole: 'groom', priority: 'medium' },
    { id: 'm3', title: 'Cake Tasting', category: 'Catering', dueDate: '2026-11-01', completed: false, assigneeRole: 'bride', priority: 'low' },
  ];

  const progress = calculateMilestoneProgress(milestones, '2026-05-01');
  assert.equal(progress.total, 3);
  assert.equal(progress.completed, 1);
  assert.equal(progress.overdue, 1); // 2026-03-01 is before 2026-05-01
  assert.equal(progress.upcoming, 1); // 2026-11-01 is after 2026-05-01
  assert.equal(progress.percentCompleted, 33);
});

test('interpolateVendorTemplate substitutes dynamic template tokens', () => {
  const tmpl = 'Dear {vendor_name}, we are planning our wedding on {wedding_date} for {guest_count} guests at {venue_name}.';
  const out = interpolateVendorTemplate(tmpl, {
    vendor_name: 'Florence Floral Art',
    wedding_date: 'September 18, 2026',
    guest_count: 120,
    venue_name: 'Villa San Michele',
  });
  assert.equal(out, 'Dear Florence Floral Art, we are planning our wedding on September 18, 2026 for 120 guests at Villa San Michele.');
});

test('evaluatePermissions enforces role-based access control', () => {
  assert.equal(evaluatePermissions('bride', 'view_budget'), true);
  assert.equal(evaluatePermissions('bride', 'manage_backups'), true);

  assert.equal(evaluatePermissions('lead_planner', 'view_budget'), true);
  assert.equal(evaluatePermissions('lead_planner', 'manage_backups'), false); // Only couple manages backups

  assert.equal(evaluatePermissions('maid_of_honor', 'manage_guests'), true);
  assert.equal(evaluatePermissions('maid_of_honor', 'view_budget'), false);

  assert.equal(evaluatePermissions('vendor_coordinator', 'communicate_vendors'), true);
  assert.equal(evaluatePermissions('vendor_coordinator', 'edit_budget'), false);
});

test('generateSimpleChecksum generates stable hashes for backups', () => {
  const data = JSON.stringify({ couple: 'Camille & Julian', budget: 55000 });
  const hash1 = generateSimpleChecksum(data);
  const hash2 = generateSimpleChecksum(data);
  assert.equal(hash1, hash2);
  assert.match(hash1, /^chk_[0-9a-f]{8}$/);
});

test('calculateVendorAverageRating computes accurate mean from review scores', () => {
  const reviews = [
    { id: 'r1', author: 'Sophie L.', rating: 5, date: '2026-08-01', comment: 'Breathtaking floral arch!', verifiedCouple: true },
    { id: 'r2', author: 'Arthur M.', rating: 4, date: '2026-08-10', comment: 'Superb roses, on-time delivery.', verifiedCouple: true },
  ];
  const stats = calculateVendorAverageRating(reviews);
  assert.equal(stats.rating, 4.5);
  assert.equal(stats.count, 2);
});

test('filterMarketplaceVendors filters accurately by category, location, and price tier', () => {
  const sampleVendors = [
    {
      id: 'v1',
      name: 'Florence Floral Art',
      category: 'Florals',
      location: 'Tuscany',
      country: 'Italy',
      priceTier: '$$$' as const,
      minBudget: 5000,
      maxBudget: 12000,
      rating: 4.9,
      reviewsCount: 12,
      reviews: [],
      services: [{ title: 'Full Ceremony Arch', price: 4500, description: 'Bespoke arch' }],
      portfolioImages: [],
      contactPerson: 'Elena Rossi',
      email: 'elena@florencefloral.it',
      phone: '+39 055 123 456',
      website: 'florencefloral.it',
      description: 'Fine art floral arrangements in Tuscany.',
      featured: true,
    },
    {
      id: 'v2',
      name: 'Parisian Grain Photography',
      category: 'Photography',
      location: 'Paris',
      country: 'France',
      priceTier: '$$$$' as const,
      minBudget: 8000,
      maxBudget: 20000,
      rating: 5.0,
      reviewsCount: 8,
      reviews: [],
      services: [{ title: 'Medium Format Film', price: 8000, description: '12 hours coverage' }],
      portfolioImages: [],
      contactPerson: 'Jean Delacroix',
      email: 'jean@parisiangrain.fr',
      phone: '+33 6 12 34 56 78',
      website: 'parisiangrain.fr',
      description: 'Documentary medium format photography in Paris.',
      featured: true,
    },
  ];

  const florists = filterMarketplaceVendors(sampleVendors, { category: 'Florals' });
  assert.equal(florists.length, 1);
  assert.equal(florists[0].name, 'Florence Floral Art');

  const parisian = filterMarketplaceVendors(sampleVendors, { location: 'Paris' });
  assert.equal(parisian.length, 1);
  assert.equal(parisian[0].name, 'Parisian Grain Photography');

  const affordable = filterMarketplaceVendors(sampleVendors, { maxPrice: 6000 });
  assert.equal(affordable.length, 1);
  assert.equal(affordable[0].id, 'v1');
});
