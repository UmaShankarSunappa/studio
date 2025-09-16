
"use client";

import * as React from "react";
import {
  PlusCircle,
  MoreHorizontal,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole, UserState } from "@/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreateUserDialog } from "./CreateUserDialog";
import { EditUserDialog } from "./EditUserDialog";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { users, setUsers, loading: usersLoading } = useUsers();
  const { toast } = useToast();
  const [isCreateUserOpen, setIsCreateUserOpen] = React.useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    if (!authLoading && currentUser?.role !== 'Admin') {
      router.push('/leads');
    }
  }, [currentUser, authLoading, router]);
  
  const handleCreateUser = (newUserData: Omit<User, 'id' | 'avatar'>) => {
    const newUser: User = {
      ...newUserData,
      id: uuidv4(),
      avatar: `https://i.pravatar.cc/150?u=${uuidv4()}`,
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    toast({
        title: "User Created!",
        description: `${newUser.name} has been successfully added to the system.`
    });
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = (userId: string, data: Omit<User, 'id' | 'avatar'>) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...data } : user
      )
    );
    toast({
      title: "User Updated!",
      description: "The user's details have been successfully updated.",
    });
    setSelectedUser(null);
  };


  const loading = authLoading || usersLoading;

  if (loading || currentUser?.role !== 'Admin') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const roleColors: Record<UserRole, string> = {
    Admin: "bg-red-100 text-red-800",
    Manager: "bg-blue-100 text-blue-800",
    Evaluator: "bg-green-100 text-green-800",
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">
                    User Management
                </h1>
                <p className="text-muted-foreground">
                    Create, view, and manage user roles and permissions.
                </p>
            </div>
            <Button onClick={() => setIsCreateUserOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create User
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>A list of all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${roleColors[user.role]} hover:${roleColors[user.role]}`}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.state}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(user)} disabled={user.role === 'Admin'}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled={user.role === 'Admin'}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
       <CreateUserDialog
        isOpen={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
        onCreateUser={handleCreateUser}
      />
      <EditUserDialog
        user={selectedUser}
        isOpen={isEditUserOpen}
        onOpenChange={setIsEditUserOpen}
        onUpdateUser={handleUpdateUser}
      />
    </>
  );
}
