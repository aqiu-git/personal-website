import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { MediaUploadForm } from "@/components/media-upload-form";
import { Badge } from "@/components/ui/badge";
import { getPageAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AdminMediaPage = async () => {
  const admin = await getPageAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const media = await prisma.media.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="container space-y-8 py-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-normal">媒体库</h1>
        <AdminNav />
      </section>
      <MediaUploadForm />
      <section className="grid gap-4 md:grid-cols-3">
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-border">
            {item.type === "IMAGE" ? (
              <Image
                src={item.url}
                alt={item.alt ?? item.caption ?? "媒体图片"}
                width={600}
                height={400}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-muted text-sm text-muted-foreground">
                Video
              </div>
            )}
            <div className="space-y-2 p-4">
              <Badge>{item.type}</Badge>
              <p className="truncate text-sm text-muted-foreground">{item.url}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default AdminMediaPage;
