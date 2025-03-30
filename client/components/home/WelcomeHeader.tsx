import React from "react";

interface WelcomeHeaderProps {
  title: string;
  subtitle: string;
}

export function WelcomeHeader({ title, subtitle }: WelcomeHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
        {title}
      </h1>
      <p className="text-gray-400 mt-2">{subtitle}</p>
    </div>
  );
}