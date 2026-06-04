import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        {APP_NAME}
      </Link>
      {children}
    </div>
  );
}
