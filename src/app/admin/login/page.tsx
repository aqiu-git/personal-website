import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const AdminLoginPage = async () => {
  const admin = await getPageAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="container flex min-h-[calc(100vh-4rem)] max-w-md items-center py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>后台登录</CardTitle>
          <CardDescription>管理员登录后可管理内容、分类、评论和媒体。</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminLoginPage;
