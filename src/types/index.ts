
export type LeadSource = "Newspaper" | "YouTube" | "Field Marketing" | "Website" | "Referral" | string; // Allow campaign names as sources

export type LeadStatus =
  | "New"
  | "WhatsApp - Sent"
  | "WhatsApp - Delivery Failed"
  | "Form 2 - Submitted"
  | "Form 2 - No Response"
  | "In Discussion"
  | "Follow-up Required"
  | "Converted"
  | "Not Interested";

export type UserRole = "Admin" | "Manager" | "Evaluator";
export type UserState = "Telangana" | "Tamil Nadu" | "All";

export type User = {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  state: UserState;
};

export type StatusHistory = {
  status: LeadStatus;
  date: Date;
};

export type CallStatus = "Phone Not Connected" | "Switched Off" | "Busy" | "Connected";

export type Interaction = {
  type: string;
  date: Date;
  notes: string;
  duration?: number; // in seconds
  callStatus?: CallStatus;
};

export type Note = {
  text: string;
  date: Date;
  user: User;
};

export type Lead = {
  id: string;
  name: string;
  city: string;
  state: "Telangana" | "Tamil Nadu";
  source: LeadSource;
  status: LeadStatus;
  dateAdded: Date;
  assignedUser?: User;
  phone: string;
  email: string;
  // More Details
  investmentCapacity?: '8–12' | '12–15' | '15–20';
  franchiseeAge?: number;
  franchiseeOccupation?: string;
  franchiseeIncome?: string;
  maritalStatus?: 'Married' | 'Single';
  qualification?: string;
  retailPharmacyExperience?: boolean;
  hasOtherBusinesses?: boolean;
  otherBusinessesDetails?: string;
  // Logs
  statusHistory: StatusHistory[];
  interactions: Interaction[];
  notes: Note[];
};

export type Campaign = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  leadCount: number;
  state?: UserState;
  period?: { from: Date; to: Date };
};

// Types for Availability and Slot Booking
export type AvailabilityStatus = "Not Set" | "Calling" | "Field Work" | "Not Available" | "Leave";

export type DailyAvailability = {
  firstHalf: AvailabilityStatus;
  secondHalf: AvailabilityStatus;
};

export type Availability = {
  // Key is evaluator's userId
  [userId: string]: {
    // Key is date string 'yyyy-MM-dd'
    [date: string]: DailyAvailability;
  };
};

export type Appointment = {
    id: string;
    leadId: string;
    evaluatorId: string;
    date: Date; // This will store the full date and time of the slot
    duration: number; // in minutes, e.g., 20
    status: 'Booked' | 'Completed' | 'Cancelled' | 'Rescheduled';
    notes?: string;
};
