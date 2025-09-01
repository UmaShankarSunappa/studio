
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import type { Lead, CallStatus } from "@/types";
import { Label } from "@/components/ui/label";

const callStatuses: CallStatus[] = ["Connected", "Busy", "Switched Off", "Phone Not Connected"];

interface CallDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEndCall: (leadId: string, duration: number, status: CallStatus) => void;
}

export function CallDialog({ lead, isOpen, onOpenChange, onEndCall }: CallDialogProps) {
  const [callDuration, setCallDuration] = React.useState(0);
  const [callStatus, setCallStatus] = React.useState<CallStatus | null>(null);
  const [isCallActive, setIsCallActive] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isOpen && lead) {
      setIsCallActive(true);
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
      setCallStatus(null);
      setIsCallActive(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, lead]);

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsCallActive(false);
  };

  const handleConfirmStatus = () => {
    if (lead && callStatus) {
      onEndCall(lead.id, callDuration, callStatus);
      onOpenChange(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {isCallActive ? `Calling ${lead.name}...` : `Call Ended`}
          </DialogTitle>
           <DialogDescription>
            {isCallActive ? `Phone: ${lead.phone}` : 'Select the call outcome below.'}
          </DialogDescription>
        </DialogHeader>
        
        {isCallActive ? (
          <div className="flex flex-col items-center justify-center space-y-4 my-8">
            <p className="text-4xl font-mono">{formatTime(callDuration)}</p>
            <Button variant="destructive" onClick={handleEndCall} size="lg" className="rounded-full">
              <PhoneOff className="mr-2 h-5 w-5" /> End Call
            </Button>
          </div>
        ) : (
          <div className="space-y-4 my-4">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Call Duration</p>
                <p className="text-2xl font-bold">{formatTime(callDuration)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="call-status">Call Outcome</Label>
              <Select onValueChange={(value: CallStatus) => setCallStatus(value)}>
                <SelectTrigger id="call-status">
                  <SelectValue placeholder="Select call status" />
                </SelectTrigger>
                <SelectContent>
                  {callStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {!isCallActive && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmStatus} disabled={!callStatus}>
              Confirm & Log Call
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

