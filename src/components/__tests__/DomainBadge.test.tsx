import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DomainBadge from "../shared/DomainBadge";

describe("DomainBadge", () => {
	it("renders domain number and short name", () => {
		render(<DomainBadge domain={1} />);
		expect(screen.getByText("D1: FM Integration")).toBeInTheDocument();
	});

	it("renders all 5 domains correctly", () => {
		const expected = [
			[1, "FM Integration"],
			[2, "Implementation"],
			[3, "Safety & Security"],
			[4, "Optimization"],
			[5, "Testing"],
		] as const;

		for (const [id, shortName] of expected) {
			const { unmount } = render(<DomainBadge domain={id} />);
			expect(screen.getByText(`D${id}: ${shortName}`)).toBeInTheDocument();
			unmount();
		}
	});

	it("returns null for invalid domain", () => {
		const { container } = render(<DomainBadge domain={99} />);
		expect(container.firstChild).toBeNull();
	});

	it("applies sm size classes by default", () => {
		render(<DomainBadge domain={1} />);
		const badge = screen.getByText("D1: FM Integration");
		expect(badge.className).toContain("text-xs");
	});

	it("applies md size classes when specified", () => {
		render(<DomainBadge domain={1} size="md" />);
		const badge = screen.getByText("D1: FM Integration");
		expect(badge.className).toContain("text-sm");
	});
});
