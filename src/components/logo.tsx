import Link from "next/link";
import { Zap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-sm shadow-emerald-500/30">
        <Zap className="size-4.5" fill="currentColor" strokeWidth={1.5} />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight">
        {APP_NAME}
      </span>
    </Link>
  );
}
