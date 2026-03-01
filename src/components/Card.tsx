import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${
        hover ? "hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200 cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
