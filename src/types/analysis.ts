// src/types/analysis.ts
export enum Likelihood {
  VeryUnlikely = "VERY_UNLIKELY",
  Unlikely = "UNLIKELY",
  Possible = "POSSIBLE",
  Likely = "LIKELY",
  VeryLikely = "VERY_LIKELY",
}

export type Label = {
  description: string;
  score: number;
};

export type Color = {
  red: number;
  green: number;
  blue: number;
};

export type DetectedObject = {
  name: string;
  score: number;
};

export type FaceAnalysis = {
  joyLikelihood: Likelihood;
  sorrowLikelihood: Likelihood;
  angerLikelihood: Likelihood;
  surpriseLikelihood: Likelihood;
  bounds: Array<{ x: number; y: number }>;
};

export interface Story {
  introduction?: string;
  rising_action?: string;
  twist?: string;
  climax?: string;
  resolution?: string;
  images?: {
    introduction?: string;
    rising_action?: string;
    twist?: string;
    climax?: string;
    resolution?: string;
  };
}

export type Analysis = {
  labels?: Label[];
  colors?: Color[];
  objects?: DetectedObject[];
  web?: {
    entities?: Array<{ description: string }>;
  };
  faces?: FaceAnalysis[];
  landmarks?: Array<{ name: string }>;
  texts?: Array<{ content: string }>;
  logos?: Array<{ name: string }>;
  safeSearch?: {
    adult?: Likelihood;
    violence?: Likelihood;
  };
  story?: Story;
};

export type AnalysisApiResponse = {
  analysis: Analysis;
  imageUrls: {
    introduction?: string;
    rising_action?: string;
    twist?: string;
    climax?: string;
    resolution?: string;
  };
};
