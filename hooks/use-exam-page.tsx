"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { getExamById } from "@/lib/api/exams";
import type { ApiExamDetail } from "@/types/exam";

export type ExamPageContextValue = {
  examId: string;
  exam: ApiExamDetail | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export const ExamPageContext = createContext<ExamPageContextValue | null>(
  null
);

export function useExamPage(): ExamPageContextValue {
  const ctx = useContext(ExamPageContext);
  if (!ctx) {
    throw new Error("useExamPage must be used within ExamPageProvider");
  }
  return ctx;
}

/**
 * Prefer an explicit `examId` (tests / overrides), otherwise the hub provider.
 */
export function useResolvedExamId(examIdProp?: string): string {
  const ctx = useContext(ExamPageContext);
  const examId = examIdProp ?? ctx?.examId;
  if (!examId) {
    throw new Error("examId prop or ExamPageProvider is required");
  }
  return examId;
}

type ExamPageProviderProps = {
  examId: string;
  children: ReactNode;
};

type ExamState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; exam: ApiExamDetail };

/** Fetches the exam once per id and shares it with the hub tabs. */
export function ExamPageProvider({
  examId,
  children,
}: ExamPageProviderProps) {
  const [state, setState] = useState<ExamState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void getExamById(examId).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { status: "ready", exam: result.data }
          : { status: "error", message: result.message }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [examId, reloadKey]);

  const value = useMemo<ExamPageContextValue>(
    () => ({
      examId,
      exam: state.status === "ready" ? state.exam : null,
      loading: state.status === "loading",
      error: state.status === "error" ? state.message : null,
      reload: () => {
        setState({ status: "loading" });
        setReloadKey((key) => key + 1);
      },
    }),
    [examId, state]
  );

  return (
    <ExamPageContext.Provider value={value}>
      <StudyRouteLoading busy={state.status === "loading"} />
      {children}
    </ExamPageContext.Provider>
  );
}
