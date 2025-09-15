import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { LeadProvider } from '@/hooks/use-leads';
import { UserProvider } from '@/hooks/use-users';
import { CampaignProvider } from '@/hooks/use-campaigns';
import { AvailabilityProvider } from '@/hooks/use-availability';


export const metadata: Metadata = {
  title: 'Franchise Flow',
  description: 'Centralized Lead Management for Franchises',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <UserProvider>
          <CampaignProvider>
            <LeadProvider>
                <AvailabilityProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </AvailabilityProvider>
            </LeadProvider>
          </CampaignProvider>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
