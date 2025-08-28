"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Funnel, FunnelChart, LabelList, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { leads, users } from "@/lib/data";
import { LeadSource, LeadStatus } from "@/types";
import { countBy, toPairs, sortBy, take } from 'lodash';
import { Badge } from "@/components/ui/badge";

// Source Performance Data
const sourcePerformanceData = toPairs(countBy(leads, 'source')).map(([name, value]) => ({
  name: name as LeadSource,
  leads: value,
  converted: leads.filter(l => l.source === name && l.status === 'Converted').length
}));

const sourceChartConfig: ChartConfig = {
  leads: { label: "Leads", color: "hsl(var(--primary))" },
  converted: { label: "Converted", color: "hsl(var(--accent))" },
};

// Funnel Analysis Data
const funnelStages: LeadStatus[] = ["New", "Form 2 - Submitted", "Follow up", "Converted"];
const funnelData = funnelStages.map(stage => ({
    name: stage,
    value: leads.filter(l => funnelStages.slice(funnelStages.indexOf(stage)).includes(l.status)).length,
    fill: `hsl(var(--chart-${funnelStages.indexOf(stage) + 1}))`
}));

// Geographic Distribution Data
const geoData = sortBy(toPairs(countBy(leads, 'state')), ([, count]) => -count).map(([name, leads]) => ({ name, leads }));


// Team Performance Data
const teamPerformanceData = users.map(user => {
    const assignedLeads = leads.filter(l => l.assignedUser?.id === user.id);
    const convertedLeads = assignedLeads.filter(l => l.status === 'Converted').length;
    return {
        user,
        leadsClaimed: assignedLeads.length,
        conversionRate: assignedLeads.length > 0 ? (convertedLeads / assignedLeads.length) * 100 : 0,
    }
});


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Insights into your franchise lead pipeline performance.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle>Total Leads</CardTitle>
                <CardDescription>All leads in the system</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{leads.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Converted Leads</CardTitle>
                <CardDescription>Successfully converted leads</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{leads.filter(l => l.status === 'Converted').length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
                <CardDescription>Overall lead conversion</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1)}%</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Unassigned Leads</CardTitle>
                <CardDescription>Leads needing attention</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{leads.filter(l => !l.assignedUser).length}</p>
            </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Source Performance Analysis</CardTitle>
            <CardDescription>Number of leads and conversions per source.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sourceChartConfig} className="h-64">
              <BarChart data={sourcePerformanceData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={4} />
                <Bar dataKey="converted" fill="var(--color-converted)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Funnel Conversion Analysis</CardTitle>
            <CardDescription>The lead journey from new to converted.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-64">
                <FunnelChart width={400} height={250} data={funnelData}>
                  <RechartsTooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
                  </Funnel>
                </FunnelChart>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Top states by lead concentration.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {take(geoData, 5).map(item => (
                        <div key={item.name} className="flex items-center justify-between">
                            <span>{item.name}</span>
                            <Badge variant="secondary">{item.leads} leads</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Key metrics per franchisee user.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Leads Claimed</TableHead>
                            <TableHead>Conversion Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teamPerformanceData.map(item => (
                            <TableRow key={item.user.id}>
                                <TableCell className="font-medium">{item.user.name}</TableCell>
                                <TableCell>{item.leadsClaimed}</TableCell>
                                <TableCell>{item.conversionRate.toFixed(1)}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
