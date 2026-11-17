import { describe, expect, it } from "vitest";
import {
  Aperture,
  Atom,
  BookOpen,
  Box,
  Dna,
  FlaskConical,
  Microscope,
  Move,
  Ruler,
  Sigma,
  Sprout,
  Zap,
} from "lucide-react";
import {
  paperSubjectTheme,
  resolvePaperCardIcon,
  resolveTopicIcon,
} from "@/lib/mocks/paper-subject-theme";

describe("paperSubjectTheme", () => {
  it("maps known subjects to band tints and summary bars", () => {
    expect(paperSubjectTheme("Physics").bandClass).toBe("bg-study-mint");
    expect(paperSubjectTheme("Physics").summaryBarColor).toBe("#daec9b");
    expect(paperSubjectTheme("Organic Chemistry").bandClass).toBe(
      "bg-study-peach"
    );
    expect(paperSubjectTheme("Organic Chemistry").summaryBarColor).toBe(
      "#f2b07a"
    );
    expect(paperSubjectTheme("Botany").bandClass).toBe("bg-study-lilac");
    expect(paperSubjectTheme("Botany").summaryBarColor).toBe("#cbbce8");
    expect(paperSubjectTheme("Mathematics").bandClass).toBe("bg-study-mint");
    expect(paperSubjectTheme("Maths").bandClass).toBe("bg-study-mint");
  });

  it("falls back for unknown or missing subjects", () => {
    expect(paperSubjectTheme(null).bandClass).toBe("bg-study-mint");
    expect(paperSubjectTheme("English").bandClass).toBe("bg-study-mint");
    expect(paperSubjectTheme(null).Icon).toBe(BookOpen);
  });
});

describe("resolveTopicIcon", () => {
  it("matches common NEET chapter keywords", () => {
    expect(resolveTopicIcon("Units and Measurements")).toBe(Ruler);
    expect(resolveTopicIcon("Motion in a Straight Line")).toBe(Move);
    expect(resolveTopicIcon("Work, Energy and Power")).toBe(Zap);
    expect(resolveTopicIcon("Ray Optics and Optical Instruments")).toBe(
      Aperture
    );
    expect(resolveTopicIcon("Some Basic Principles of Organic Chemistry")).toBe(
      FlaskConical
    );
    expect(resolveTopicIcon("D and F Block Elements")).toBe(Box);
    expect(resolveTopicIcon("Cell Cycle and Cell Division")).toBe(Microscope);
    expect(resolveTopicIcon("Principles of Inheritance and Variation")).toBe(
      Dna
    );
  });

  it("returns null for blank or unmatched names", () => {
    expect(resolveTopicIcon(null)).toBeNull();
    expect(resolveTopicIcon("   ")).toBeNull();
    expect(resolveTopicIcon("Totally Unknown Chapter XYZ")).toBeNull();
  });
});

describe("resolvePaperCardIcon", () => {
  it("uses topic keywords for chapter-wise cards", () => {
    expect(
      resolvePaperCardIcon({
        kind: "chapter",
        subjectName: "Physics",
        topicName: "Kinematics",
      })
    ).toBe(Move);
  });

  it("falls back to the subject icon, then BookOpen", () => {
    expect(
      resolvePaperCardIcon({
        kind: "chapter",
        subjectName: "Physics",
        topicName: "Mystery Chapter",
      })
    ).toBe(Atom);
    expect(
      resolvePaperCardIcon({
        kind: "chapter",
        subjectName: "Chemistry",
        topicName: null,
      })
    ).toBe(FlaskConical);
    expect(
      resolvePaperCardIcon({
        kind: "chapter",
        subjectName: null,
        topicName: null,
      })
    ).toBe(BookOpen);
  });

  it("keeps subject/default icons for full mocks and sprint", () => {
    expect(
      resolvePaperCardIcon({
        kind: "full",
        subjectName: "Physics",
        topicName: "Kinematics",
      })
    ).toBe(Atom);
    expect(
      resolvePaperCardIcon({
        kind: "sprint",
        subjectName: null,
        topicName: "Organic Chemistry",
      })
    ).toBe(BookOpen);
    expect(
      resolvePaperCardIcon({
        kind: "full",
        subjectName: "Mathematics",
        topicName: null,
      })
    ).toBe(Sigma);
    expect(
      resolvePaperCardIcon({
        kind: "chapter",
        subjectName: "Botany",
        topicName: "Plant Kingdom",
      })
    ).toBe(Sprout);
  });
});
