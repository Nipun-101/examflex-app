export const SUPPORT_PATHS = {
  help: "/help",
  contact: "/contact",
  faqs: "/faqs",
} as const;

export const SUPPORT_NAV = [
  { href: SUPPORT_PATHS.help, label: "Help centre" },
  { href: SUPPORT_PATHS.contact, label: "Contact us" },
  { href: SUPPORT_PATHS.faqs, label: "FAQs" },
] as const;

export type SupportPath = (typeof SUPPORT_NAV)[number]["href"];
