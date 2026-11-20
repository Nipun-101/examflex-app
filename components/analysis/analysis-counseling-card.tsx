"use client";

import { CounselingBenefitIcon } from "@/components/analysis/counseling-benefit-icon";
import { CounselingExpertAvatar } from "@/components/analysis/counseling-expert-avatar";
import { COUNSELING_BENEFITS } from "@/lib/counseling/constants";
import { buildCounselingCardCopy } from "@/lib/counseling/copy";

export type AnalysisCounselingCardProps = {
  examName: string;
  canRequest: boolean;
  onBook: () => void;
};

function ExpertRow({
  name,
  role,
  parentsBadge,
}: {
  name: string;
  role: string;
  parentsBadge: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <CounselingExpertAvatar />
      <div className="min-w-0 pt-0.5">
        <p className="text-[0.9375rem] font-semibold leading-tight text-white">
          {name}
        </p>
        <p className="mt-1 text-[0.75rem] leading-snug text-[#c5d4cb]">
          {role}
        </p>
        <span className="mt-2 inline-flex rounded-full bg-black/25 px-2.5 py-1 text-[0.625rem] font-medium text-[#d7e2db]">
          {parentsBadge}
        </span>
      </div>
    </div>
  );
}

export function AnalysisCounselingCard({
  examName,
  canRequest,
  onBook,
}: AnalysisCounselingCardProps) {
  const copy = buildCounselingCardCopy(examName);

  return (
    <article
      className="relative overflow-hidden rounded-[28px] px-5 py-6 text-white sm:px-7 sm:py-7 lg:px-8 lg:py-8"
      style={{ backgroundColor: "#1b3022" }}
      data-testid="analysis-counseling-card"
    >
      {/* Decorative bokeh — design reference */}
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full"
        style={{ background: "rgba(90, 140, 110, 0.22)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-8 h-48 w-48 rounded-full"
        style={{ background: "rgba(120, 160, 140, 0.12)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-[28%] h-80 w-80 rounded-full"
        style={{ background: "rgba(196, 165, 116, 0.14)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 left-8 h-40 w-40 rounded-full"
        style={{ background: "rgba(70, 110, 90, 0.18)" }}
        aria-hidden
      />

      <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-12 lg:items-stretch">
        {/* Left: value prop + CTA */}
        <div className="flex min-w-0 flex-col">
          <span
            className="inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[0.625rem] font-bold tracking-[0.04em] text-[#1b3022] uppercase"
            style={{ backgroundColor: "#ffd56b" }}
          >
            {copy.badge}
          </span>

          <h2 className="mt-5 font-display text-[1.5rem] leading-[1.2] font-semibold tracking-tight text-white sm:text-[1.75rem] lg:text-[1.875rem]">
            {canRequest ? copy.headline : copy.thankYouHeadline}
          </h2>

          <p className="mt-3 max-w-lg text-[0.875rem] leading-[1.55] text-[#c9d6ce] sm:text-[0.9375rem]">
            {canRequest ? copy.body : copy.thankYouBody}
          </p>

          {canRequest ? (
            <div className="mt-auto hidden pt-8 lg:flex lg:items-center lg:gap-4">
              <button
                type="button"
                onClick={onBook}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-bold text-[#1b3022] transition-[filter] hover:brightness-105"
                style={{ backgroundColor: "#ffd56b" }}
              >
                {copy.cta}
              </button>
              <p className="max-w-[13rem] text-[0.75rem] leading-snug text-[#b7c6bd]">
                {copy.footer}
              </p>
            </div>
          ) : null}

          {/* Mobile / tablet: expert under copy */}
          <div className="mt-6 lg:hidden">
            <ExpertRow
              name={copy.expertName}
              role={copy.expertRole}
              parentsBadge={copy.parentsBadge}
            />
          </div>
        </div>

        {/* Right: expert + benefit grid */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="hidden lg:block">
            <ExpertRow
              name={copy.expertName}
              role={copy.expertRole}
              parentsBadge={copy.parentsBadge}
            />
          </div>

          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            {COUNSELING_BENEFITS.map((benefit) => (
              <li
                key={benefit.id}
                className="flex gap-3 rounded-[18px] border border-white/12 px-3.5 py-3.5"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${benefit.iconClassName}`}
                >
                  <CounselingBenefitIcon icon={benefit.icon} />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-semibold leading-snug text-white">
                    {benefit.title}
                  </p>
                  <p className="mt-1 text-[0.6875rem] leading-[1.45] text-[#b8c7bf]">
                    {benefit.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {canRequest ? (
            <div className="mt-1 flex flex-col gap-2.5 lg:hidden">
              <button
                type="button"
                onClick={onBook}
                className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full px-5 text-sm font-bold text-[#1b3022] transition-[filter] hover:brightness-105"
                style={{ backgroundColor: "#ffd56b" }}
              >
                {copy.cta}
              </button>
              <p className="text-center text-[0.75rem] text-[#b7c6bd]">
                {copy.footer}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
