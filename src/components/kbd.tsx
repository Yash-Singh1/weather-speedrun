import { cn } from "@/lib/utils";

export function Kbd({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <kbd className={cn("px-1 border border-gray-500 rounded-sm", className)}>
      {children}
    </kbd>
  );
}
