import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "EpCraft Admin Suite",
  description: "Internal business management suite for EpCraft artisans.",
};

export default async function AdminLayout({ children }) {
  const supabase = createClient();

  // 1. Get authenticated user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/admin");
  }

  // 2. Query user profile to verify admin status
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.is_admin) {
    // Unauthorized access: redirect to client shop
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-cream text-ink">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar userEmail={user.email} />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Simple Top Bar */}
        <header className="h-[72px] bg-white border-b border-border/40 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-sans text-xs font-semibold text-bark uppercase tracking-widest">
              Live Database Connected
            </span>
          </div>
          <div className="flex items-center gap-3 font-sans text-sm text-bark">
            <span>Workspace: <strong>Default Studio</strong></span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
