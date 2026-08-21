import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  src?: string;
  isGroup?: boolean;
}

const colorMap = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
  "from-sky-500 to-blue-600",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorMap.length;
  return colorMap[index];
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = "md", src, isGroup, className, ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs font-semibold",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-12 h-12 text-base font-bold",
    xl: "w-16 h-16 text-xl font-bold",
  };

  const gradient = getGradient(name);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full select-none text-white shadow-xs shrink-0 overflow-hidden",
        sizeClasses[size],
        isGroup ? "bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-zinc-600/30" : `bg-gradient-to-tr ${gradient}`,
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
