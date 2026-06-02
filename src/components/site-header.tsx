import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export const SiteHeader = () => (
  <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
    <div className="container flex h-16 items-center justify-between gap-4">
      <Link href="/" className="text-sm font-semibold tracking-normal">
        AQ Space
      </Link>
      <HeaderNav />
      <ThemeToggle />
    </div>
  </header>
);
