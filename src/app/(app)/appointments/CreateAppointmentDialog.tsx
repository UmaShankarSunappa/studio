
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, set, startOfDay, addMinutes, isBefore, getDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Lead, Appointment, DailyAvailability } from "@/types";
import { useAppointments } from "@/hooks/use-appointments";
import { useAvailability } from "@/hooks/use-availability";

type DayHalf = "First Half" | "Second Half";

const appointmentFormSchema = z.object({
  leadId: z.string({ required_error: "Please select a lead." }),
  date: z.date({ required_error: "Please select a date." }),
  dayHalf: z.enum(["First Half", "Second Half"], { required_error: "Please select a part of the day."}),
  slot: z.date({ required_error: "Please select a time slot." }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface CreateAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAppointment: (values: { leadId: string; slot: Date; notes: string }) => void;
  leads: Lead[];
  evaluatorId: string;
}

export function CreateAppointmentDialog({ isOpen, onOpenChange, onCreateAppointment, leads, evaluatorId }: CreateAppointmentDialogProps) {
  const { appointments } = useAppointments();
  const { availability } = useAvailability();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  const selectedDate = form.watch("date");
  const selectedHalf = form.watch("dayHalf");

  const generateTimeSlots = React.useCallback(() => {
    if (!selectedDate || !selectedHalf) return [];
    
    const dateKey = format(startOfDay(selectedDate), "yyyy-MM-dd");
    const dayAvailability: DailyAvailability = availability[evaluatorId]?.[dateKey] || { firstHalf: "Not Set", secondHalf: "Not Set" };
    
    const slots: Date[] = [];
    const now = new Date();
    
    const isAvailableInHalf = (half: "firstHalf" | "secondHalf") => 
        dayAvailability[half] === 'Calling' || dayAvailability[half] === 'Field Work';

    // First Half: 10:00 AM - 1:00 PM
    if (selectedHalf === "First Half" && isAvailableInHalf("firstHalf")) {
        let currentTime = set(selectedDate, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });
        const endTime = set(selectedDate, { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 });
        while (isBefore(currentTime, endTime)) {
            if (isBefore(now, currentTime)) {
                slots.push(currentTime);
            }
            currentTime = addMinutes(currentTime, 20);
        }
    }

    // Second Half: 2:30 PM - 6:30 PM
    if (selectedHalf === "Second Half" && isAvailableInHalf("secondHalf")) {
        let currentTime = set(selectedDate, { hours: 14, minutes: 30, seconds: 0, milliseconds: 0 });
        const endTime = set(selectedDate, { hours: 18, minutes: 30, seconds: 0, milliseconds: 0 });
        while (isBefore(currentTime, endTime)) {
            if (isBefore(now, currentTime)) {
                slots.push(currentTime);
            }
            currentTime = addMinutes(currentTime, 20);
        }
    }
    
    const bookedSlots = appointments
        .filter(app => format(startOfDay(new Date(app.date)), "yyyy-MM-dd") === dateKey)
        .map(app => new Date(app.date).getTime());

    return slots.filter(slot => !bookedSlots.includes(slot.getTime()));
  }, [selectedDate, selectedHalf, appointments, availability, evaluatorId]);
  
  const timeSlots = generateTimeSlots();
  
  const dayHalves: { value: DayHalf; label: string; disabled: boolean }[] = React.useMemo(() => {
    if (!selectedDate) return [
        { value: "First Half", label: "First Half (10:00 AM - 1:00 PM)", disabled: true },
        { value: "Second Half", label: "Second Half (2:30 PM - 6:30 PM)", disabled: true }
    ];
    
    const dateKey = format(startOfDay(selectedDate), "yyyy-MM-dd");
    const dayAvailability = availability[evaluatorId]?.[dateKey];
    
    const isAvailable = (half: "firstHalf" | "secondHalf") => dayAvailability && (dayAvailability[half] === 'Calling' || dayAvailability[half] === 'Field Work');

    return [
      { value: "First Half", label: "First Half (10:00 AM - 1:00 PM)", disabled: !isAvailable("firstHalf") },
      { value: "Second Half", label: "Second Half (2:30 PM - 6:30 PM)", disabled: !isAvailable("secondHalf") }
    ];
  }, [selectedDate, availability, evaluatorId]);


  const onSubmit = (data: AppointmentFormValues) => {
    onCreateAppointment({
      leadId: data.leadId,
      slot: data.slot,
      notes: data.notes || "",
    });
    form.reset();
    onOpenChange(false);
  };
  
  const isDateDisabled = (date: Date) => {
      const dateKey = format(startOfDay(date), "yyyy-MM-dd");
      const dayAvailability = availability[evaluatorId]?.[dateKey];
      // Disable past dates and Sundays
      return isBefore(date, startOfDay(new Date())) || getDay(date) === 0 || !dayAvailability || (dayAvailability.firstHalf === 'Not Set' && dayAvailability.secondHalf === 'Not Set');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a New Slot</DialogTitle>
          <DialogDescription>Select a lead, date, and available time slot to create a new appointment.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Lead</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a lead to assign..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leads.length > 0 ? (
                        leads.map(lead => <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>)
                      ) : (
                        <SelectItem value="no-leads" disabled>No pending leads</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                              field.onChange(date);
                              form.resetField("slot");
                              form.resetField("dayHalf");
                          }}
                          disabled={isDateDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="dayHalf"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part of Day</FormLabel>
                    <Select
                      onValueChange={(value) => {
                          field.onChange(value)
                          form.resetField("slot");
                      }}
                      value={field.value}
                      disabled={!selectedDate}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a half" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dayHalves.map(half => (
                             <SelectItem key={half.value} value={half.value} disabled={half.disabled}>
                                {half.label}
                            </SelectItem>
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
              name="slot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(new Date(value))}
                    value={field.value?.toISOString()}
                    disabled={!selectedDate || !selectedHalf || timeSlots.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an available slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.length > 0 ? (
                        timeSlots.map((slot, i) => (
                            <SelectItem key={i} value={slot.toISOString()}>
                                {format(slot, "h:mm a")}
                            </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled>
                          No slots available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any notes for the appointment..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
