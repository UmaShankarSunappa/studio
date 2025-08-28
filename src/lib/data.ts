import type { User, Lead, LeadSource, LeadStatus, Note } from '@/types';

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

export const leadStatuses: LeadStatus[] = [
  "New", "WhatsApp - Sent", "WhatsApp - Delivery Failed",
  "Form 2 - Pending", "Form 2 - Submitted", "Form 2 - No Response",
  "Follow up", "Converted", "Not Interested"
];

const leadSources: LeadSource[] = ["Newspaper", "YouTube", "Field Marketing", "Website", "Referral"];
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

const educationLevels = ["Bachelor's Degree", "Master's Degree", "High School Diploma", "PhD", "MBA"];
const businessExperience = ["0-2 years", "2-5 years", "5-10 years", "10+ years", "No experience"];
const investmentCapacities = [50000, 75000, 100000, 150000, 200000];

export const leads: Lead[] = Array.from({ length: 50 }, (_, i) => {
  const name = names[i % names.length];
  const cityInfo = cities[i % cities.length];
  const dateAdded = new Date(new Date().setDate(new Date().getDate() - i * 2));
  
  // Exclude "Not Interested" from random generation for existing leads
  const assignableStatuses = leadStatuses.filter(s => s !== "Not Interested");
  const currentStatus = assignableStatuses[i % assignableStatuses.length];
  
  let assignedUser: User | undefined = undefined;
  if (currentStatus !== "New" && currentStatus !== "WhatsApp - Sent" && i % 3 !== 0) {
    assignedUser = users[i % users.length];
  }

  const statusHistory = [{ status: "New" as LeadStatus, date: new Date(dateAdded.getTime() - 86400000) }];
  if (currentStatus !== "New") {
    statusHistory.push({ status: currentStatus, date: dateAdded });
  }

  const interactions = [
    { type: "Initial Inquiry", date: new Date(dateAdded.getTime() - 172800000), notes: "Prospect inquired via website form about franchise opportunities." },
    { type: "WhatsApp Message", date: dateAdded, notes: "Sent initial WhatsApp message with brochure." }
  ];

  const notes: Note[] = [];
  if (i % 5 === 0 && assignedUser) {
      notes.push({
          text: "Follow up next week regarding Form-2 submission.",
          date: new Date(),
          user: assignedUser
      })
  }

  return {
    id: `lead-${i + 1}`,
    name: name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: `9876543${(21 + i).toString().padStart(3, '0')}`,
    city: cityInfo.name,
    state: cityInfo.state,
    source: leadSources[i % leadSources.length],
    status: currentStatus,
    dateAdded: dateAdded,
    assignedUser: assignedUser,
    // New fields
    education: educationLevels[i % educationLevels.length],
    previousExperience: businessExperience[i % businessExperience.length],
    investmentCapacity: investmentCapacities[i % investmentCapacities.length],
    statusHistory: statusHistory,
    interactions: interactions,
    notes: notes,
  };
});
