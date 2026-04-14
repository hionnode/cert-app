import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScenarioCard from "../scenarios/ScenarioCard";
import type { Scenario } from "../../lib/types";
import * as progress from "../../lib/progress";

vi.mock("../../lib/progress", () => ({
	rateScenario: vi.fn(),
}));

const scenario: Scenario = {
	id: "s-1",
	number: "1",
	domain: 1,
	week: 1,
	day: 1,
	title: "RAG Pipeline Design",
	question: "How would you design a RAG pipeline for a legal document search system?",
	thinkPrompts: [
		"What embedding model would you use?",
		"How would you chunk the documents?",
	],
	answer: "Use Amazon Bedrock with Titan embeddings, chunk at 512 tokens with overlap, store in OpenSearch.",
	whyExplanation: "Titan embeddings are optimized for AWS workloads.",
	examSkills: ["1.1", "1.3"],
	difficulty: "medium",
};

describe("ScenarioCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("question state", () => {
		it("renders scenario title", () => {
			render(<ScenarioCard scenario={scenario} />);
			expect(screen.getByText("RAG Pipeline Design")).toBeInTheDocument();
		});

		it("renders question text", () => {
			render(<ScenarioCard scenario={scenario} />);
			expect(screen.getByText(/How would you design a RAG pipeline/)).toBeInTheDocument();
		});

		it("renders think prompts inline", () => {
			render(<ScenarioCard scenario={scenario} />);
			expect(
				screen.getByText(/What embedding model would you use\?/),
			).toBeInTheDocument();
			expect(
				screen.getByText(/How would you chunk the documents\?/),
			).toBeInTheDocument();
		});

		it("renders Consider prefix for think prompts", () => {
			render(<ScenarioCard scenario={scenario} />);
			expect(screen.getByText(/^Consider:/)).toBeInTheDocument();
		});

		it("renders difficulty badge", () => {
			render(<ScenarioCard scenario={scenario} />);
			expect(screen.getByText("Medium")).toBeInTheDocument();
		});

		it("renders difficulty badge", () => {
			render(<ScenarioCard scenario={scenario} />);
			expect(screen.getByText("Medium")).toBeInTheDocument();
		});

		it("shows Reveal Answer button", () => {
			render(<ScenarioCard scenario={scenario} />);
			expect(screen.getByRole("button", { name: /reveal answer/i })).toBeInTheDocument();
		});
	});

	describe("reveal answer flow", () => {
		it("shows answer after clicking reveal", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));

			expect(screen.getByText(/Use Amazon Bedrock with Titan embeddings/)).toBeInTheDocument();
		});

		it("shows why explanation after reveal", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));

			expect(screen.getByText(/Titan embeddings are optimized/)).toBeInTheDocument();
		});

		it("shows exam skills badges after reveal", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));

			expect(screen.getByText("1.1")).toBeInTheDocument();
			expect(screen.getByText("1.3")).toBeInTheDocument();
		});

		it("shows self-rating buttons after reveal", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));

			expect(screen.getByRole("button", { name: /got it/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /partial/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /missed/i })).toBeInTheDocument();
		});

		it("shows 'How did you do?' prompt", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));

			expect(screen.getByText("How did you do?")).toBeInTheDocument();
		});
	});

	describe("rating flow", () => {
		it("calls rateScenario with got-it and shows mastered message", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));
			await user.click(screen.getByRole("button", { name: /got it/i }));

			expect(progress.rateScenario).toHaveBeenCalledWith("s-1", "got-it");
			expect(screen.getByText(/Mastered/)).toBeInTheDocument();
		});

		it("calls rateScenario with partial and shows 3-day review message", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));
			await user.click(screen.getByRole("button", { name: /partial/i }));

			expect(progress.rateScenario).toHaveBeenCalledWith("s-1", "partial");
			expect(screen.getByText(/review in 3 days/)).toBeInTheDocument();
		});

		it("calls rateScenario with missed and shows tomorrow review message", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));
			await user.click(screen.getByRole("button", { name: /missed/i }));

			expect(progress.rateScenario).toHaveBeenCalledWith("s-1", "missed");
			expect(screen.getByText(/review tomorrow/)).toBeInTheDocument();
		});

		it("allows retrying after rating", async () => {
			const user = userEvent.setup();
			render(<ScenarioCard scenario={scenario} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));
			await user.click(screen.getByRole("button", { name: /got it/i }));
			await user.click(screen.getByRole("button", { name: /try again/i }));

			expect(screen.getByText(/How would you design a RAG pipeline/)).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /reveal answer/i })).toBeInTheDocument();
		});
	});

	describe("edge cases", () => {
		it("renders without think prompts", () => {
			const noPrompts = { ...scenario, thinkPrompts: [] };
			render(<ScenarioCard scenario={noPrompts} />);
			expect(screen.queryByText(/^Consider:/)).not.toBeInTheDocument();
		});

		it("renders without why explanation", async () => {
			const user = userEvent.setup();
			const noWhy = { ...scenario, whyExplanation: undefined };
			render(<ScenarioCard scenario={noWhy} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));

			expect(screen.queryByText("Why?")).not.toBeInTheDocument();
			expect(screen.getByText(/Use Amazon Bedrock/)).toBeInTheDocument();
		});

		it("renders without exam skills", async () => {
			const user = userEvent.setup();
			const noSkills = { ...scenario, examSkills: [] };
			render(<ScenarioCard scenario={noSkills} />);

			await user.click(screen.getByRole("button", { name: /reveal answer/i }));

			expect(screen.queryByText("1.1")).not.toBeInTheDocument();
		});
	});
});
