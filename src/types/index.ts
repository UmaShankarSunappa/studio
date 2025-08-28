export type LeadSource = "Newspaper" | "YouTube" | "Field Marketing" | "Website" | "Referral";

export type LeadStatus =
  | "New"
  | "WhatsApp - Sent"
  | "WhatsApp - Delivery Failed"
  | "Form 2 - Pending"
  | "Form 2 - Submitted"
  | "Form 2 - No Response"
  | "Follow up"
  | "Converted"
  | "Not Interested";

export type User = {
  id: string;
  name: string;
  avatar: string;
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
  state: string;
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
