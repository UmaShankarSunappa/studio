
import type { User, Lead, LeadSource, LeadStatus, Note, UserRole, UserState, InterestType } from '@/types';

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
    "Form 2 - Submitted",
    "Form 2 - No Response",
    "In Discussion",
    "Follow-up Required",
    "Converted",
    "Not Interested"
];

const leadSources: LeadSource[] = ["Newspaper", "YouTube", "Field Marketing", "Website", "Referral"];
const telanganaCities = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"];
const tamilNaduCities = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"];
const interestTypes: InterestType[] = ["Franchisee", "Convert", "Job", "Rent"];

const names = [
  "Rohan Sharma", "Priya Patel", "Amit Singh", "Anjali Mehta", "Vikram Kumar",
  "Sneha Reddy", "Rajesh Gupta", "Pooja Desai", "Arun Verma", "Deepika Iyer",
  "Suresh Nair", "Kavita Rao", "Manoj Joshi", "Sunita Williams", "Harish Kumar",
  "Geeta Singh", "Anil Patel", "Rekha Sharma", "Sanjay Mehta", "Anita Desai"
];

export const leads: Lead[] = Array.from({ length: 100 }, (_, i) => {
  const isTelangana = i < 50;
  const state: "Telangana" | "Tamil Nadu" = isTelangana ? "Telangana" : "Tamil Nadu";
  const city = isTelangana 
    ? telanganaCities[i % telanganaCities.length]
    : tamilNaduCities[i % tamilNaduCities.length];
  
  const name = names[i % names.length];
  const dateAdded = new Date(new Date().setDate(new Date().getDate() - i * 2));
  
  const assignableStatuses = leadStatuses.filter(s => s !== "Not Interested" && s !== "Converted");
  const currentStatus = assignableStatuses[i % assignableStatuses.length];
  
  let assignedUser: User | undefined = undefined;

  const statusesRequiringAssignment: LeadStatus[] = ['WhatsApp - Delivery Failed', 'Form 2 - Submitted', 'Form 2 - No Response'];
  const initialStatuses: LeadStatus[] = ['New', 'WhatsApp - Sent'];
  
  const evaluatorsInState = allUsers.filter(u => u.role === 'Evaluator' && u.state === state);

  if (!initialStatuses.includes(currentStatus) && !statusesRequiringAssignment.includes(currentStatus)) {
    if (evaluatorsInState.length > 0) {
        assignedUser = evaluatorsInState[i % evaluatorsInState.length];
    }
  } else if (statusesRequiringAssignment.includes(currentStatus)) {
    if (i % 3 !== 0) {
        // Leave it unassigned
    } else {
        if (evaluatorsInState.length > 0) {
            assignedUser = evaluatorsInState[i % evaluatorsInState.length];
        }
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
  
  const moreDetails = assignedUser
    ? {
        investmentCapacity: '12–15' as const,
        franchiseeAge: 36,
        franchiseeOccupation: 'Business Owner',
        franchiseeIncome: '18 Lakhs per annum',
        maritalStatus: 'Married' as const,
        qualification: 'B.Pharm',
        retailPharmacyExperience: true,
        hasOtherBusinesses: true,
        otherBusinessesDetails: 'Yes – Owns a medical distribution shop',
      }
    : {
        investmentCapacity: undefined,
        franchiseeAge: undefined,
        franchiseeOccupation: undefined,
        franchiseeIncome: undefined,
        maritalStatus: undefined,
        qualification: undefined,
        retailPharmacyExperience: undefined,
        hasOtherBusinesses: undefined,
        otherBusinessesDetails: undefined,
      };
      
  return {
    id: `lead-${i + 1}`,
    name: name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: `9876543${(21 + i).toString().padStart(3, '0')}`,
    pincode: isTelangana ? `5000${(i % 90) + 10}` : `6000${(i % 90) + 10}`,
    interestType: interestTypes[i % interestTypes.length],
    city: city,
    state: state,
    source: leadSources[i % leadSources.length],
    status: currentStatus,
    dateAdded: dateAdded,
    assignedUser: assignedUser,
    ...moreDetails,
    statusHistory: statusHistory,
    interactions: interactions,
    notes: notes,
  };
});
