import type { ReactNode } from "react";

/** Factory for `vi.mock("mathpix-markdown-it", ...)` in component tests. */
export function mathpixModuleStub(loadMathJax: () => boolean = () => true) {
  return {
    MathpixMarkdownModel: { loadMathJax },
    MathpixMarkdown: ({ text }: { text: string; children?: ReactNode }) => (
      <span data-testid="mathpix-markdown">{text}</span>
    ),
  };
}
