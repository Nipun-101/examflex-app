import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as AttemptsApi from "@/lib/api/attempts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttemptResultClient } from "@/components/attempt/attempt-result-client";
import { getAttempt } from "@/lib/api/attempts";
import { rememberAttemptLanguage } from "@/lib/mocks/attempt-language";
import { makeDetails } from "@/test-utils/attempt-fixtures";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());
vi.mock("@/lib/api/attempts", async (importOriginal) => {
  const actual = await importOriginal<typeof AttemptsApi>();
  return { ...actual, getAttempt: vi.fn() };
});

const getAttemptMock = vi.mocked(getAttempt);

beforeEach(() => {
  getAttemptMock.mockReset();
  sessionStorage.clear();
});

describe("AttemptResultClient", () => {
  it("blocks with the study loader while loading", () => {
    getAttemptMock.mockReturnValue(new Promise(() => undefined));
    render(<AttemptResultClient attemptId="att1" />);
    expect(screen.getByText("Loading your results...")).toBeInTheDocument();
  });

  it("shows the results for a finished attempt", async () => {
    getAttemptMock.mockResolvedValue({ ok: true, data: makeDetails({ status: "SUBMITTED" }) });
    render(<AttemptResultClient attemptId="att1" />);
    expect(await screen.findByText(/Answer key/i)).toBeInTheDocument();
    expect(getAttemptMock).toHaveBeenCalledWith("att1");
  });

  it("opens the answer key in the language the student used", async () => {
    rememberAttemptLanguage("att1", "ml");
    getAttemptMock.mockResolvedValue({ ok: true, data: makeDetails({ status: "SUBMITTED" }) });
    render(<AttemptResultClient attemptId="att1" />);
    expect(await screen.findByRole("radio", { name: "മലയാളം" })).toBeChecked();
  });

  it("points an unfinished attempt back to the runner", async () => {
    getAttemptMock.mockResolvedValue({ ok: true, data: makeDetails({ status: "IN_PROGRESS" }) });
    render(<AttemptResultClient attemptId="att1" />);
    expect(await screen.findByRole("heading", { name: "Attempt still in progress" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resume Attempt" })).toHaveAttribute(
      "href",
      "/mocks/attempt/att1"
    );
    expect(screen.getByRole("link", { name: "Back to Mocks" })).toHaveAttribute("href", "/mocks");
  });

  it("shows an error and retries", async () => {
    getAttemptMock
      .mockResolvedValueOnce({ ok: false, message: "Boom", status: 500 })
      .mockResolvedValueOnce({ ok: true, data: makeDetails({ status: "SUBMITTED" }) });
    render(<AttemptResultClient attemptId="att1" />);
    expect(await screen.findByRole("heading", { name: "Result unavailable" })).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(/Answer key/i)).toBeInTheDocument();
    expect(getAttemptMock).toHaveBeenCalledTimes(2);
  });

  it("ignores a response that lands after unmount", async () => {
    let resolve: (value: Awaited<ReturnType<typeof getAttempt>>) => void = () => undefined;
    getAttemptMock.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { unmount } = render(<AttemptResultClient attemptId="att1" />);
    unmount();
    resolve({ ok: true, data: makeDetails({ status: "SUBMITTED" }) });
    await Promise.resolve();
    expect(screen.queryByText(/Answer key/i)).not.toBeInTheDocument();
  });
});
