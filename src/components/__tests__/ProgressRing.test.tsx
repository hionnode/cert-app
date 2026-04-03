import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressRing from "../shared/ProgressRing";

describe("ProgressRing", () => {
	it("renders 0% when value is 0", () => {
		render(<ProgressRing value={0} max={10} color="#1b7e4e" />);
		expect(screen.getByText("0%")).toBeInTheDocument();
	});

	it("renders 100% when value equals max", () => {
		render(<ProgressRing value={10} max={10} color="#1b7e4e" />);
		expect(screen.getByText("100%")).toBeInTheDocument();
	});

	it("renders correct percentage for partial completion", () => {
		render(<ProgressRing value={3} max={4} color="#0056d2" />);
		expect(screen.getByText("75%")).toBeInTheDocument();
	});

	it("clamps at 100% when value exceeds max", () => {
		render(<ProgressRing value={15} max={10} color="#e16e2e" />);
		expect(screen.getByText("100%")).toBeInTheDocument();
	});

	it("renders 0% when max is 0", () => {
		render(<ProgressRing value={0} max={0} color="#8b5cf6" />);
		expect(screen.getByText("0%")).toBeInTheDocument();
	});

	it("renders SVG with correct dimensions", () => {
		const { container } = render(<ProgressRing value={5} max={10} size={120} color="#1b7e4e" />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveAttribute("width", "120");
		expect(svg).toHaveAttribute("height", "120");
	});

	it("renders two circle elements (track and progress)", () => {
		const { container } = render(<ProgressRing value={5} max={10} color="#1b7e4e" />);
		const circles = container.querySelectorAll("circle");
		expect(circles).toHaveLength(2);
	});

	it("applies the provided color to the progress circle", () => {
		const { container } = render(<ProgressRing value={5} max={10} color="#e74c3c" />);
		const circles = container.querySelectorAll("circle");
		expect(circles[1]).toHaveAttribute("stroke", "#e74c3c");
	});

	it("uses default size of 80 when not specified", () => {
		const { container } = render(<ProgressRing value={5} max={10} color="#1b7e4e" />);
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.width).toBe("80px");
		expect(wrapper.style.height).toBe("80px");
	});
});
