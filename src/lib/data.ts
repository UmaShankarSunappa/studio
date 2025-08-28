import type { User, Lead, LeadSource, LeadStatus, Note, UserRole, UserState } from '@/types';

export const allUsers: User[] = [
  { id: 'user-1', name: 'Admin User', avatar: 'https://i.pravatar.cc/150?u=user-1', role: 'Admin', state: 'All' },
  { id: 'user-2', name: 'Telangana Manager', avatar: 'https://i.pravatar.cc/150?u=user-2', role: 'Manager', state: 'Telangana' },
  { id: 'user-3', name: 'Tamil Nadu Manager', avatar: 'https://i.pravatar.cc/150?u=user-3', role: 'Manager', state: 'Tamil Nadu' },
  { id: 'user-4', name: 'Telangana Evaluator', avatar: 'https://i.pravatar.cc/150?u=user-4', role: 'Evaluator', state: 'Telangana' },
  { id: 'user-5', name: 'Tamil Nadu Evaluator', avatar: 'https://i.pravatar.cc/150?u=user-5', role: 'Evaluator', state: 'Tamil Nadu' },
];


export const leadStatuses: LeadStatus[] = [
  "New", "WhatsApp - Sent", "WhatsApp - Delivery Failed",
  "Form 2 - Pending", "Form 2 - Submitted", "Form 2 - No Response",
  "Follow up", "Converted", "Not Interested"
];

const leadSources: LeadSource[] = ["Newspaper", "YouTube", "Field Marketing", "Website", "Referral"];
const cities = [
  { name: "Hyderabad", state: "Telangana" as const }, { name: "Warangal", state: "Telangana" as const },
  { name: "Chennai", state: "Tamil Nadu" as const }, { name: "Madurai", state: "Tamil Nadu" as const },
  { name: "Coimbatore", state: "Tamil Nadu" as const }, { name: "Nizamabad", state: "Telangana" as const }
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
  
  const assignableStatuses = leadStatuses.filter(s => s !== "Not Interested");
  const currentStatus = assignableStatuses[i % assignableStatuses.length];
  
  let assignedUser: User | undefined = undefined;
  if (currentStatus !== "New" && currentStatus !== "WhatsApp - Sent" && i % 3 !== 0) {
    // Assign to an evaluator from the same state
    const evaluatorsInState = allUsers.filter(u => u.role === 'Evaluator' && u.state === cityInfo.state);
    if (evaluatorsInState.length > 0) {
        assignedUser = evaluatorsInState[i % evaluatorsInState.length];
    }
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
    education: educationLevels[i % educationLevels.length],
    previousExperience: businessExperience[i % businessExperience.length],
    investmentCapacity: investmentCapacities[i % investmentCapacities.length],
    statusHistory: statusHistory,
    interactions: interactions,
    notes: notes,
  };
});
