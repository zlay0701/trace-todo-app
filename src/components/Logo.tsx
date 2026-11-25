interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-10 w-10' }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Todo App"
    >
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#3B82F6" />
      <path
        d="M15 24.5L21 30.5L33 17.5"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
