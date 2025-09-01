export type LeadSource = "Newspaper" | "YouTube" | "Field Marketing" | "Website" | "Referral" | string; // Allow campaign names as sources

export type LeadStatus =
  | "New"
  | "WhatsApp - Sent"
  | "WhatsApp - Delivery Failed"
  | "Form 2 - Pending"
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
  // Form 2 Data
  education: string;
  previousExperience: string;
  investmentCapacity: number;
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
};
