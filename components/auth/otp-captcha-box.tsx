import type { RefObject } from "react";
import { CAPTCHA_WIDTH } from "@/hooks/use-otp-verification";

type OtpCaptchaBoxProps = {
  boxRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
  fit: { scale: number; height: number };
  elementId: string;
  visible: boolean;
};

/**
 * Where the MSG91 widget draws its human check, scaled down to fit a narrow
 * card. Always mounted (only hidden) because MSG91 keeps a reference to it.
 */
export function OtpCaptchaBox({
  boxRef,
  innerRef,
  fit,
  elementId,
  visible,
}: OtpCaptchaBoxProps) {
  return (
    <div
      ref={boxRef}
      className={visible ? "relative w-full overflow-hidden" : "hidden"}
      style={{ height: fit.height }}
    >
      <div
        ref={innerRef}
        id={elementId}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: CAPTCHA_WIDTH,
          transform: `translateX(-50%) scale(${fit.scale})`,
          transformOrigin: "top center",
        }}
      />
    </div>
  );
}
