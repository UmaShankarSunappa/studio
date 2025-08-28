import type { User, Lead, LeadSource, LeadStatus } from '@/types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  avatar: 'https://i.pravatar.cc/150?u=user-1',
};

export const users: User[] = [
  currentUser,
  { id: 'user-2', name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'Chen Wei', avatar: 'https://i.pravatar.cc/150?u=user-3' },
];

const leadStatuses: LeadStatus[] = [
  "New", "WhatsApp - Sent", "WhatsApp - Delivery Failed",
  "Form 2 - Pending", "Form 2 - Submitted", "Form 2 - No Response",
  "Sales - Follow-up", "Converted"
];

const leadSources: LeadSource[] = ["Newspaper", "YouTube", "Field Marketing", "Website"];
const cities = [
  { name: "Mumbai", state: "Maharashtra" }, { name: "Delhi", state: "Delhi" },
  { name: "Bangalore", state: "Karnataka" }, { name: "Chennai", state: "Tamil Nadu" },
  { name: "Kolkata", state: "West Bengal" }, { name: "Hyderabad", state: "Telangana" },
  { name: "Pune", state: "Maharashtra" }, { name: "Ahmedabad", state: "Gujarat" },
  { name: "Jaipur", state: "Rajasthan" }, { name: "Lucknow", state: "Uttar Pradesh" }
];
const names = [
  "Rohan Sharma", "Priya Patel", "Amit Singh", "Anjali Mehta", "Vikram Kumar",
  "Sneha Reddy", "Rajesh Gupta", "Pooja Desai", "Arun Verma", "Deepika Iyer",
  "Suresh Nair", "Kavita Rao", "Manoj Joshi", "Sunita Williams", "Harish Kumar",
  "Geeta Singh", "Anil Patel", "Rekha Sharma", "Sanjay Mehta", "Anita Desai"
];

export const leads: Lead[] = Array.from({ length: 50 }, (_, i) => {
  const name = names[i % names.length];
  const cityInfo = cities[i % cities.length];
  const status = leadStatuses[i % leadStatuses.length];
  
  let assignedUser: User | undefined = undefined;
  if (status !== "New" && status !== "WhatsApp - Sent" && i % 3 !== 0) {
    assignedUser = users[i % users.length];
  }
  
  return {
    id: `lead-${i + 1}`,
    name: name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: `9876543${(21 + i).toString().padStart(3, '0')}`,
    city: cityInfo.name,
    state: cityInfo.state,
    source: leadSources[i % leadSources.length],
    status: status,
    dateAdded: new Date(new Date().setDate(new Date().getDate() - i * 2)),
    assignedUser: assignedUser,
  };
});
