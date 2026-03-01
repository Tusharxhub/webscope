import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-lg ${
        hover ? "hover:shadow-xl hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
