import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { Badge } from "@/components/ui/badge";
import { getPageAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/posts";

export const dynamic = "force-dynamic";

const AdminCategoriesPage = async () => {
  const admin = await getPageAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const categories = await getCategories();

  return (
    <main className="container space-y-8 py-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-normal">分类管理</h1>
        <AdminNav />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <Badge>{category.slug}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Badge key={child.id}>{child.name}</Badge>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default AdminCategoriesPage;
