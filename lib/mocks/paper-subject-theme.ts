import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Aperture,
  Atom,
  Beaker,
  Binary,
  BookOpen,
  Bone,
  Box,
  Brain,
  CircuitBoard,
  Dna,
  Droplets,
  Eye,
  FlaskConical,
  Flower2,
  Footprints,
  Gauge,
  Globe,
  Heart,
  Hexagon,
  Layers,
  Leaf,
  Magnet,
  Microscope,
  Mountain,
  Move,
  Orbit,
  Pill,
  Radio,
  RefreshCw,
  Ruler,
  Scale,
  Shield,
  Sigma,
  Sparkles,
  Sprout,
  Stethoscope,
  Sun,
  Target,
  TestTube,
  Thermometer,
  Timer,
  TreeDeciduous,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import type { PaperCardKind } from "@/lib/mocks/paper-card-model";

export type PaperSubjectTheme = {
  /** Header band background utility class. */
  bandClass: string;
  /** Subject-level fallback icon when no topic keyword matches. */
  Icon: LucideIcon;
};

const MINT: PaperSubjectTheme = {
  bandClass: "bg-study-mint",
  Icon: Atom,
};

const PEACH: PaperSubjectTheme = {
  bandClass: "bg-study-peach",
  Icon: FlaskConical,
};

const LILAC: PaperSubjectTheme = {
  bandClass: "bg-study-lilac",
  Icon: Leaf,
};

const MATH: PaperSubjectTheme = {
  bandClass: "bg-study-mint",
  Icon: Sigma,
};

const DEFAULT: PaperSubjectTheme = {
  bandClass: "bg-study-mint",
  Icon: BookOpen,
};

type TopicIconRule = {
  /** Substrings matched against the lowercased topic name (any hit wins). */
  keywords: readonly string[];
  icon: LucideIcon;
};

/**
 * More specific NEET chapter keywords first. Matching is substring-based so
 * names like "Motion in a Straight Line" or "D and F Block Elements" work
 * without a full topic inventory.
 */
const TOPIC_ICON_RULES: readonly TopicIconRule[] = [
  // Physics — mechanics & properties
  { keywords: ["unit", "measurement", "dimension"], icon: Ruler },
  {
    keywords: ["kinematics", "straight line", "motion in a plane", "projectile"],
    icon: Move,
  },
  { keywords: ["laws of motion", "newton"], icon: Target },
  { keywords: ["work", "energy", "power"], icon: Zap },
  { keywords: ["gravitation", "gravity", "kepler"], icon: Globe },
  {
    keywords: ["mechanical properties", "elasticity", "viscosity", "fluid"],
    icon: Droplets,
  },
  { keywords: ["bulk modulus", "young"], icon: Layers },
  {
    keywords: ["thermodynamic", "heat transfer", "calorimetry"],
    icon: Thermometer,
  },
  { keywords: ["kinetic theory", "ideal gas"], icon: Wind },
  {
    keywords: ["oscillation", "wave", "sound", "doppler", "shm"],
    icon: Waves,
  },
  // Physics — electricity & magnetism
  {
    keywords: [
      "electrostatic",
      "coulomb",
      "gauss",
      "capacitance",
      "electric charge",
    ],
    icon: Sparkles,
  },
  {
    keywords: [
      "current electricity",
      "resistance",
      "kirchhoff",
      "wheatstone",
    ],
    icon: CircuitBoard,
  },
  {
    keywords: ["magnetic", "magnetism", "biot", "ampere", "moving charge"],
    icon: Magnet,
  },
  {
    keywords: [
      "electromagnetic induction",
      "alternating current",
      "ac circuit",
    ],
    icon: RefreshCw,
  },
  { keywords: ["electromagnetic wave"], icon: Radio },
  // Physics — optics & modern
  {
    keywords: [
      "ray optics",
      "wave optics",
      "optics",
      "lens",
      "mirror",
      "interference",
      "diffraction",
      "polarization",
    ],
    icon: Aperture,
  },
  { keywords: ["dual nature", "photoelectric", "photon"], icon: Eye },
  { keywords: ["atom", "nucleus", "nuclei", "radioactiv"], icon: Atom },
  {
    keywords: [
      "semiconductor",
      "electronic device",
      "diode",
      "transistor",
      "logic gate",
    ],
    icon: Binary,
  },
  { keywords: ["communication"], icon: Radio },
  { keywords: ["motion"], icon: Move },

  // Chemistry — physical / inorganic
  {
    keywords: ["basic concept", "mole concept", "stoichiometr"],
    icon: Scale,
  },
  { keywords: ["structure of atom", "atomic structure"], icon: Atom },
  { keywords: ["periodic", "classification of element"], icon: Layers },
  {
    keywords: [
      "chemical bonding",
      "molecular structure",
      "vsepr",
      "hybridisation",
      "hybridization",
    ],
    icon: Hexagon,
  },
  { keywords: ["states of matter", "gaseous", "liquid state"], icon: Wind },
  { keywords: ["equilibrium"], icon: Scale },
  { keywords: ["redox"], icon: RefreshCw },
  { keywords: ["hydrogen"], icon: Droplets },
  {
    keywords: [
      "s-block",
      "p-block",
      "d-block",
      "f-block",
      "d and f",
      "block element",
    ],
    icon: Box,
  },
  { keywords: ["coordination"], icon: Hexagon },
  { keywords: ["solution"], icon: Beaker },
  { keywords: ["electrochem"], icon: Zap },
  { keywords: ["chemical kinetic"], icon: Timer },
  { keywords: ["surface chem"], icon: Layers },
  { keywords: ["isolation", "metallurg"], icon: Mountain },
  { keywords: ["environmental chem"], icon: Leaf },
  { keywords: ["solid state"], icon: Box },
  // Chemistry — organic
  {
    keywords: [
      "organic",
      "hydrocarbon",
      "alcohol",
      "phenol",
      "ether",
      "aldehyde",
      "ketone",
      "carboxylic",
      "amine",
      "biomolecule",
      "polymer",
      "everyday life",
      "haloalkane",
      "haloarene",
    ],
    icon: FlaskConical,
  },
  { keywords: ["laboratory"], icon: TestTube },

  // Botany / plant biology
  { keywords: ["photosynthesis"], icon: Sun },
  {
    keywords: ["plant kingdom", "algae", "bryophyta", "pteridophyta"],
    icon: Sprout,
  },
  {
    keywords: [
      "morphology of flowering",
      "anatomy of flowering",
      "flowering plant",
    ],
    icon: Flower2,
  },
  { keywords: ["transport in plant", "mineral nutrition"], icon: Droplets },
  {
    keywords: ["respiration in plant", "plant growth", "plant development"],
    icon: Sprout,
  },
  {
    keywords: [
      "reproduction in flowering",
      "sexual reproduction in flowering",
    ],
    icon: Flower2,
  },

  // Shared bio / cell / genetics / ecology
  {
    keywords: ["cell cycle", "cell division", "cell the unit"],
    icon: Microscope,
  },
  { keywords: ["cell"], icon: Microscope },
  { keywords: ["biomolecule"], icon: Dna },
  {
    keywords: [
      "genetic",
      "inheritance",
      "molecular basis",
      "dna",
      "rna",
      "gene",
    ],
    icon: Dna,
  },
  { keywords: ["evolution"], icon: Footprints },
  { keywords: ["biotechnolog"], icon: Dna },
  {
    keywords: [
      "ecology",
      "ecosystem",
      "biodiversity",
      "environmental issue",
      "organism and population",
    ],
    icon: TreeDeciduous,
  },
  {
    keywords: ["living world", "biological classification", "diversity"],
    icon: Leaf,
  },

  // Zoology / human physiology
  { keywords: ["animal kingdom"], icon: Footprints },
  {
    keywords: ["structural organisation", "animal tissue", "frog"],
    icon: Bone,
  },
  {
    keywords: ["digestion", "absorption", "breathing", "exchange of gas"],
    icon: Activity,
  },
  { keywords: ["body fluid", "circulation", "excret"], icon: Droplets },
  { keywords: ["locomotion"], icon: Move },
  { keywords: ["neural control", "nervous"], icon: Brain },
  {
    keywords: ["chemical coordination", "endocrine", "hormone"],
    icon: Pill,
  },
  { keywords: ["reproduction", "reproductive health"], icon: Heart },
  { keywords: ["human health", "disease", "pathogen"], icon: Stethoscope },
  { keywords: ["immune"], icon: Shield },

  // Maths (if ever chapter-wise)
  {
    keywords: ["trigonometr", "calculus", "algebra", "matrix", "determin"],
    icon: Sigma,
  },
  { keywords: ["probability", "statistic"], icon: Gauge },
  {
    keywords: ["coordinate geometry", "conic"],
    icon: Orbit,
  },
];

/** Map subject display names to header band tint + subject fallback icon. */
export function paperSubjectTheme(
  subjectName: string | null
): PaperSubjectTheme {
  if (!subjectName) return DEFAULT;
  const key = subjectName.trim().toLowerCase();
  if (key.includes("physics")) return MINT;
  if (key.includes("chemistry")) return PEACH;
  if (
    key.includes("biology") ||
    key.includes("botany") ||
    key.includes("zoology")
  ) {
    return LILAC;
  }
  if (key.startsWith("math") || key.includes("mathematics")) return MATH;
  return DEFAULT;
}

/** Resolve a Lucide icon from a chapter/topic display name. */
export function resolveTopicIcon(
  topicName: string | null | undefined
): LucideIcon | null {
  if (!topicName) return null;
  const haystack = topicName.trim().toLowerCase();
  if (!haystack) return null;
  for (const rule of TOPIC_ICON_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.icon;
    }
  }
  return null;
}

/**
 * Chapter-wise: topic keywords → subject icon → BookOpen.
 * Full mocks / sprint: keep the existing subject/default icon.
 */
export function resolvePaperCardIcon(input: {
  kind: PaperCardKind;
  subjectName: string | null;
  topicName: string | null;
}): LucideIcon {
  const subject = paperSubjectTheme(input.subjectName);
  if (input.kind !== "chapter") {
    return subject.Icon;
  }
  return resolveTopicIcon(input.topicName) ?? subject.Icon;
}
