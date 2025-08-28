"use client";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                redirect('/leads');
            } else {
                redirect('/login');
            }
        }
    }, [user, loading]);

    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}
