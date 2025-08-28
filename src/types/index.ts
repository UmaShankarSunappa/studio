export type LeadSource = "Newspaper" | "YouTube" | "Field Marketing" | "Website";

export type LeadStatus =
  | "New"
  | "WhatsApp - Sent"
  | "WhatsApp - Delivery Failed"
  | "Form 2 - Pending"
  | "Form 2 - Submitted"
  | "Form 2 - No Response"
  | "Sales - Follow-up"
  | "Converted";

export type User = {
  id: string;
  name: string;
  avatar: string;
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
};
