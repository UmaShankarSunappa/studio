
"use client";

import * as React from "react";
import { PlusCircle, MoreHorizontal, Copy, Link as LinkIcon, Users, Loader2, QrCode, Download } from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { toPng } from 'html-to-image';

import { useAuth } from "@/hooks/use-auth";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useToast } from "@/hooks/use-toast";
import type { Campaign, UserState } from "@/types";
import { useLeads } from "@/hooks/use-leads";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateCampaignDialog } from "./CreateCampaignDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CampaignFormValues = {
  name: string;
  state: "Telangana" | "Tamil Nadu";
  period?: { from: Date; to: Date };
}

export default function CampaignsPage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { campaigns, setCampaigns, loading: campaignsLoading } = useCampaigns();
  const { leads } = useLeads();
  const { toast } = useToast();
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = React.useState(false);
  const [qrCodeToView, setQrCodeToView] = React.useState<Campaign | null>(null);

  const qrCodeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!authLoading && currentUser?.role !== 'Admin' && currentUser?.role !== 'Marketing') {
      router.push('/leads');
    }
  }, [currentUser, authLoading, router]);

  const campaignsWithLeadCounts = React.useMemo(() => {
    return campaigns.map(campaign => ({
      ...campaign,
      leadCount: leads.filter(lead => lead.source === campaign.name).length
    }));
  }, [campaigns, leads]);

  const handleCreateCampaign = (values: CampaignFormValues) => {
    const slug = values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (campaigns.some(c => c.slug === slug)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A campaign with a similar name already exists, resulting in a duplicate URL.",
      });
      return;
    }

    const newCampaign: Campaign = {
      id: uuidv4(),
      name: values.name,
      slug: slug,
      state: values.state,
      period: values.period,
      createdAt: new Date(),
      leadCount: 0,
    };
    setCampaigns(prev => [...prev, newCampaign]);
    toast({
      title: "Campaign Created!",
      description: `The campaign "${values.name}" has been successfully created.`,
    });
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied!",
      description: "The trackable campaign URL has been copied to your clipboard.",
    });
  };
  
  const downloadQrCode = React.useCallback(() => {
    if (qrCodeRef.current === null || !qrCodeToView) {
      return;
    }

    toPng(qrCodeRef.current, { cacheBust: true, })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${qrCodeToView.slug}-qrcode.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error(err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to download QR code.",
        });
      })
  }, [qrCodeToView, toast]);

  const loading = authLoading || campaignsLoading;

  if (loading || (currentUser?.role !== 'Admin' && currentUser?.role !== 'Marketing')) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              Campaign Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage marketing campaigns and trackable URLs.
            </p>
          </div>
          <Button onClick={() => setIsCreateCampaignOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>A list of all marketing campaigns.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignsWithLeadCounts.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                       <TableCell>{campaign.state}</TableCell>
                      <TableCell>
                        {campaign.period 
                            ? `${format(new Date(campaign.period.from), "dd/MM/yy")} - ${format(new Date(campaign.period.to), "dd/MM/yy")}`
                            : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                            <Users className="h-3 w-3" />
                            {campaign.leadCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(campaign.slug)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy URL
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setQrCodeToView(campaign)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              View QR Code
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             {campaignsWithLeadCounts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                      <p>No campaigns found. Create one to get started.</p>
                  </div>
              )}
          </CardContent>
        </Card>
      </div>
      <CreateCampaignDialog
        isOpen={isCreateCampaignOpen}
        onOpenChange={setIsCreateCampaignOpen}
        onCreateCampaign={handleCreateCampaign}
      />
      <Dialog open={!!qrCodeToView} onOpenChange={(isOpen) => !isOpen && setQrCodeToView(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Campaign QR Code</DialogTitle>
            </DialogHeader>
            {qrCodeToView && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <div ref={qrCodeRef} className="p-4 bg-white">
                         <QRCode value={`${window.location.origin}/c/${qrCodeToView.slug}`} />
                    </div>
                    <Button onClick={downloadQrCode}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PNG
                    </Button>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
