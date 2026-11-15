import Link from "next/link";
import type {
  AriaAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";
import {
  studyControlClass,
  type StudyControlVariant,
} from "@/lib/study/button-styles";

type StudyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StudyControlVariant;
  children: ReactNode;
};

export function StudyButton({
  variant = "surface",
  className = "",
  type = "button",
  children,
  ...props
}: StudyButtonProps) {
  return (
    <button
      type={type}
      className={studyControlClass(variant, className)}
      {...props}
    >
      {children}
    </button>
  );
}

type StudyControlLinkProps = {
  href: string;
  variant?: StudyControlVariant;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-current"?: AriaAttributes["aria-current"];
  "aria-label"?: string;
};

export function StudyControlLink({
  href,
  variant = "surface",
  className = "",
  children,
  onClick,
  "aria-current": ariaCurrent,
  "aria-label": ariaLabel,
}: StudyControlLinkProps) {
  return (
    <Link
      href={href}
      className={studyControlClass(variant, className)}
      {...(onClick ? { onClick } : {})}
      {...(ariaCurrent !== undefined ? { "aria-current": ariaCurrent } : {})}
      {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
    >
      {children}
    </Link>
  );
}
