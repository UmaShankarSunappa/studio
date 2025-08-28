import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  History,
  MessageSquare,
  StickyNote,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Lead } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/data';

interface LeadDetailSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddNote: (leadId: string, noteText: string) => void;
}

export function LeadDetailSheet({
  lead,
  isOpen,
  onOpenChange,
  onAddNote,
}: LeadDetailSheetProps) {
  const [note, setNote] = React.useState('');

  const handleAddNote = () => {
    if (lead && note.trim()) {
      onAddNote(lead.id, note);
      setNote('');
    }
  };

  if (!lead) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle className="text-3xl font-headline">
                {lead.name}
              </SheetTitle>
              <SheetDescription>
                360-Degree Lead Profile
              </SheetDescription>
            </SheetHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Column 1: Details */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Demographic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {lead.city}, {lead.state}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      More details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Education</p>
                        <p className="text-muted-foreground">
                          {lead.education}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Business Experience</p>
                        <p className="text-muted-foreground">
                          {lead.previousExperience}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Investment Capacity</p>
                        <p className="text-muted-foreground">
                          ${lead.investmentCapacity.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Status History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {lead.statusHistory.map((history, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                            {index < lead.statusHistory.length - 1 && (
                              <div className="w-px h-10 bg-border" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{history.status}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(history.date, 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Column 2: Interactions & Notes */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Interaction Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lead.interactions.map((interaction, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{interaction.type}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(interaction.date, 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className="text-muted-foreground bg-secondary p-2 rounded-md">
                          {interaction.notes}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <StickyNote className="w-5 h-5" />
                      Follow-up Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {lead.notes.map((note, index) => (
                         <div key={index} className="text-sm bg-secondary p-3 rounded-md">
                           <p className="font-medium">{note.user.name}</p>
                           <p className="text-xs text-muted-foreground mb-1">
                             {format(note.date, 'MMM d, yyyy h:mm a')}
                           </p>
                           <p className="text-muted-foreground">{note.text}</p>
                         </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a new note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button onClick={handleAddNote} className="w-full">
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
