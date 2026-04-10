import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizCard from "../practice/QuizCard";
import type { PracticeQuestion } from "../../lib/types";

const mcQuestion: PracticeQuestion = {
	id: "q1",
	domain: 1,
	level: 1,
	type: "multiple-choice",
	integrationDomains: [],
	question: "Which service is best for vector storage?",
	options: [
		"A. Amazon OpenSearch",
		"B. Amazon DynamoDB",
		"C. Amazon S3",
		"D. Amazon RDS",
	],
	correctAnswer: "A",
	explanation: "OpenSearch supports k-NN vector search natively.",
	examSkills: ["1.1"],
	tags: ["vector-store"],
};

const mrQuestion: PracticeQuestion = {
	id: "q2",
	domain: 2,
	level: 2,
	type: "multiple-response",
	integrationDomains: [1],
	question: "Which two are agent frameworks?",
	options: [
		"A. LangChain",
		"B. Amazon S3",
		"C. Agents for Bedrock",
		"D. CloudWatch",
	],
	correctAnswers: ["A", "C"],
	explanation: "LangChain and Agents for Bedrock are agent frameworks.",
	examSkills: ["2.1"],
	tags: ["agents"],
};

function renderQuiz(questions: PracticeQuestion[] = [mcQuestion]) {
	return render(<QuizCard questions={questions} title="Test Quiz" />);
}

describe("QuizCard", () => {
	describe("initial render", () => {
		it("displays the question text", () => {
			renderQuiz();
			expect(screen.getByText("Which service is best for vector storage?")).toBeInTheDocument();
		});

		it("displays all answer options", () => {
			renderQuiz();
			expect(screen.getByText("Amazon OpenSearch")).toBeInTheDocument();
			expect(screen.getByText("Amazon DynamoDB")).toBeInTheDocument();
			expect(screen.getByText("Amazon S3")).toBeInTheDocument();
			expect(screen.getByText("Amazon RDS")).toBeInTheDocument();
		});

		it("shows question text", () => {
			renderQuiz();
			expect(screen.getByText("Which service is best for vector storage?")).toBeInTheDocument();
		});

		it("shows domain badge", () => {
			renderQuiz();
			expect(screen.getByText("D1")).toBeInTheDocument();
		});

		it("shows level badge", () => {
			renderQuiz();
			expect(screen.getByText("Foundation")).toBeInTheDocument();
		});

		it("shows domain badge", () => {
			renderQuiz();
			expect(screen.getByText("D1")).toBeInTheDocument();
		});

		it("has disabled Check Answer button initially", () => {
			renderQuiz();
			const btn = screen.getByRole("button", { name: /check answer/i });
			expect(btn).toBeDisabled();
		});
	});

	describe("multiple-choice answering", () => {
		it("enables Check Answer after selecting an option", async () => {
			const user = userEvent.setup();
			renderQuiz();

			await user.click(screen.getByText("Amazon OpenSearch"));
			const btn = screen.getByRole("button", { name: /check answer/i });
			expect(btn).not.toBeDisabled();
		});

		it("shows correct feedback for right answer", async () => {
			const user = userEvent.setup();
			renderQuiz();

			await user.click(screen.getByText("Amazon OpenSearch"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));

			expect(screen.getByText("Correct!")).toBeInTheDocument();
			expect(screen.getByText(mcQuestion.explanation)).toBeInTheDocument();
		});

		it("shows incorrect feedback for wrong answer", async () => {
			const user = userEvent.setup();
			renderQuiz();

			await user.click(screen.getByText("Amazon DynamoDB"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));

			expect(screen.getByText("Incorrect")).toBeInTheDocument();
		});

		it("shows exam skills tags in feedback", async () => {
			const user = userEvent.setup();
			renderQuiz();

			await user.click(screen.getByText("Amazon OpenSearch"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));

			expect(screen.getByText("1.1")).toBeInTheDocument();
		});
	});

	describe("multiple-response answering", () => {
		it("allows selecting multiple options", async () => {
			const user = userEvent.setup();
			renderQuiz([mrQuestion]);

			await user.click(screen.getByText("LangChain"));
			await user.click(screen.getByText("Agents for Bedrock"));

			const btn = screen.getByRole("button", { name: /check answer/i });
			expect(btn).not.toBeDisabled();
		});

		it("marks correct when all right answers selected", async () => {
			const user = userEvent.setup();
			renderQuiz([mrQuestion]);

			await user.click(screen.getByText("LangChain"));
			await user.click(screen.getByText("Agents for Bedrock"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));

			expect(screen.getByText("Correct!")).toBeInTheDocument();
		});

		it("marks incorrect when wrong answers selected", async () => {
			const user = userEvent.setup();
			renderQuiz([mrQuestion]);

			await user.click(screen.getByText("LangChain"));
			await user.click(screen.getByText("Amazon S3"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));

			expect(screen.getByText("Incorrect")).toBeInTheDocument();
		});

		it("shows integration domain badge", () => {
			renderQuiz([mrQuestion]);
			expect(screen.getByText("+D1")).toBeInTheDocument();
		});
	});

	describe("quiz completion", () => {
		it("shows completion screen after last question", async () => {
			const user = userEvent.setup();
			renderQuiz([mcQuestion]);

			await user.click(screen.getByText("Amazon OpenSearch"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));
			await user.click(screen.getByRole("button", { name: /see results/i }));

			expect(screen.getByText("1/1")).toBeInTheDocument();
			expect(screen.getByText("100% correct")).toBeInTheDocument();
			expect(screen.getByText("Great job!")).toBeInTheDocument();
		});

		it("shows 'Keep practicing!' for low scores", async () => {
			const user = userEvent.setup();
			renderQuiz([mcQuestion]);

			await user.click(screen.getByText("Amazon DynamoDB"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));
			await user.click(screen.getByRole("button", { name: /see results/i }));

			expect(screen.getByText("0/1")).toBeInTheDocument();
			expect(screen.getByText("Keep practicing!")).toBeInTheDocument();
		});

		it("allows restarting the quiz", async () => {
			const user = userEvent.setup();
			renderQuiz([mcQuestion]);

			await user.click(screen.getByText("Amazon OpenSearch"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));
			await user.click(screen.getByRole("button", { name: /see results/i }));
			await user.click(screen.getByRole("button", { name: /try again/i }));

			expect(screen.getByText("Which service is best for vector storage?")).toBeInTheDocument();
		});
	});

	describe("multi-question navigation", () => {
		it("navigates through multiple questions", async () => {
			const user = userEvent.setup();
			renderQuiz([mcQuestion, mrQuestion]);

			expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();

			await user.click(screen.getByText("Amazon OpenSearch"));
			await user.click(screen.getByRole("button", { name: /check answer/i }));
			await user.click(screen.getByRole("button", { name: /^next$/i }));

			expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
			expect(screen.getByText("Which two are agent frameworks?")).toBeInTheDocument();
		});
	});
});
