import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MathpixBoundary } from "@/components/attempt/mathpix-boundary";
import { MistakeNcertCard } from "@/components/mistake-book/mistake-ncert-card";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";
import type { MistakeCitation, MistakeItem } from "@/types/mistake-book";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

const citation: MistakeCitation = {
  title: "Preparation and Oxidising Properties of Potassium Dichromate",
  content:
    "Dichromate intro.\n\n<figure>figure-7<caption>Chromate ion</caption><description>Chromate structure.</description></figure>\n\nMore text.",
  images: ["https://cdn.test/figure-7.jpg", "https://cdn.test/figure-8.jpg"],
  chapterName: "The d - and f -Block Elements",
  grade: "XII",
  pageNumber: 105,
};

function mistakeWith(patch: Partial<MistakeItem>): MistakeItem {
  return {
    ...MISTAKE_BOOK_DATA.mistakes[0]!,
    citationStatus: "done",
    citation,
    ...patch,
  };
}

function renderCard(mistake: MistakeItem) {
  return render(
    <MathpixBoundary>
      <MistakeNcertCard mistake={mistake} />
    </MathpixBoundary>,
  );
}

describe("MistakeNcertCard", () => {
  it("shows chips and CTA, without the title or a 'more references' chip", () => {
    renderCard(mistakeWith({}));

    expect(screen.getByText("NCERT reference")).toBeInTheDocument();
    expect(screen.queryByText(citation.title)).not.toBeInTheDocument();
    expect(
      screen.getByText("The d - and f -Block Elements"),
    ).toBeInTheDocument();
    expect(screen.getByText("Class XII")).toBeInTheDocument();
    expect(screen.getByText("Page 105")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Read NCERT text/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/more reference/i)).not.toBeInTheDocument();
  });

  it("leaves out chips whose field is missing", () => {
    renderCard(
      mistakeWith({
        citation: { title: "T", content: "C", images: [], grade: "XI" },
      }),
    );
    expect(screen.getByText("Class XI")).toBeInTheDocument();
    expect(screen.queryByText(/Page \d/)).not.toBeInTheDocument();
  });

  it.each(["pending", "failed", "skipped"] as const)(
    "renders nothing when status is %s",
    (status) => {
      const { container } = renderCard(mistakeWith({ citationStatus: status }));
      expect(container).toBeEmptyDOMElement();
    },
  );

  it("renders nothing without a citation", () => {
    const { container } = renderCard(MISTAKE_BOOK_DATA.mistakes[0]!);
    expect(container).toBeEmptyDOMElement();
  });

  it("opens the full passage dialog and closes it", async () => {
    const user = userEvent.setup();
    renderCard(mistakeWith({}));

    await user.click(screen.getByRole("button", { name: /Read NCERT text/i }));
    const dialog = screen.getByRole("dialog", { name: citation.title });

    expect(
      within(dialog).getByText("Matched to your NCERT edition"),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/\.pdf|Source:/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/of 3/)).not.toBeInTheDocument();

    const text = await within(dialog).findByTestId("mathpix-markdown");
    expect(text.textContent).toContain("Dichromate intro.");
    expect(text.textContent).not.toContain("<figure>");

    const images = within(dialog).getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("alt", "Chromate structure.");
    expect(within(dialog).getByText("Chromate ion")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Read NCERT text/i }),
    ).toHaveFocus();
  });

  it("closes on Escape and from the X button", async () => {
    const user = userEvent.setup();
    renderCard(mistakeWith({}));

    await user.click(screen.getByRole("button", { name: /Read NCERT text/i }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Read NCERT text/i }));
    await user.click(
      screen.getByRole("button", { name: "Close NCERT reference" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
