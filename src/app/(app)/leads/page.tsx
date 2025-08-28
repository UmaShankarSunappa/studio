"use client";

import * as React from "react";
import {
  Search,
  Newspaper,
  Youtube,
  Users,
  Globe,
  User,
  Share2,
} from "lucide-react";
import { format } from "date-fns";

import type { Lead, LeadSource, LeadStatus } from "@/types";
import { leads as allLeads, currentUser } from "@/lib/data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LeadDetailSheet } from './LeadDetailSheet';

const statusColors: Record<LeadStatus, string> = {
  "New": "bg-blue-100 text-blue-800",
  "WhatsApp - Sent": "bg-green-100 text-green-800",
  "WhatsApp - Delivery Failed": "bg-yellow-100 text-yellow-800",
  "Form 2 - Pending": "bg-purple-100 text-purple-800",
  "Form 2 - Submitted": "bg-indigo-100 text-indigo-800",
  "Form 2 - No Response": "bg-orange-100 text-orange-800",
  "Follow up": "bg-teal-100 text-teal-800",
  "Converted": "bg-emerald-100 text-emerald-800",
  "Not Interested": "bg-gray-100 text-gray-800",
};

const sourceIcons: Record<LeadSource, React.ElementType> = {
  Newspaper: Newspaper,
  YouTube: Youtube,
  "Field Marketing": Users,
  Website: Globe,
  Referral: Share2,
};

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>(allLeads);
  const { toast } = useToast();
  const [filters, setFilters] = React.useState({
    search: "",
    source: "all",
    status: "all",
  });
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleAssign = (leadId: string) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, assignedUser: currentUser } : lead
      )
    );
    toast({
      title: "Lead Assigned!",
      description: "You have successfully assigned the lead to yourself.",
    });
  };

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSheetOpen(true);
  };
  
  const handleAddNote = (leadId: string, noteText: string) => {
    const newNote = {
      text: noteText,
      date: new Date(),
      user: currentUser
    };
    setLeads(prevLeads => prevLeads.map(lead => 
      lead.id === leadId 
        ? { ...lead, notes: [...lead.notes, newNote] } 
        : lead
    ));
    setSelectedLead(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
  };

  const handleUpdateStatus = (leadId: string, status: LeadStatus, remarks?: string) => {
    const newStatusHistoryEntry = { status, date: new Date() };
    
    setLeads(prevLeads => prevLeads.map(lead => {
        if (lead.id === leadId) {
            const updatedLead = { 
              ...lead, 
              status,
              statusHistory: [...lead.statusHistory, newStatusHistoryEntry]
            };
            if (remarks) {
                const newNote = {
                    text: `Status changed to "Not Interested". Remarks: ${remarks}`,
                    date: new Date(),
                    user: currentUser
                };
                updatedLead.notes = [...updatedLead.notes, newNote];
            }
            return updatedLead;
        }
        return lead;
    }));

    setSelectedLead(prev => {
        if (!prev) return null;
        const updatedLead = {
            ...prev,
            status,
            statusHistory: [...prev.statusHistory, newStatusHistoryEntry]
        };
        if (remarks) {
             const newNote = {
                text: `Status changed to "Not Interested". Remarks: ${remarks}`,
                date: new Date(),
                user: currentUser
            };
            updatedLead.notes = [...updatedLead.notes, newNote];
        }
        return updatedLead;
    });

    toast({
        title: "Status Updated",
        description: `Lead status has been updated to "${status}".`
    });
  };

  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(searchLower) ||
        lead.city.toLowerCase().includes(searchLower);
      const matchesSource =
        filters.source === "all" || lead.source === filters.source;
      const matchesStatus =
        filters.status === "all" || lead.status === filters.status;
      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [leads, filters]);

  return (
    <>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Centralized Lead Management
          </h1>
          <p className="text-muted-foreground">
            View, filter, and manage all incoming leads in one place.
          </p>
        </header>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or city..."
                    className="pl-9 w-full md:w-64"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {Object.keys(sourceIcons).map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                     {Object.keys(statusColors).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="p-4 font-medium">Lead Name</th>
                    <th className="p-4 font-medium">City</th>
                    <th className="p-4 font-medium">Source</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date Added</th>
                    <th className="p-4 font-medium text-center">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => {
                    const SourceIcon = sourceIcons[lead.source];
                    const canBeAssigned = lead.status !== 'New' && lead.status !== 'WhatsApp - Sent' && !lead.assignedUser;

                    return (
                      <tr 
                        key={lead.id} 
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleRowClick(lead)}
                      >
                        <td className="p-4 font-medium">{lead.name}</td>
                        <td className="p-4 text-muted-foreground">{lead.city}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <SourceIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.source}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${statusColors[lead.status]} hover:${statusColors[lead.status]}`}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {format(lead.dateAdded, "MMM d, yyyy")}
                        </td>
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {lead.assignedUser ? (
                            <div className="flex items-center justify-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{lead.assignedUser.id === currentUser.id ? 'You' : lead.assignedUser.name}</span>
                            </div>
                          ) : canBeAssigned ? (
                            <Button size="sm" onClick={() => handleAssign(lead.id)}>
                              Assign to Me
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
              {filteredLeads.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                      <p>No leads found matching your criteria.</p>
                  </div>
              )}
          </CardContent>
        </Card>
      </div>
      <LeadDetailSheet 
        lead={selectedLead} 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        onAddNote={handleAddNote}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}
