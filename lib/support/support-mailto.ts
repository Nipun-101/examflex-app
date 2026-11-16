import { brand } from "@/lib/brand";

export function supportMailto(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return query
    ? `mailto:${brand.supportEmail}?${query}`
    : `mailto:${brand.supportEmail}`;
}
