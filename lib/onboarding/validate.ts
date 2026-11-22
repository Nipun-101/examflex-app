/**
 * Mirrors the API's name rules (examflex-api/src/common/person-name.ts) so the
 * browser never blocks a name the server accepts, or the reverse. The API is the
 * authority; this exists to give an immediate, clear message and to clean what
 * a learner pastes.
 *
 * Invisible and hostile characters are built from code points on purpose, so no
 * source file depends on how an editor or tool renders (or drops) them.
 */

export const MAX_NAME_LENGTH = 100;

const MAX_COMBINING_MARKS_IN_A_ROW = 6;

const cp = (...points: number[]) => String.fromCodePoint(...points);
const ZWNJ = cp(0x200c);
const ZWJ = cp(0x200d);

/** Newline-like controls, plus NEL / line / paragraph separators. */
const LINE_BREAKS = new RegExp(`[\\t\\n\\r\\f\\v${cp(0x85, 0x2028, 0x2029)}]`, "g");
/** Invisible letters/marks no Unicode category check removes (fillers, blanks). */
const INVISIBLE_FILLERS = new RegExp(
  `[${cp(0x115f, 0x1160, 0x17b4, 0x17b5, 0x180e, 0x2800, 0x3164, 0xffa0)}]`,
  "gu"
);
const ZERO_WIDTH_JOINERS = new RegExp(`[${ZWNJ}${ZWJ}]+`, "g");

/** Letters of any script, marks, digits, space and the punctuation names use. */
const ALLOWED = `\\p{L}\\p{M}\\p{N} .,'${cp(0x2019, 0x2018)}\\-()_${ZWNJ}${ZWJ}`;
const PERSON_NAME = new RegExp(
  `^[\\p{L}\\p{N}](?:[${ALLOWED}]*[\\p{L}\\p{M}\\p{N}.)])?$`,
  "u"
);
const COMBINING_MARK_STACK = new RegExp(
  `(\\p{M}{${MAX_COMBINING_MARKS_IN_A_ROW}})\\p{M}+`,
  "gu"
);

/**
 * A name that is really a link (spam / phishing in a greeting). A domain needs
 * at least two characters before its dot, so initials such as "Priya S.In" or
 * "Anil K.Me" are never mistaken for one.
 */
const LOOKS_LIKE_LINK =
  /(?:^|\s)www\.|[\p{L}\p{N}]{2,}\.(?:com|net|org|in|io|co|me|xyz|info|app|dev|ly|tk|ml|ga|cf|gq|ru|cn|top|site|online|link|click)(?=$|[\s,)])/iu;

export function looksLikeLink(name: string): boolean {
  return LOOKS_LIKE_LINK.test(name);
}

/**
 * Normalise Unicode (NFC), turn all whitespace into one space, and remove
 * control, zero-width, bidi-override, private-use and unassigned characters,
 * lone surrogates, invisible fillers and stacked combining marks. Zero-width
 * joiners survive only between two letters. Never throws; idempotent.
 */
export function sanitizeName(input: string): string {
  let name = input;

  name = name.replace(LINE_BREAKS, " ");
  name = name.replace(/\p{Zs}/gu, " ");
  name = name.replace(INVISIBLE_FILLERS, "");
  name = name.replace(/[\p{Cc}\p{Cf}\p{Co}\p{Cn}\p{Cs}]/gu, (character) =>
    character === ZWNJ || character === ZWJ ? character : ""
  );

  name = name.replace(ZERO_WIDTH_JOINERS, (run, offset: number, whole: string) => {
    const before = whole.slice(0, offset);
    const after = whole.slice(offset + run.length);
    return /[\p{L}\p{M}]$/u.test(before) && /^[\p{L}\p{M}]/u.test(after)
      ? run[0] ?? ""
      : "";
  });

  // After everything invisible is gone, so a second pass changes nothing.
  name = name.normalize("NFC");
  name = name.replace(COMBINING_MARK_STACK, "$1");
  return name.replace(/ +/g, " ").trim();
}

/** What a learner's typed name becomes before it is validated or sent. */
export const normalizeName = sanitizeName;

/** True only for a name that is already clean and uses the allowed alphabet. */
export function isValidName(name: string): boolean {
  return (
    name.length > 0 &&
    sanitizeName(name) === name &&
    /\p{L}/u.test(name) &&
    PERSON_NAME.test(name) &&
    !looksLikeLink(name)
  );
}

/** OTP sign-ups start with a placeholder such as "User 7890". */
const PLACEHOLDER_NAME = /^User \d{4}$/;

export function isPlaceholderName(name: string): boolean {
  return PLACEHOLDER_NAME.test(name.trim());
}

/** The name to prefill: Google's real name (cleaned), but never the placeholder. */
export function initialNameFor(name: string | undefined): string {
  if (!name || isPlaceholderName(name)) return "";
  return sanitizeName(name);
}

export const NAME_INVALID_MESSAGE =
  "Use letters, numbers, spaces and . , ' - ( ) only.";
export const NAME_LINK_MESSAGE =
  "That looks like a web address. Please enter your name.";

/** Returns an error message, or null when the name is acceptable. */
export function validateName(raw: string): string | null {
  const name = sanitizeName(raw);
  if (name.length === 0) return "Add your name.";
  if (name.length < 2) return "Name needs at least 2 characters.";
  if (name.length > MAX_NAME_LENGTH) return "Name is too long.";
  if (looksLikeLink(name)) return NAME_LINK_MESSAGE;
  if (!isValidName(name)) return NAME_INVALID_MESSAGE;
  return null;
}
