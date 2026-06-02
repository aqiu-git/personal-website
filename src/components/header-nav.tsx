"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页" },
  { href: "/categories/photography", label: "摄影" },
  { href: "/categories/cats", label: "猫咪" },
  { href: "/categories/tech", label: "技术" },
  { href: "/timeline", label: "时间轴" },
  { href: "/search", label: "搜索" }
];

const isActiveLink = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const HeaderNav = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
      {links.map((link) => {
        const isActive = isActiveLink(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "origin-center transition-all duration-300 ease-out hover:scale-110 hover:text-orange-400",
              isActive
                ? "scale-125 font-semibold text-orange-400"
                : "scale-100 text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
