import { DOMAINS } from "../../lib/constants";

interface DomainBadgeProps {
  domain: number;
  size?: "sm" | "md";
}

const badgeClasses: Record<number, string> = {
  1: "badge-domain-1",
  2: "badge-domain-2",
  3: "badge-domain-3",
  4: "badge-domain-4",
  5: "badge-domain-5",
};

export default function DomainBadge({ domain, size = "sm" }: DomainBadgeProps) {
  const domainData = DOMAINS.find((d) => d.id === domain);
  if (!domainData) return null;

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`${badgeClasses[domain] ?? "badge"} ${sizeClasses}`}>
      D{domain}: {domainData.shortName}
    </span>
  );
}
