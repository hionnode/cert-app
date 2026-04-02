import { useState, useEffect } from "react";

interface ProgressRingProps {
	value: number;
	max: number;
	size?: number;
	color: string;
	label?: string;
	strokeWidth?: number;
}

export default function ProgressRing({
	value,
	max,
	size = 80,
	color,
	strokeWidth = 6,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const pct = max > 0 ? Math.min(value / max, 1) : 0;
	const displayPct = Math.round(pct * 100);

	// Defer animation to after mount to avoid hydration mismatch
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const offset = mounted ? circumference * (1 - pct) : circumference;

	return (
		<div
			className="relative inline-flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<svg width={size} height={size} className="-rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					className="text-surface-3"
					strokeWidth={strokeWidth}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					style={{ transition: "stroke-dashoffset 1s ease-out" }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-sm font-bold text-ink">{displayPct}%</span>
			</div>
		</div>
	);
}
