
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Grip, LayoutGrid, Users, Megaphone, Calendar } from "lucide-react";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { FranchiseFlowLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser, logout, loading } = useAuth();


  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <FranchiseFlowLogo className="size-8 text-primary" />
            <span className="font-headline text-lg font-semibold">Franchise Flow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {loading ? (
            <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <Link href="/leads">
                  <SidebarMenuButton tooltip="Leads" isActive={isActive('/leads')} >
                    <Grip />
                    <span>Leads</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton tooltip="Dashboard" isActive={isActive('/dashboard')}>
                    <LayoutGrid />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/availability">
                  <SidebarMenuButton tooltip="My Availability" isActive={isActive('/availability')}>
                    <Calendar />
                    <span>My Availability</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              {currentUser?.role === 'Admin' && (
                <>
                  <SidebarMenuItem>
                    <Link href="/users">
                      <SidebarMenuButton tooltip="Users" isActive={isActive('/users')}>
                        <Users />
                        <span>Users</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/campaigns">
                      <SidebarMenuButton tooltip="Campaigns" isActive={isActive('/campaigns')}>
                        <Megaphone />
                        <span>Campaigns</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </>
              )}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
      {!loading && currentUser && (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start gap-3 w-full p-2 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.role} - {currentUser.state}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.name.toLowerCase().replace(/ /g, '.')}@franchise.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </>
  );
}
