export type LeadSource = "Newspaper" | "YouTube" | "Field Marketing" | "Website" | "Referral";

export type LeadStatus =
  | "New"
  | "WhatsApp - Sent"
  | "WhatsApp - Delivery Failed"
  | "Form 2 - Pending"
  | "Form 2 - Submitted"
  | "Form 2 - No Response"
  | "In Discussion"
  | "Document Shared"
  | "Follow-up Required"
  | "Site Visit Scheduled"
  | "In Evaluation"
  | "Negotiation Stage"
  | "On Hold"
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

export type Interaction = {
  type: string;
  date: Date;
  notes: string;
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
