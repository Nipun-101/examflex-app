import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  LegalContact,
  LegalDocument,
  LegalList,
  LegalSection,
} from "@/components/legal/legal-document";

describe("LegalDocument", () => {
  it("renders nav chips, toc, title, and related links", () => {
    render(
      <LegalDocument
        title="Privacy Policy"
        lede="How we handle data."
        updated="16 November 2026"
        currentPath="/privacy-policy"
        sections={[
          { id: "general", title: "General" },
          { id: "contact", title: "Contact" },
        ]}
      >
        <LegalSection id="general" title="General">
          <p>Body copy</p>
          <LegalList items={["Alpha", "Beta"]} />
        </LegalSection>
        <LegalContact />
      </LegalDocument>
    );

    expect(
      screen.getByRole("heading", { name: "Privacy Policy" })
    ).toBeInTheDocument();
    expect(screen.getByText("How we handle data.")).toBeInTheDocument();
    expect(screen.getByText(/Last updated: 16 November 2026/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy Policy", current: "page" })
    ).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
      "href",
      "/terms"
    );
    expect(screen.getByRole("link", { name: "← Back to home" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByText("Body copy")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("support@examflex.in")).toBeInTheDocument();
  });
});
