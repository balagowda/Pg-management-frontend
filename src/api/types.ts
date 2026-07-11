// Hand-typed from front-end_command.md Section 1 (the frozen backend contract).
// Follow-up: generate from the backend's live OpenAPI doc (`/v3/api-docs`) with
// openapi-typescript once the backend is stable, per Section 3.4, so this file
// and the backend spec can't silently drift apart.

export interface Owner {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  owner: Owner;
  refreshToken: string;
  /** seconds */
  expiresIn: number;
}

export interface PgDto {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface RoomDto {
  id: string;
  pgId: string;
  roomNumber: string;
  /** positive integer, >= 1 */
  capacity: number;
}

export type GuestStatus = 'ACTIVE' | 'NOTICE' | 'LEFT';

export interface GuestDto {
  id: string;
  pgId: string;
  roomId: string;
  name: string;
  phone: string;
  /** yyyy-MM-dd */
  joiningDate: string;
  monthlyRent: number;
  deposit: number;
  /** 1..28 inclusive */
  dueDay: number;
  status: GuestStatus;
}

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';

export interface PaymentDto {
  id: string;
  guestId: string;
  pgId: string;
  /** yyyy-MM */
  month: string;
  amountDue: number;
  amountPaid: number;
  status: PaymentStatus;
  /** epoch millis, nullable */
  paidOn: number | null;
  note: string | null;
}

export interface RecentActivityEntry {
  type: 'PAYMENT_RECEIVED' | 'GUEST_JOINED';
  guestName: string;
  amount: number | null;
  timestampMillis: number;
}

export interface DashboardDto {
  totalPgs: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  occupancyPercent: number;
  revenueThisMonth: number;
  pendingAmount: number;
  defaulterCount: number;
  todaysCollection: number;
  upcomingDues: PaymentDto[];
  guestsNeedingReminder: number;
  roomsWithVacancy: number;
  paymentsDueTomorrow: number;
  /** signed percent vs previous month, nullable */
  trendPercent: number | null;
  /** last 7-14 days' collected amount, ascending by date */
  sparkline: number[];
  recentActivity: RecentActivityEntry[];
}

export interface DefaulterDto {
  guestId: string;
  guestName: string;
  phone: string;
  roomNumber: string;
  pgName: string;
  monthlyRent: number;
  daysOverdue: number;
  outstandingAmount: number;
}

export interface SearchResults {
  guests: GuestDto[];
  rooms: RoomDto[];
  pgs: PgDto[];
}

export interface ProblemDetailFieldError {
  field: string;
  message: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: ProblemDetailFieldError[];
}
