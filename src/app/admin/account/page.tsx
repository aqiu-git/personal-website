import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { AdminPasswordForm } from "@/components/admin-password-form";
import { getPageAdmin } from "@/lib/auth";

export default async function AdminAccountPage() {
  const admin = await getPageAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="container space-y-8 py-12">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">当前账号：{admin.email}</p>
        <h1 className="text-4xl font-semibold tracking-normal">账号安全</h1>
        <AdminNav />
      </div>
      <AdminPasswordForm />
    </main>
  );
}
