/**
 * Clean authoring artifacts that break Mathpix when MCQ options were split
 * out of a shared LaTeX list (e.g. `\begin{itemize} \item[(1)] …` on A and
 * `\end{itemize}` on D).
 */
export function sanitizeAttemptRichText(text: string): string {
  return text
    .replace(/\\begin\{itemize\}/gi, "")
    .replace(/\\end\{itemize\}/gi, "")
    .replace(/\\begin\{enumerate\}/gi, "")
    .replace(/\\end\{enumerate\}/gi, "")
    .replace(/\\item\s*\[[^\]]*\]/gi, "")
    .replace(/\\item\b/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
