"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FranchiseFlowLogo } from "@/components/icons";
import { User } from "@/types";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { users: allUsers, loading: usersLoading } = useUsers();
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const handleLogin = () => {
    if (!selectedUserId) {
      setError("Please select a user to log in.");
      return;
    }
    const userToLogin = allUsers.find((user) => user.id === selectedUserId);
    if (userToLogin) {
      login(userToLogin as User);
      router.push("/leads");
    } else {
      setError("Selected user not found.");
    }
  };

  if (usersLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <FranchiseFlowLogo className="h-12 w-12 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Select a user profile to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role} - {user.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
