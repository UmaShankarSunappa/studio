
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle, Loader2 } from "lucide-react";

import type { Lead, UserState, Campaign, InterestType } from "@/types";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useLeads } from "@/hooks/use-leads";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FranchiseFlowLogo } from "@/components/icons";

const states: UserState[] = ["Telangana", "Tamil Nadu"];
const interestTypes: { value: InterestType, label: string }[] = [
    { value: 'Franchisee', label: 'Interested in Franchisee' },
    { value: 'Convert', label: 'Converting existing medical shop' },
    { value: 'Job', label: 'Looking for a Job' },
    { value: 'Rent', label: 'Renting a shop' },
];

const leadCaptureSchema = z.object({
  name: z.string().min(1, "Name cannot be blank."),
  phone: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  city: z.string().min(1, "City cannot be blank."),
  state: z.enum(["Telangana", "Tamil Nadu"]),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),
  interestType: z.enum(["Franchisee", "Convert", "Job", "Rent"], {
    required_error: "You must select an interest type.",
  }),
});

type LeadCaptureFormValues = z.infer<typeof leadCaptureSchema>;

export default function LeadCapturePage({ params }: { params: { slug: string } }) {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { setLeads } = useLeads();
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const form = useForm<LeadCaptureFormValues>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      pincode: "",
    },
  });

  React.useEffect(() => {
    if (!campaignsLoading) {
      const currentCampaign = campaigns.find(c => c.slug === params.slug);
      if (currentCampaign) {
        setCampaign(currentCampaign);
      } else {
        setNotFound(true);
      }
    }
  }, [params.slug, campaigns, campaignsLoading]);

  const onSubmit = (data: LeadCaptureFormValues) => {
    if (!campaign) return;

    const now = new Date();
    const newLead: Omit<Lead, 'id'> = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      interestType: data.interestType,
      source: campaign.name,
      status: "New",
      dateAdded: now,
      statusHistory: [{ status: "New", date: now }],
      interactions: [{ type: "Campaign Form Submission", date: now, notes: `Lead from campaign: ${campaign.name}` }],
      notes: [],
    };
    
    const leadWithId: Lead = {
      id: uuidv4(),
      ...newLead,
    }


    setLeads(prevLeads => [leadWithId, ...prevLeads]);
    setIsSubmitted(true);
  };

  if (campaignsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40 text-center">
        <div>
          <h1 className="text-4xl font-bold">Campaign Not Found</h1>
          <p className="text-muted-foreground">The link you followed may be broken or the campaign may have been removed.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                     <CardTitle className="text-2xl font-headline mt-4">Thank You!</CardTitle>
                    <CardDescription>
                        Your interest has been registered successfully. Our team will contact you shortly.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <FranchiseFlowLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">
            Franchise Inquiry
          </CardTitle>
          <CardDescription>
            {campaign?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit mobile number" {...field} />
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
                        <FormLabel>Email Address <span className="text-muted-foreground">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your city" {...field} />
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
                <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your 6-digit pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
               <FormField
                  control={form.control}
                  name="interestType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What are you interested in?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {interestTypes.map(type => (
                             <FormItem key={type.value} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={type.value} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
