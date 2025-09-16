
"use client";

import * as React from "react";
import { format, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAppointments } from "@/hooks/use-appointments";
import { useLeads } from "@/hooks/use-leads";
import { Loader2, PlusCircle, Clock, User as UserIcon, Trash2 } from "lucide-react";
import { CreateAppointmentDialog } from "./CreateAppointmentDialog";
import type { Appointment } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AppointmentsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { appointments, setAppointments, loading: appointmentsLoading } = useAppointments();
  const { leads, loading: leadsLoading } = useLeads();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = React.useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = React.useState<Appointment | null>(null);


  React.useEffect(() => {
    if (!authLoading && currentUser?.role !== 'Evaluator') {
      router.push('/leads');
    }
  }, [currentUser, authLoading, router]);

  const myLeads = React.useMemo(() => {
    if (!currentUser) return [];
    return leads.filter(l => l.assignedUser?.id === currentUser.id && l.status === "Form-2 Submitted");
  }, [leads, currentUser]);

  const handleCreateAppointment = (values: { leadId: string; slot: Date; notes: string }) => {
    if (!currentUser) return;
    
    const newAppointment: Appointment = {
      id: uuidv4(),
      leadId: values.leadId,
      evaluatorId: currentUser.id,
      date: values.slot,
      duration: 20,
      status: 'Booked',
      notes: values.notes,
    };
    
    setAppointments(prev => [...prev, newAppointment].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    toast({
      title: "Appointment Booked!",
      description: "The slot has been successfully booked for the lead.",
    });
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    toast({
      title: "Appointment Deleted",
      description: "The appointment has been removed from the schedule.",
    });
    setAppointmentToDelete(null);
  };

  const todaysAppointments = React.useMemo(() => {
    if (!currentUser || !selectedDate) return [];
    const startOfSelectedDay = startOfDay(selectedDate);
    return appointments.filter(app => {
      return app.evaluatorId === currentUser.id && startOfDay(new Date(app.date)).getTime() === startOfSelectedDay.getTime();
    });
  }, [appointments, currentUser, selectedDate]);

  const firstHalfAppointments = todaysAppointments.filter(app => new Date(app.date).getHours() < 13);
  const secondHalfAppointments = todaysAppointments.filter(app => new Date(app.date).getHours() >= 13);
  
  const getLeadName = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.name || "Unknown Lead";
  }

  const loading = authLoading || appointmentsLoading || leadsLoading;
  
  if (loading || !currentUser || currentUser.role !== 'Evaluator') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              My Appointments
            </h1>
            <p className="text-muted-foreground">
              View your schedule and book new slots for your leads.
            </p>
          </div>
          <Button onClick={() => setIsCreateAppointmentOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Appointment
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                Schedule for {selectedDate ? format(selectedDate, "PPP") : "..."}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 border-b pb-2">First Half (10:00 AM - 1:00 PM)</h3>
                  <div className="space-y-3">
                    {firstHalfAppointments.length > 0 ? (
                      firstHalfAppointments.map(app => (
                        <div key={app.id} className="p-3 bg-secondary rounded-md flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{format(new Date(app.date), "h:mm a")}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><UserIcon className="w-3 h-3"/> {getLeadName(app.leadId)}</p>
                            </div>
                          </div>
                           <div className="flex items-center gap-2">
                             <p className="text-xs text-muted-foreground italic max-w-xs truncate">{app.notes}</p>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the appointment.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteAppointment(app.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                           </div>
                        </div>
                      ))
                    ) : <p className="text-sm text-muted-foreground">No appointments booked.</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2 border-b pb-2">Second Half (2:30 PM - 6:30 PM)</h3>
                   <div className="space-y-3">
                    {secondHalfAppointments.length > 0 ? (
                      secondHalfAppointments.map(app => (
                         <div key={app.id} className="p-3 bg-secondary rounded-md flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{format(new Date(app.date), "h:mm a")}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><UserIcon className="w-3 h-3"/> {getLeadName(app.leadId)}</p>
                            </div>
                          </div>
                           <div className="flex items-center gap-2">
                             <p className="text-xs text-muted-foreground italic max-w-xs truncate">{app.notes}</p>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the appointment.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteAppointment(app.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                           </div>
                        </div>
                      ))
                    ) : <p className="text-sm text-muted-foreground">No appointments booked.</p>}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <CreateAppointmentDialog
        isOpen={isCreateAppointmentOpen}
        onOpenChange={setIsCreateAppointmentOpen}
        onCreateAppointment={handleCreateAppointment}
        leads={myLeads}
        evaluatorId={currentUser.id}
      />
    </>
  );
}
