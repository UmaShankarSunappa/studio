
import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  History,
  MessageSquare,
  StickyNote,
  CheckCircle,
  Pencil,
  Clock,
  PhoneMissed,
  PhoneOff,
  PhoneForwarded,
  PhoneCall,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Lead, LeadStatus, UserState, CallStatus } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { leadStatuses } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';


const states: UserState[] = ["Telangana", "Tamil Nadu"];
const investmentCapacities = ["8–12", "12–15", "15–20"];
const maritalStatuses = ["Married", "Single"];

const leadEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  city: z.string().min(2, "City is required."),
  state: z.enum(["Telangana", "Tamil Nadu"]),
  investmentCapacity: z.enum(["8–12", "12–15", "15–20"]).optional(),
  franchiseeAge: z.coerce.number().min(18, "Age must be at least 18.").max(100).optional(),
  franchiseeOccupation: z.string().min(1, "Occupation is required.").optional(),
  franchiseeIncome: z.string().min(1, "Income is required.").optional(),
  maritalStatus: z.enum(["Married", "Single"]).optional(),
  qualification: z.string().min(1, "Qualification is required.").optional(),
  retailPharmacyExperience: z.enum(["Yes", "No"]).optional(),
  hasOtherBusinesses: z.boolean().optional(),
  otherBusinessesDetails: z.string().optional(),
}).refine(data => {
    if (data.hasOtherBusinesses && !data.otherBusinessesDetails) {
        return false;
    }
    return true;
}, {
    message: "Please provide details about other businesses.",
    path: ["otherBusinessesDetails"],
});

type LeadEditFormValues = z.infer<typeof leadEditSchema>;


interface LeadDetailSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddNote: (leadId: string, noteText: string) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus, remarks?: string) => void;
  onUpdateLead: (leadId: string, data: LeadEditFormValues) => void;
}

const callStatusIcons: Record<CallStatus, React.ElementType> = {
    "Connected": PhoneForwarded,
    "Busy": PhoneMissed,
    "Switched Off": PhoneOff,
    "Phone Not Connected": PhoneCall
}

export function LeadDetailSheet({
  lead,
  isOpen,
  onOpenChange,
  onAddNote,
  onUpdateStatus,
  onUpdateLead,
}: LeadDetailSheetProps) {
  const { user: currentUser } = useAuth();
  const [note, setNote] = React.useState('');
  const [isRemarksDialogOpen, setIsRemarksDialogOpen] = React.useState(false);
  const [remarks, setRemarks] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const form = useForm<LeadEditFormValues>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: {},
  });
  
  const hasOtherBusinesses = form.watch("hasOtherBusinesses");

  React.useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        state: lead.state,
        investmentCapacity: lead.investmentCapacity,
        franchiseeAge: lead.franchiseeAge,
        franchiseeOccupation: lead.franchiseeOccupation,
        franchiseeIncome: lead.franchiseeIncome,
        maritalStatus: lead.maritalStatus,
        qualification: lead.qualification,
        retailPharmacyExperience: lead.retailPharmacyExperience ? 'Yes' : 'No',
        hasOtherBusinesses: lead.hasOtherBusinesses,
        otherBusinessesDetails: lead.otherBusinessesDetails,
      });
    }
  }, [lead, form, isOpen]);

  const handleAddNote = () => {
    if (lead && note.trim()) {
      onAddNote(lead.id, note);
      setNote('');
    }
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!lead) return;
    if (newStatus === "Not Interested") {
      setIsRemarksDialogOpen(true);
    } else {
      onUpdateStatus(lead.id, newStatus);
    }
  };
  
  const handleConfirmNotInterested = () => {
    if (lead) {
      onUpdateStatus(lead.id, "Not Interested", remarks);
      setRemarks("");
      setIsRemarksDialogOpen(false);
    }
  };

  const handleEditSubmit = (data: LeadEditFormValues) => {
    if (lead) {
        const leadData = {
          ...data,
          retailPharmacyExperience: data.retailPharmacyExperience === 'Yes',
        };
        onUpdateLead(lead.id, leadData);
        setIsEditing(false);
    }
  };

  if (!lead || !currentUser) return null;

  const isAssignedToCurrentUser = lead.assignedUser?.id === currentUser.id;
  const isAssigned = !!lead.assignedUser;
  const callHistory = lead.interactions.filter(i => i.type === 'Call');
  const totalCalls = callHistory.length;


  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => { onOpenChange(open); setIsEditing(false); }}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col">
          <SheetHeader className="p-6 pb-0">
             <div className="flex justify-between items-start">
                <div>
                    <SheetTitle className="text-3xl font-headline flex items-center gap-3">
                      {isEditing ? (
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field }) => <Input {...field} className="text-3xl font-headline h-12" />}
                        />
                      ) : (
                        lead.name
                      )}
                    </SheetTitle>
                    <SheetDescription>
                      360-Degree Lead Profile
                    </SheetDescription>
                </div>
                {!isEditing && (
                    <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Lead</span>
                    </Button>
                )}
             </div>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="flex flex-col flex-1 min-h-0">
              <ScrollArea className="flex-1">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Details */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Lead Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isAssignedToCurrentUser && !isEditing ? (
                            <Select
                              value={lead.status}
                              onValueChange={handleStatusChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Update status..." />
                              </SelectTrigger>
                              <SelectContent>
                                {leadStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="secondary" className="text-base">
                              {lead.status}
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                              Assigned to: {lead.assignedUser ? (lead.assignedUser.id === currentUser.id ? 'You' : lead.assignedUser.name) : 'Unassigned'}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Demographic Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          {isEditing ? (
                            <>
                              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                               <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                               <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                               <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel>State</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl> <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3"> <Mail className="w-4 h-4 text-muted-foreground" /> <span>{lead.email}</span> </div>
                              <div className="flex items-center gap-3"> <Phone className="w-4 h-4 text-muted-foreground" /> <span>{lead.phone}</span> </div>
                              <div className="flex items-center gap-3"> <MapPin className="w-4 h-4 text-muted-foreground" /> <span> {lead.city}, {lead.state} </span> </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                      
                      {isAssigned && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Briefcase className="w-5 h-5" />
                              More details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm">
                              {isEditing ? (
                                  <>
                                    <FormField control={form.control} name="investmentCapacity" render={({ field }) => ( <FormItem> <FormLabel>Investment Capacity (Lakhs)</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl> <SelectContent>{investmentCapacities.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="franchiseeAge" render={({ field }) => ( <FormItem> <FormLabel>Franchisee Age</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                    <FormField control={form.control} name="franchiseeOccupation" render={({ field }) => ( <FormItem> <FormLabel>Franchisee Occupation</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                    <FormField control={form.control} name="franchiseeIncome" render={({ field }) => ( <FormItem> <FormLabel>Franchisee Income</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                    <FormField control={form.control} name="maritalStatus" render={({ field }) => ( <FormItem> <FormLabel>Marital Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl> <SelectContent>{maritalStatuses.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="qualification" render={({ field }) => ( <FormItem> <FormLabel>Qualification</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                    <FormField control={form.control} name="retailPharmacyExperience" render={({ field }) => ( <FormItem> <FormLabel>Retail Pharmacy Experience?</FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4"> <FormItem className="flex items-center space-x-2"> <FormControl> <RadioGroupItem value="Yes" /> </FormControl> <FormLabel className="font-normal">Yes</FormLabel> </FormItem> <FormItem className="flex items-center space-x-2"> <FormControl> <RadioGroupItem value="No" /> </FormControl> <FormLabel className="font-normal">No</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )} />
                                    <FormField control={form.control} name="hasOtherBusinesses" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"> <div> <FormLabel>Do you have other businesses?</FormLabel> </div> <FormControl> <Switch checked={field.value} onCheckedChange={field.onChange} /> </FormControl> </FormItem> )} />
                                    {hasOtherBusinesses && (
                                       <FormField control={form.control} name="otherBusinessesDetails" render={({ field }) => ( <FormItem> <FormLabel>Details of other businesses</FormLabel> <FormControl> <Textarea placeholder="Describe other businesses..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                    )}
                                  </>
                              ) : (
                                  <>
                                      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                        <div><p className="font-medium">Investment Capacity</p><p className="text-muted-foreground">{lead.investmentCapacity ? `${lead.investmentCapacity} Lakhs` : '-'}</p></div>
                                        <div><p className="font-medium">Franchisee Age</p><p className="text-muted-foreground">{lead.franchiseeAge || '-'}</p></div>
                                        <div><p className="font-medium">Franchisee Occupation</p><p className="text-muted-foreground">{lead.franchiseeOccupation || '-'}</p></div>
                                        <div><p className="font-medium">Franchisee Income</p><p className="text-muted-foreground">{lead.franchiseeIncome || '-'}</p></div>
                                        <div><p className="font-medium">Marital Status</p><p className="text-muted-foreground">{lead.maritalStatus || '-'}</p></div>
                                        <div><p className="font-medium">Qualification</p><p className="text-muted-foreground">{lead.qualification || '-'}</p></div>
                                        <div><p className="font-medium">Retail Pharmacy Experience</p><p className="text-muted-foreground">{lead.retailPharmacyExperience === undefined ? '-' : (lead.retailPharmacyExperience ? 'Yes' : 'No')}</p></div>
                                        <div><p className="font-medium">Any Other Businesses?</p><p className="text-muted-foreground">{lead.hasOtherBusinesses === undefined ? '-' : (lead.hasOtherBusinesses ? 'Yes' : 'No')}</p></div>
                                      </div>
                                      {lead.hasOtherBusinesses && (
                                        <div className="pt-2"><p className="font-medium">Other Business Details</p><p className="text-muted-foreground">{lead.otherBusinessesDetails || '-'}</p></div>
                                      )}
                                  </>
                              )}
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Column 2: Interactions & Notes */}
                    <div className="space-y-6">
                       <Card>
                        <CardHeader> <CardTitle className="flex items-center justify-between gap-2"> <MessageSquare className="w-5 h-5" /> Call History <Badge variant="secondary">{totalCalls} calls</Badge> </CardTitle> </CardHeader>
                        <CardContent className="space-y-4">
                          {callHistory.length > 0 ? callHistory.map((interaction, index) => {
                             const CallIcon = interaction.callStatus ? callStatusIcons[interaction.callStatus] : MessageSquare;
                             return (
                                <div key={index} className="flex items-start gap-3 text-sm">
                                    <CallIcon className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium">{interaction.callStatus || 'Call'}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span>{interaction.duration ?? 0}s</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{format(new Date(interaction.date), 'MMM d, yyyy h:mm a')}</p>
                                    </div>
                                </div>
                            )
                          }) : <p className="text-sm text-muted-foreground">No calls have been made yet.</p>}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader> <CardTitle className="flex items-center gap-2"> <History className="w-5 h-5" /> Status History </CardTitle> </CardHeader>
                        <CardContent>
                          <ul className="space-y-4">
                            {lead.statusHistory.map((history, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                                  {index < lead.statusHistory.length - 1 && (<div className="w-px h-10 bg-border" />)}
                                </div>
                                <div> <p className="font-medium">{history.status}</p> <p className="text-sm text-muted-foreground">{format(new Date(history.date), 'MMM d, yyyy h:mm a')}</p> </div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader> <CardTitle className="flex items-center gap-2"> <StickyNote className="w-5 h-5" /> Follow-up Notes </CardTitle> </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {lead.notes.map((note, index) => (
                              <div key={index} className="text-sm bg-secondary p-3 rounded-md"> <p className="font-medium">{note.user.name}</p> <p className="text-xs text-muted-foreground mb-1">{format(new Date(note.date), 'MMM d, yyyy h:mm a')}</p> <p className="text-muted-foreground">{note.text}</p> </div>
                            ))}
                          </div>
                          {!isEditing && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                    <Textarea placeholder="Add a new note..." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[100px]" />
                                    <Button onClick={handleAddNote} className="w-full"> Add Note </Button>
                                </div>
                              </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                </div>
              </ScrollArea>
              {isEditing && (
                <SheetFooter className="p-6 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </SheetFooter>
              )}
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={isRemarksDialogOpen} onOpenChange={setIsRemarksDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead Not Interested</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide remarks for changing the status to "Not Interested". This will be added as a note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Enter remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemarks("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNotInterested} disabled={!remarks.trim()}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
