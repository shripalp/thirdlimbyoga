import Link from "next/link";

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium transition";

  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : "border border-primary text-primary hover:bg-primary hover:text-white";

  if (href) {
    return (
      <Link href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
