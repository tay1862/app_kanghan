import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return (
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}
