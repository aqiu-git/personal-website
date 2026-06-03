import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "内容与评论" },
  { href: "/admin/categories", label: "分类管理" },
  { href: "/admin/media", label: "媒体库" },
  { href: "/admin/account", label: "账号安全" }
];

export const AdminNav = () => (
  <div className="flex w-full flex-wrap items-center gap-2">
    <nav className="flex flex-wrap gap-2">
      {adminLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
    <Link
      href="/admin/posts#publish"
      className="ml-auto inline-flex h-12 items-center rounded-full bg-blue-500 px-6 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-blue-600"
    >
      发表内容
    </Link>
  </div>
);
