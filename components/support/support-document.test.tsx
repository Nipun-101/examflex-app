import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  SupportContactCard,
  SupportDocument,
  SupportFaqItem,
  SupportList,
  SupportSection,
} from "@/components/support/support-document";

describe("SupportDocument", () => {
  it("renders support nav chips, toc, and contact card", () => {
    render(
      <SupportDocument
        title="Help centre"
        lede="Guides for ExamFlex."
        updated="16 November 2026"
        currentPath="/help"
        sections={[
          { id: "topics", title: "Browse topics" },
          { id: "more-help", title: "More help" },
        ]}
      >
        <SupportSection id="topics" title="Browse topics">
          <p>Topic body</p>
          <SupportList items={["Alpha", "Beta"]} />
        </SupportSection>
        <SupportSection id="more-help" title="More help">
          <SupportFaqItem id="sample" question="Sample question?">
            <p>Sample answer</p>
          </SupportFaqItem>
          <SupportContactCard />
        </SupportSection>
      </SupportDocument>
    );

    expect(
      screen.getByRole("heading", { name: "Help centre" })
    ).toBeInTheDocument();
    expect(screen.getByText("Guides for ExamFlex.")).toBeInTheDocument();
    expect(
      screen.getByText(/Last updated: 16 November 2026/)
    ).toBeInTheDocument();

    const supportNav = screen.getByRole("navigation", { name: "Support pages" });
    expect(
      within(supportNav).getByRole("link", { name: "Help centre", current: "page" })
    ).toHaveAttribute("href", "/help");
    expect(
      within(supportNav).getByRole("link", { name: "Contact us" })
    ).toHaveAttribute("href", "/contact");
    expect(within(supportNav).getByRole("link", { name: "FAQs" })).toHaveAttribute(
      "href",
      "/faqs"
    );

    expect(screen.getByText("Topic body")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Sample question?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@examflex.in" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:support@examflex.in")
    );
  });
});
