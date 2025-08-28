
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

const leadSources: LeadSource[] = ["Newspaper", "YouTube", "Field Marketing", "Website", "Referral"];
const states: UserState[] = ["Telangana", "Tamil Nadu"];
const educationLevels = ["Bachelor's Degree", "Master's Degree", "High School Diploma", "PhD", "MBA", "Other"];
const businessExperience = ["0-2 years", "2-5 years", "5-10 years", "10+ years", "No experience"];

const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  city: z.string().min(2, "City is required."),
  state: z.enum(["Telangana", "Tamil Nadu"]),
  source: z.enum(["Newspaper", "YouTube", "Field Marketing", "Website", "Referral"]),
  education: z.string().min(1, "Education level is required."),
  previousExperience: z.string().min(1, "Business experience is required."),
  investmentCapacity: z.coerce.number().min(1, "Investment capacity must be a positive number."),
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
      investmentCapacity: 0,
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    onCreateLead(data);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter lead's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit mobile number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Lead Source</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a source" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {leadSources.map(source => (
                                    <SelectItem key={source} value={source}>{source}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {states.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Education Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {educationLevels.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="previousExperience"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Business Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select experience level" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {businessExperience.map(exp => (
                                    <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="investmentCapacity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Investment Capacity ($)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
