
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Lead, LeadSource, UserState } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const leadSources: LeadSource[] = ["Newspaper", "YouTube", "Field Marketing", "Website", "Referral"];
const states: UserState[] = ["Telangana", "Tamil Nadu"];
const investmentCapacities = ["8–12", "12–15", "15–20"];
const maritalStatuses = ["Married", "Single"];

const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  city: z.string().min(2, "City is required."),
  state: z.enum(["Telangana", "Tamil Nadu"]),
  source: z.enum(["Newspaper", "YouTube", "Field Marketing", "Website", "Referral"]),
  investmentCapacity: z.enum(["8–12", "12–15", "15–20"]),
  franchiseeAge: z.coerce.number().min(18, "Age must be at least 18.").max(100),
  franchiseeOccupation: z.string().min(1, "Occupation is required."),
  franchiseeIncome: z.string().min(1, "Income is required."),
  maritalStatus: z.enum(["Married", "Single"]),
  qualification: z.string().min(1, "Qualification is required."),
  retailPharmacyExperience: z.enum(["Yes", "No"]),
  hasOtherBusinesses: z.boolean(),
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

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface CreateLeadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLead: (data: Omit<Lead, 'id' | 'dateAdded' | 'status' | 'statusHistory' | 'interactions' | 'notes' | 'assignedUser'>) => void;
}

export function CreateLeadDialog({ isOpen, onOpenChange, onCreateLead }: CreateLeadDialogProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      franchiseeAge: 0,
      franchiseeOccupation: "",
      franchiseeIncome: "",
      qualification: "",
      hasOtherBusinesses: false,
      otherBusinessesDetails: "",
    },
  });

  const hasOtherBusinesses = form.watch("hasOtherBusinesses");

  const onSubmit = (data: LeadFormValues) => {
    const leadData = {
        ...data,
        retailPharmacyExperience: data.retailPharmacyExperience === 'Yes',
    };
    onCreateLead(leadData);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Lead</DialogTitle>
          <DialogDescription>
            Fill in the details below to manually add a new lead to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input placeholder="Enter lead's name" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address</FormLabel> <FormControl> <Input placeholder="name@example.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl> <Input placeholder="10-digit mobile number" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="source" render={({ field }) => ( <FormItem> <FormLabel>Lead Source</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a source" /> </SelectTrigger> </FormControl> <SelectContent> {leadSources.map(source => ( <SelectItem key={source} value={source}>{source}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl> <Input placeholder="Enter city" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel>State</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a state" /> </SelectTrigger> </FormControl> <SelectContent> {states.map(state => ( <SelectItem key={state} value={state}>{state}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                </div>

                <h3 className="text-lg font-semibold pt-4">More Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="investmentCapacity" render={({ field }) => ( <FormItem> <FormLabel>Investment Capacity (Lakhs)</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select capacity" /> </SelectTrigger> </FormControl> <SelectContent> {investmentCapacities.map(cap => ( <SelectItem key={cap} value={cap}>{cap}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="franchiseeAge" render={({ field }) => ( <FormItem> <FormLabel>Franchisee Age</FormLabel> <FormControl> <Input type="number" placeholder="Enter age" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="franchiseeOccupation" render={({ field }) => ( <FormItem> <FormLabel>Franchisee Occupation</FormLabel> <FormControl> <Input placeholder="e.g., Business Owner" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="franchiseeIncome" render={({ field }) => ( <FormItem> <FormLabel>Franchisee Income</FormLabel> <FormControl> <Input placeholder="e.g., 10LPA or 50k/month" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="maritalStatus" render={({ field }) => ( <FormItem> <FormLabel>Marital Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select status" /> </SelectTrigger> </FormControl> <SelectContent> {maritalStatuses.map(status => ( <SelectItem key={status} value={status}>{status}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="qualification" render={({ field }) => ( <FormItem> <FormLabel>Qualification</FormLabel> <FormControl> <Input placeholder="e.g., B.Pharm" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={form.control} name="retailPharmacyExperience" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>Retail Pharmacy Experience?</FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4"> <FormItem className="flex items-center space-x-2"> <FormControl> <RadioGroupItem value="Yes" /> </FormControl> <FormLabel className="font-normal">Yes</FormLabel> </FormItem> <FormItem className="flex items-center space-x-2"> <FormControl> <RadioGroupItem value="No" /> </FormControl> <FormLabel className="font-normal">No</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="hasOtherBusinesses" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"> <div className="space-y-0.5"> <FormLabel className="text-base">Do you have other businesses?</FormLabel> </div> <FormControl> <Switch checked={field.value} onCheckedChange={field.onChange} /> </FormControl> </FormItem> )}/>
                {hasOtherBusinesses && (
                    <FormField control={form.control} name="otherBusinessesDetails" render={({ field }) => ( <FormItem> <FormLabel>Details of other businesses</FormLabel> <FormControl> <Textarea placeholder="Please describe your other business ventures..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Create Lead</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
