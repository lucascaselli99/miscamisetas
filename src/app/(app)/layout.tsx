import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/profile";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideNav } from "@/components/layout/SideNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege estas rutas, pero validamos de nuevo por las
  // dudas (nunca confiar solo en una capa).
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(supabase, user.id);

  return (
    <AuthProvider user={{ id: user.id, email: user.email ?? "" }} initialProfile={profile}>
      <div className="min-h-screen bg-cream-50 md:pl-60">
        <SideNav />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 safe-top md:px-8 md:pb-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
