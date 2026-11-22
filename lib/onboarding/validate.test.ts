import { describe, expect, it } from "vitest";
import {
  MAX_NAME_LENGTH,
  NAME_INVALID_MESSAGE,
  NAME_LINK_MESSAGE,
  initialNameFor,
  isPlaceholderName,
  isValidName,
  looksLikeLink,
  normalizeName,
  sanitizeName,
  validateName,
} from "@/lib/onboarding/validate";

// Invisible and hostile characters are built from code points on purpose.
const cp = (...points: number[]) => String.fromCodePoint(...points);
const ZWSP = cp(0x200b);
const ZWNJ = cp(0x200c);
const ZWJ = cp(0x200d);
const LRM = cp(0x200e);
const RLM = cp(0x200f);
const RLO = cp(0x202e);
const PDF = cp(0x202c);
const LRI = cp(0x2066);
const PDI = cp(0x2069);
const BOM = cp(0xfeff);
const SOFT_HYPHEN = cp(0x00ad);
const NBSP = cp(0x00a0);
const IDEOGRAPHIC_SPACE = cp(0x3000);
const LINE_SEPARATOR = cp(0x2028);
const HANGUL_FILLER = cp(0x3164);
const BRAILLE_BLANK = cp(0x2800);
const PRIVATE_USE = cp(0xe000);
const LONE_SURROGATE = String.fromCharCode(0xd800);
const NUL = String.fromCharCode(0);
const ACUTE = cp(0x0301);
const ROCKET = cp(0x1f680);

describe("placeholder and prefill", () => {
  it("recognises the placeholder given to OTP sign-ups", () => {
    expect(isPlaceholderName("User 7890")).toBe(true);
    expect(isPlaceholderName("  User 0001 ")).toBe(true);
    expect(isPlaceholderName("User Kumar")).toBe(false);
    expect(isPlaceholderName("User 12")).toBe(false);
  });

  it("prefills real names (cleaned) and never the placeholder", () => {
    expect(initialNameFor("Rahul Sharma")).toBe("Rahul Sharma");
    expect(initialNameFor("  Rahul  ")).toBe("Rahul");
    expect(initialNameFor(`Ra${ZWSP}hul`)).toBe("Rahul");
    expect(initialNameFor("User 7890")).toBe("");
    expect(initialNameFor(undefined)).toBe("");
    expect(initialNameFor("")).toBe("");
  });
});

describe("sanitizeName (same behaviour as the API)", () => {
  it.each([
    ["composes to NFC", `e${ACUTE}`, "é"],
    ["zero-width space", `Ra${ZWSP}hul`, "Rahul"],
    ["byte order mark", `${BOM}Rahul`, "Rahul"],
    ["soft hyphen", `Ra${SOFT_HYPHEN}hul`, "Rahul"],
    ["bidi override / pop", `${RLO}evil${PDF}`, "evil"],
    ["bidi marks and isolates", `${LRM}Ra${RLM}hul${LRI}${PDI}`, "Rahul"],
    ["NUL and other controls", `Rahul${NUL}Sharma`, "RahulSharma"],
    ["newlines and tabs become a space", "Rahul\n\tSharma", "Rahul Sharma"],
    [
      "NBSP / ideographic space / LS become a space",
      `Rahul${NBSP}${IDEOGRAPHIC_SPACE}${LINE_SEPARATOR}Sharma`,
      "Rahul Sharma",
    ],
    ["Hangul filler", HANGUL_FILLER, ""],
    ["Braille blank", `${BRAILLE_BLANK}Rahul`, "Rahul"],
    ["private use", `Ra${PRIVATE_USE}hul`, "Rahul"],
    ["lone surrogate", `Ra${LONE_SURROGATE}hul`, "Rahul"],
    ["whitespace runs and edges", "   Rahul     Sharma  ", "Rahul Sharma"],
  ])("%s", (_label, input, expected) => {
    expect(sanitizeName(input)).toBe(expected);
  });

  it("keeps joiners between letters and drops the rest", () => {
    const persian = `می${ZWNJ}خواهم`;
    expect(sanitizeName(persian)).toBe(persian);
    expect(sanitizeName(`क${ZWJ}ष`)).toBe(`क${ZWJ}ष`);
    expect(sanitizeName(`${ZWNJ}Rahul`)).toBe("Rahul");
    expect(sanitizeName(`Rahul${ZWJ}`)).toBe("Rahul");
    expect(sanitizeName(`Rahul${ZWNJ} Sharma`)).toBe("Rahul Sharma");
    expect(sanitizeName(`Ra${ZWNJ}${ZWJ}${ZWNJ}hul`)).toBe(`Ra${ZWNJ}hul`);
  });

  it("caps stacked combining marks and stays idempotent", () => {
    const cleaned = sanitizeName(`a${ACUTE.repeat(40)}`);
    expect(cleaned.normalize("NFD").replace(/[^\p{M}]/gu, "").length).toBeLessThanOrEqual(7);
    expect(sanitizeName(cleaned)).toBe(cleaned);
  });

  it("normalises after stripping, so removing a character cannot change a second pass", () => {
    const input = `e${ZWSP}${ACUTE}`;
    expect(sanitizeName(input)).toBe("é");
    expect(sanitizeName(sanitizeName(input))).toBe("é");
  });

  it("normalizeName is the same cleaner", () => {
    expect(normalizeName("  rahul    sharma ")).toBe("rahul sharma");
    expect(normalizeName("McDonald")).toBe("McDonald");
  });
});

describe("isValidName (same verdicts as the API)", () => {
  it.each([
    "Rahul",
    "Rahul Sharma",
    "Rahul K.",
    "J.K. Rowling",
    "Dr. Rahul Sharma, Jr.",
    "O'Brien",
    "O’Brien",
    "Mary-Jane Watson",
    "José García",
    "Müller",
    "Nguyễn Văn An",
    "李雷",
    "राहुल शर्मा",
    "محمد علي",
    "McDonald",
    "de Souza",
    "Rahul (Rocky) Sharma",
    "John 2",
    "A",
  ])("accepts %s", (name) => {
    expect(isValidName(name)).toBe(true);
  });

  it.each([
    ["script tag", "<script>alert(1)</script>"],
    ["an HTML entity", "Rahul &amp; Co"],
    ["quotes", 'Rahul "The Great"'],
    ["a backtick", "Rahul`id`"],
    ["a slash", "Rahul/Sharma"],
    ["a backslash", "Rahul\\Sharma"],
    ["an @", "John@Doe"],
    ["a colon", "javascript:alert"],
    ["a semicolon", "Rahul; DROP TABLE users"],
    ["an equals sign", "Rahul=1"],
    ["template syntax", "{{7*7}}"],
    ["square brackets", "Rahul[0]"],
    ["a pipe", "Rahul|id"],
    ["a dollar sign", "$ne"],
    ["an emoji", `Rahul ${ROCKET}`],
    ["a spreadsheet formula", "=1+1"],
    ["a leading plus", "+919876543210"],
    ["a leading minus", "-2+3"],
    ["a leading @", "@SUM(A1)"],
    ["a leading dot", ".Rahul"],
    ["a trailing hyphen", "Rahul-"],
    ["a trailing apostrophe", "Rahul'"],
    ["only digits", "12345"],
    ["only punctuation", "..."],
    ["consecutive spaces", "Rahul  Sharma"],
    ["a leading space", " Rahul"],
    ["a trailing space", "Rahul "],
    ["a newline", "Rahul\nSharma"],
    ["a zero-width space", `Ra${ZWSP}hul`],
    ["a bidi override", `${RLO}Rahul`],
    ["a NUL byte", `Rahul${NUL}`],
    ["a NBSP", `Rahul${NBSP}Sharma`],
    ["a Hangul filler", `Rahul${HANGUL_FILLER}`],
    ["a trailing joiner", `Rahul${ZWNJ}`],
    ["a repeated joiner", `Ra${ZWNJ}${ZWNJ}hul`],
    ["stacked combining marks", `a${ACUTE.repeat(7)}`],
    ["a web address", "www.evil.com"],
    ["a domain", "evil.com"],
    ["a domain inside text", "Visit evil.com now"],
    ["empty", ""],
  ])("rejects %s", (_label, value) => {
    expect(isValidName(value)).toBe(false);
  });

  it("does not mistake ordinary names for links", () => {
    expect(looksLikeLink("Rahul K.")).toBe(false);
    expect(looksLikeLink("Kumar Net")).toBe(false);
    expect(looksLikeLink("Anne Co")).toBe(false);
    expect(looksLikeLink("www.example.org")).toBe(true);
    expect(looksLikeLink("rahul.io")).toBe(true);
  });

  it.each(["Priya S.In", "Anil K.Me", "Rahul M.Co", "Anita S.Io", "R.K.Narayan", "J.K. Rowling"])(
    "does not mistake the initials in %s for a domain",
    (name) => {
      expect(looksLikeLink(name)).toBe(false);
      expect(isValidName(name)).toBe(true);
      expect(validateName(name)).toBeNull();
    }
  );

  it.each(["evil.com", "Visit evil.com now", "WWW.EVIL.COM", "click rahul.io"])(
    "still catches the real address %s",
    (name) => {
      expect(looksLikeLink(name)).toBe(true);
      expect(validateName(name)).toBe(NAME_LINK_MESSAGE);
    }
  );
});

describe("validateName messages", () => {
  it.each([
    ["Rahul", null],
    ["Rahul K.", null],
    ["José García", null],
    ["李雷", null],
    ["McDonald", null],
    ["Ra  hul", null], // spaces are collapsed before checking
    [`Ra${ZWSP}hul`, null], // invisible characters are cleaned, not blamed on the learner
    [`${RLO}Rahul${PDF}`, null],
    ["", "Add your name."],
    ["   ", "Add your name."],
    [`${ZWSP}${HANGUL_FILLER}`, "Add your name."],
    ["A", "Name needs at least 2 characters."],
    ["a".repeat(MAX_NAME_LENGTH + 1), "Name is too long."],
    ["www.evil.com", NAME_LINK_MESSAGE],
    ["click evil.com now", NAME_LINK_MESSAGE],
    ["<b>Rahul</b>", NAME_INVALID_MESSAGE],
    ["Rahul`id`", NAME_INVALID_MESSAGE],
    ["=1+1", NAME_INVALID_MESSAGE],
    ["-Rahul", NAME_INVALID_MESSAGE],
    [`Rahul ${ROCKET}`, NAME_INVALID_MESSAGE],
    ["12345", NAME_INVALID_MESSAGE],
  ])("validates %j", (input, expected) => {
    expect(validateName(input)).toBe(expected);
  });
});

describe("hostile input, many shapes at once", () => {
  const pool = [
    "<", ">", "&", '"', "'", "`", "/", "\\", "=", "+", "@", "|", ";", ":", "{",
    "}", "[", "]", "$", "%", "^", "*", "!", "?", "~", "#", " ", "\n", "\t", ".",
    ",", "-", "(", ")", "_", "a", "b", "Z", "5", "é", "李", "ä",
    "’", ZWSP, ZWNJ, ZWJ, RLO, PDF, BOM, HANGUL_FILLER, NBSP, ACUTE, ROCKET,
    LONE_SURROGATE, NUL, PRIVATE_USE, "www.", ".com", "javascript:",
  ];

  let seed = 20260101;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const randomString = () => {
    const length = Math.floor(next() * 60);
    let out = "";
    for (let i = 0; i < length; i += 1) out += pool[Math.floor(next() * pool.length)];
    return out;
  };

  it("sanitize is idempotent, and anything validateName accepts is clean and valid", () => {
    for (let i = 0; i < 3000; i += 1) {
      const input = randomString();
      const cleaned = sanitizeName(input);
      expect(sanitizeName(cleaned)).toBe(cleaned);

      if (validateName(input) === null) {
        expect(isValidName(cleaned)).toBe(true);
        expect(cleaned).not.toMatch(/[<>&"`/\\=@|;:{}$%^*!?~#[\]+]/);
        expect(() => encodeURIComponent(cleaned)).not.toThrow();
      }
    }
  });
});
