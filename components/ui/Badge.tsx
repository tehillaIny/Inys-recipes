// components/ui/Badge.tsx
import React, { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded ${className}`}
    >
      {children}
    </span>
  );
}
