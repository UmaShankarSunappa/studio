
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
  ChevronDown,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

import type { Lead, LeadSource, LeadStatus, User as UserType } from "@/types";
import { leadStatuses } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { useLeads } from "@/hooks/use-leads";
import { useUsers } from "@/hooks/use-users";
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
import { CreateLeadDialog } from './CreateLeadDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";

const statusColors: Record<LeadStatus, string> = {
  "New": "bg-blue-100 text-blue-800",
  "WhatsApp - Sent": "bg-green-100 text-green-800",
  "WhatsApp - Delivery Failed": "bg-yellow-100 text-yellow-800",
  "Form 2 - Pending": "bg-purple-100 text-purple-800",
  "Form 2 - Submitted": "bg-indigo-100 text-indigo-800",
  "Form 2 - No Response": "bg-orange-100 text-orange-800",
  "In Discussion": "bg-sky-100 text-sky-800",
  "Follow-up Required": "bg-teal-100 text-teal-800",
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
  const { user } = useAuth();
  const { leads, setLeads, loading: leadsLoading } = useLeads();
  const { users: allUsers, loading: usersLoading } = useUsers();
  const { toast } = useToast();
  const [filters, setFilters] = React.useState<{
    search: string;
    source: string;
    status: LeadStatus[];
  }>({
    search: "",
    source: "all",
    status: [],
  });
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<string[]>([]);

  const currentUser = user!;

  const handleAssign = (leadId: string, userToAssign: UserType) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, assignedUser: userToAssign } : lead
      )
    );
    toast({
      title: "Lead Assigned!",
      description: `Lead has been successfully assigned to ${userToAssign.name}.`,
    });
  };

  const handleBulkAssign = (userToAssign: UserType) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        selectedLeadIds.includes(lead.id)
          ? { ...lead, assignedUser: userToAssign }
          : lead
      )
    );
    toast({
      title: "Leads Assigned!",
      description: `${selectedLeadIds.length} leads have been assigned to ${userToAssign.name}.`,
    });
    setSelectedLeadIds([]);
  };
  
  const handleCreateLead = (newLeadData: Omit<Lead, 'id' | 'dateAdded' | 'status' | 'statusHistory' | 'interactions' | 'notes' | 'assignedUser'>) => {
    const now = new Date();
    const newLead: Lead = {
        ...newLeadData,
        id: uuidv4(),
        dateAdded: now,
        status: "New",
        statusHistory: [{ status: "New", date: now }],
        interactions: [{ type: "Manual Entry", date: now, notes: "Lead created manually." }],
        notes: [],
    };
    setLeads(prevLeads => [newLead, ...prevLeads]);
    toast({
        title: "Lead Created!",
        description: `${newLead.name} has been successfully added to the system.`
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
  
   const handleUpdateLead = (leadId: string, data: Partial<Omit<Lead, 'id'>>) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId ? { ...lead, ...data } : lead
    );
    setLeads(updatedLeads);
    setSelectedLead(prev => prev ? { ...prev, ...data } : null);
    toast({
        title: "Lead Updated",
        description: "The lead's details have been successfully updated."
    });
  };

  const filteredLeads = React.useMemo(() => {
    if (!currentUser) return [];
    return leads.filter((lead) => {
      // Role-based filtering
      if (currentUser.role === 'Manager') {
        if (lead.state !== currentUser.state) return false;
      } else if (currentUser.role === 'Evaluator') {
        if (lead.state === currentUser.state) {
            if (lead.assignedUser && lead.assignedUser.id !== currentUser.id) {
                return false; // Hide leads assigned to others in the same state
            }
        } else {
            return false; // Hide leads from other states
        }
      }
      // Admin sees everything, so no extra filter needed.

      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(searchLower) ||
        lead.city.toLowerCase().includes(searchLower);
      const matchesSource =
        filters.source === "all" || lead.source === filters.source;
      const matchesStatus =
        filters.status.length === 0 || filters.status.includes(lead.status);
      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [leads, filters, currentUser]);

  const evaluators = React.useMemo(() => allUsers.filter(u => u.role === 'Evaluator'), [allUsers]);

  const getAssignableEvaluators = (lead?: Lead) => {
    if (currentUser.role === 'Admin') {
      if (lead) {
        return evaluators.filter(e => e.state === lead.state);
      }
      return evaluators;
    }
    if (currentUser.role === 'Manager') {
      return evaluators.filter(e => e.state === currentUser.state && (!lead || e.state === lead.state));
    }
    return [];
  };

  const statusOptions = leadStatuses.map(status => ({ value: status, label: status }));
  
  const assignableStatuses: LeadStatus[] = ['WhatsApp - Delivery Failed', 'Form 2 - Submitted', 'Form 2 - No Response', 'Form 2 - Pending'];
  const assignableLeads = filteredLeads.filter(lead => assignableStatuses.includes(lead.status) && !lead.assignedUser);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(assignableLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectOne = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(prev => [...prev, leadId]);
    } else {
      setSelectedLeadIds(prev => prev.filter(id => id !== leadId));
    }
  };


  if (leadsLoading || usersLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const showCheckboxes = currentUser.role === 'Admin' || currentUser.role === 'Manager';

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
              <div className="flex items-center gap-4">
                  <CardTitle className="text-xl">All Leads ({filteredLeads.length})</CardTitle>
                  {selectedLeadIds.length > 0 && showCheckboxes && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">
                          Bulk Assign ({selectedLeadIds.length}) <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {getAssignableEvaluators().length > 0 ? (
                            getAssignableEvaluators().map(evaluator => (
                                <DropdownMenuItem key={evaluator.id} onClick={() => handleBulkAssign(evaluator)}>
                                {evaluator.name} ({evaluator.state})
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem disabled>No evaluators available</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
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
                <MultiSelect
                    className="w-full md:w-48"
                    options={statusOptions}
                    selected={filters.status}
                    onChange={(selected) => setFilters(prev => ({ ...prev, status: selected as LeadStatus[] }))}
                    placeholder="Filter by status..."
                />
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Lead
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    {showCheckboxes && (
                      <th className="p-4 font-medium">
                        <Checkbox
                          checked={selectedLeadIds.length > 0 && selectedLeadIds.length === assignableLeads.length}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          disabled={assignableLeads.length === 0}
                        />
                      </th>
                    )}
                    <th className="p-4 font-medium">Lead Name</th>
                    <th className="p-4 font-medium">City</th>
                    <th className="p-4 font-medium">State</th>
                    <th className="p-4 font-medium">Source</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date Added</th>
                    <th className="p-4 font-medium text-center">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => {
                    const SourceIcon = sourceIcons[lead.source];
                    const canBeAssigned = assignableStatuses.includes(lead.status) && !lead.assignedUser;
                    
                    const assignableEvaluators = getAssignableEvaluators(lead);
                    
                    const isSelectable = showCheckboxes && canBeAssigned;

                    return (
                      <tr 
                        key={lead.id} 
                        className="border-b transition-colors hover:bg-muted/50 data-[selected=true]:bg-muted/50"
                        data-selected={selectedLeadIds.includes(lead.id)}
                      >
                         {showCheckboxes && (
                          <td className="p-4">
                            {isSelectable ? (
                               <Checkbox
                                checked={selectedLeadIds.includes(lead.id)}
                                onCheckedChange={(checked) => handleSelectOne(lead.id, !!checked)}
                                aria-label={`Select lead ${lead.name}`}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : null}
                          </td>
                        )}
                        <td className="p-4 font-medium cursor-pointer" onClick={() => handleRowClick(lead)}>{lead.name}</td>
                        <td className="p-4 text-muted-foreground cursor-pointer" onClick={() => handleRowClick(lead)}>{lead.city}</td>
                        <td className="p-4 text-muted-foreground cursor-pointer" onClick={() => handleRowClick(lead)}>{lead.state}</td>
                        <td className="p-4 cursor-pointer" onClick={() => handleRowClick(lead)}>
                          <div className="flex items-center gap-2">
                            <SourceIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.source}</span>
                          </div>
                        </td>
                        <td className="p-4 cursor-pointer" onClick={() => handleRowClick(lead)}>
                          <Badge className={`${statusColors[lead.status]} hover:${statusColors[lead.status]}`}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground cursor-pointer" onClick={() => handleRowClick(lead)}>
                          {format(lead.dateAdded, "MMM d, yyyy")}
                        </td>
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {lead.assignedUser ? (
                            <div className="flex items-center justify-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{lead.assignedUser.id === currentUser.id ? 'You' : lead.assignedUser.name}</span>
                            </div>
                          ) : canBeAssigned ? (
                            <>
                              {currentUser.role === 'Evaluator' && (
                                <Button size="sm" onClick={() => handleAssign(lead.id, currentUser)}>
                                  Assign to Me
                                </Button>
                              )}
                              {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      Assign to... <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    {assignableEvaluators.length > 0 ? (
                                      assignableEvaluators.map(evaluator => (
                                        <DropdownMenuItem key={evaluator.id} onClick={() => handleAssign(lead.id, evaluator)}>
                                          {evaluator.name}
                                        </DropdownMenuItem>
                                      ))
                                    ) : (
                                      <DropdownMenuItem disabled>No evaluators in {lead.state}</DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </>
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
        onUpdateLead={handleUpdateLead}
      />
       <CreateLeadDialog 
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateLead={handleCreateLead}
      />
    </>
  );
}
