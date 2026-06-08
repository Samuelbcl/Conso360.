import type { LucideIcon } from "lucide-react";

export function PageHeading({
  icon: Icon,
  chip,
  title,
  children,
}: {
  icon: LucideIcon;
  chip: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-2xl ${chip}`}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
        {children && <p className="mt-1 text-muted-foreground">{children}</p>}
      </div>
    </div>
  );
}
