"use client";

import { Component, type ReactNode } from "react";

type QuestionRenderGuardProps = {
  fallback?: ReactNode;
  children: ReactNode;
};

type QuestionRenderGuardState = {
  hasError: boolean;
};

/** One malformed question must not take down the whole answer key. */
export class QuestionRenderGuard extends Component<
  QuestionRenderGuardProps,
  QuestionRenderGuardState
> {
  override state: QuestionRenderGuardState = { hasError: false };

  static getDerivedStateFromError(): QuestionRenderGuardState {
    return { hasError: true };
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <p className="text-sm text-study-muted-soft">
            This question could not be displayed.
          </p>
        )
      );
    }
    return this.props.children;
  }
}
