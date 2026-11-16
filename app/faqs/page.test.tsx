import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FaqsPage from "@/app/faqs/page";

describe("FaqsPage", () => {
  it("renders FAQ questions and support CTA", () => {
    render(<FaqsPage />);

    expect(screen.getByRole("heading", { name: "FAQs" })).toBeInTheDocument();
    expect(screen.getByText(/What is ExamFlex\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How do I delete my account\?/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@examflex.in" })).toBeInTheDocument();
  });
});
