import type { User, Lead, LeadSource, LeadStatus, Note, UserRole, UserState } from '@/types';

export const allUsers: User[] = [
  { id: 'user-1', name: 'Admin User', avatar: 'https://i.pravatar.cc/150?u=user-1', role: 'Admin', state: 'All' },
  { id: 'user-2', name: 'Telangana Manager', avatar: 'https://i.pravatar.cc/150?u=user-2', role: 'Manager', state: 'Telangana' },
  { id: 'user-3', name: 'Tamil Nadu Manager', avatar: 'https://i.pravatar.cc/150?u=user-3', role: 'Manager', state: 'Tamil Nadu' },
  { id: 'user-4', name: 'Suresh Reddy', avatar: 'https://i.pravatar.cc/150?u=user-4', role: 'Evaluator', state: 'Telangana' },
  { id: 'user-5', name: 'Priya Mohan', avatar: 'https://i.pravatar.cc/150?u=user-5', role: 'Evaluator', state: 'Tamil Nadu' },
  { id: 'user-6', name: 'Anil Kumar', avatar: 'https://i.pravatar.cc/150?u=user-6', role: 'Evaluator', state: 'Telangana' },
  { id: 'user-7', name: 'Lakshmi Gupta', avatar: 'https://i.pravatar.cc/150?u=user-7', role: 'Evaluator', state: 'Telangana' },
  { id: 'user-8', name: 'Rajesh Kannan', avatar: 'https://i.pravatar.cc/150?u=user-8', role: 'Evaluator', state: 'Tamil Nadu' },
  { id: 'user-9', name: 'Deepa Iyer', avatar: 'https://i.pravatar.cc/150?u=user-9', role: 'Evaluator', state: 'Tamil Nadu' },
];


export const leadStatuses: LeadStatus[] = [
    "New",
    "WhatsApp - Sent",
    "WhatsApp - Delivery Failed",
    "Form 2 - Pending",
    "Form 2 - Submitted",
    "Form 2 - No Response",
    "In Discussion",
    "Document Shared",
    "Follow-up Required",
    "Site Visit Scheduled",
    "In Evaluation",
    "Negotiation Stage",
    "On Hold",
    "Converted",
    "Not Interested"
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

export const leads: Lead[] = Array.from({ length: 150 }, (_, i) => {
  const name = names[i % names.length];
  const cityInfo = cities[i % cities.length];
  const dateAdded = new Date(new Date().setDate(new Date().getDate() - i * 2));
  
  const assignableStatuses = leadStatuses.filter(s => s !== "Not Interested");
  const currentStatus = assignableStatuses[i % assignableStatuses.length];
  
  let assignedUser: User | undefined = undefined;

  const statusesRequiringAssignment: LeadStatus[] = ['WhatsApp - Delivery Failed', 'Form 2 - Submitted', 'Form 2 - No Response', 'Form 2 - Pending'];
  const initialStatuses: LeadStatus[] = ['New', 'WhatsApp - Sent'];
  
  const evaluatorsInState = allUsers.filter(u => u.role === 'Evaluator' && u.state === cityInfo.state);

  // If status is past initial stages and NOT one that shows the "Assign" button, it should be pre-assigned.
  if (!initialStatuses.includes(currentStatus) && !statusesRequiringAssignment.includes(currentStatus)) {
    if (evaluatorsInState.length > 0) {
        assignedUser = evaluatorsInState[i % evaluatorsInState.length];
    }
  } else if (statusesRequiringAssignment.includes(currentStatus)) {
    // For statuses that should show the "Assign" button, let's make some of them unassigned.
    if (i % 3 !== 0) {
        // Leave it unassigned (assignedUser remains undefined)
    } else {
        // Pre-assign some of them anyway for variety
        if (evaluatorsInState.length > 0) {
            assignedUser = evaluatorsInState[i % evaluatorsInState.length];
        }
    }
  }
  // For initialStatuses, assignedUser remains undefined.

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
