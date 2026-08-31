import React from "react";

export function PesoSign({ className = "h-4 w-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 4h7a5 5 0 0 1 0 10H6Z" />
      <path d="M6 4v16" />
      <path d="M3.5 7.5h13" />
      <path d="M3.5 10.5h13" />
    </svg>
  );
}

export default PesoSign;
