import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { cn } from "./utils";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/40">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <span className="text-primary">EduDocs</span>
          <span className="text-ink">Market</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link className={cn(buttonVariants({ variant: "primary", size: "sm" }))} href="/?auth=student">
            Se connecter / S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
