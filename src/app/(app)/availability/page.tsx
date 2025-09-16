
"use client";

import * as React from "react";
import { format, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAvailability } from "@/hooks/use-availability";
import { useUsers } from "@/hooks/use-users";
import type { Availability, AvailabilityStatus, DailyAvailability, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const availabilityOptions: { value: AvailabilityStatus; label: string }[] = [
  { value: "Not Set", label: "Not Set" },
  { value: "Calling", label: "Calling" },
  { value: "Field Work", label: "Field Work" },
  { value: "Not Available", label: "Not Available" },
  { value: "Leave", label: "Leave" },
];

const dayOptions: { value: "Full Day" | "First Half" | "Second Half"; label: string }[] = [
    { value: "Full Day", label: "Full Day" },
    { value: "First Half", label: "First Half" },
    { value: "Second Half", label: "Second Half" },
];

export default function AvailabilityPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const { availability, setAvailability, loading: availabilityLoading } = useAvailability();

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedEvaluatorId, setSelectedEvaluatorId] = React.useState<string | undefined>();
  const [dayPart, setDayPart] = React.useState<"Full Day" | "First Half" | "Second Half">("Full Day");
  const [status, setStatus] = React.useState<AvailabilityStatus>("Not Set");

  React.useEffect(() => {
    if (currentUser?.role === 'Evaluator') {
      setSelectedEvaluatorId(currentUser.id);
    } else if (currentUser?.role === 'Manager') {
        const firstEvaluator = users.find(u => u.role === 'Evaluator' && u.state === currentUser.state);
        setSelectedEvaluatorId(firstEvaluator?.id);
    }
  }, [currentUser, users]);

  const evaluators = React.useMemo(() => {
    if (currentUser?.role === 'Admin') return users.filter(u => u.role === 'Evaluator');
    if (currentUser?.role === 'Manager') return users.filter(u => u.role === 'Evaluator' && u.state === currentUser.state);
    return [];
  }, [currentUser, users]);

  const currentAvailability = React.useMemo(() => {
    if (!selectedDate || !selectedEvaluatorId) return null;
    const dateKey = format(startOfDay(selectedDate), "yyyy-MM-dd");
    return availability[selectedEvaluatorId]?.[dateKey];
  }, [availability, selectedDate, selectedEvaluatorId]);

  const handleUpdateAvailability = () => {
    if (!selectedDate || !selectedEvaluatorId) return;
    const dateKey = format(startOfDay(selectedDate), "yyyy-MM-dd");

    setAvailability(prev => {
      const newAvailability = { ...prev };
      if (!newAvailability[selectedEvaluatorId]) {
        newAvailability[selectedEvaluatorId] = {};
      }
      
      const newDailyAvailability: DailyAvailability = newAvailability[selectedEvaluatorId][dateKey] 
        ? { ...newAvailability[selectedEvaluatorId][dateKey] }
        : { firstHalf: "Not Set", secondHalf: "Not Set" };

      if (dayPart === "Full Day") {
          newDailyAvailability.firstHalf = status;
          newDailyAvailability.secondHalf = status;
      } else if (dayPart === "First Half") {
          newDailyAvailability.firstHalf = status;
      } else {
          newDailyAvailability.secondHalf = status;
      }

      newAvailability[selectedEvaluatorId][dateKey] = newDailyAvailability;
      return newAvailability;
    });
  };

  const getDayAvailabilityStatus = (user: User, date: Date): DailyAvailability => {
      const dateKey = format(startOfDay(date), "yyyy-MM-dd");
      return availability[user.id]?.[dateKey] || { firstHalf: 'Not Set', secondHalf: 'Not Set' };
  }

  const loading = authLoading || usersLoading || availabilityLoading;
  if (loading || !currentUser) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          {currentUser.role === 'Evaluator' ? 'My Availability' : 'Team Availability'}
        </h1>
        <p className="text-muted-foreground">
          {currentUser.role === 'Evaluator' ? 'Mark your availability for leads to book appointments.' : 'View and manage your team\'s schedule.'}
        </p>
      </header>

      {currentUser.role !== 'Evaluator' && (
        <Card>
            <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>View availability for a specific date.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border self-start"
                 />
                 <div className="flex-1">
                     <div className="space-y-4">
                        {evaluators.map(ev => {
                            const dailyStatus = getDayAvailabilityStatus(ev, selectedDate || new Date());
                            return (
                                <div key={ev.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <p className="font-medium">{ev.name}</p>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">First Half</p>
                                            <Badge variant={dailyStatus.firstHalf === 'Calling' || dailyStatus.firstHalf === 'Field Work' ? 'default' : 'secondary'}>{dailyStatus.firstHalf}</Badge>
                                        </div>
                                         <div>
                                            <p className="text-xs text-muted-foreground">Second Half</p>
                                            <Badge variant={dailyStatus.secondHalf === 'Calling' || dailyStatus.secondHalf === 'Field Work' ? 'default' : 'secondary'}>{dailyStatus.secondHalf}</Badge>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                     </div>
                 </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage Schedule</CardTitle>
           <CardDescription>
            {currentUser.role === 'Evaluator' ? 'Select a date and mark your status.' : 'Select an evaluator and a date to update their schedule.'}
           </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <div className="md:col-span-2 space-y-6">
             {currentUser.role !== 'Evaluator' && (
                <div className="space-y-2">
                    <Label>Select Evaluator</Label>
                    <Select value={selectedEvaluatorId} onValueChange={setSelectedEvaluatorId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an evaluator..." />
                        </SelectTrigger>
                        <SelectContent>
                            {evaluators.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
             )}
            <div className="p-4 border rounded-lg space-y-4">
                <p className="font-medium">
                    Update for: {selectedDate ? format(selectedDate, "PPP") : "No date selected"}
                </p>
                {currentAvailability && (
                    <div className="flex items-center gap-6 text-sm">
                        <p>Current Status:</p>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">First Half:</span>
                            <Badge variant={currentAvailability.firstHalf === 'Calling' || currentAvailability.firstHalf === 'Field Work' ? 'default' : 'secondary'}>
                                {currentAvailability.firstHalf}
                            </Badge>
                        </div>
                         <div className="flex items-center gap-2">
                            <span className="font-semibold">Second Half:</span>
                             <Badge variant={currentAvailability.secondHalf === 'Calling' || currentAvailability.secondHalf === 'Field Work' ? 'default' : 'secondary'}>
                                {currentAvailability.secondHalf}
                            </Badge>
                        </div>
                    </div>
                )}
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Select Part of Day</Label>
                        <Select value={dayPart} onValueChange={(v: any) => setDayPart(v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {dayOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Set Status</Label>
                        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {availabilityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>

                <Button onClick={handleUpdateAvailability} disabled={!selectedDate || !selectedEvaluatorId}>
                  Update Availability
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
