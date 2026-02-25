import type { ComponentType } from "react";
import { SlideCover } from "./SlideCover";
import { SlideProblem } from "./SlideProblem";
import { SlideWhyNow } from "./SlideWhyNow";
import { SlideSolution } from "./SlideSolution";
import { SlideUseCases } from "./SlideUseCases";
import { SlideRegulatory } from "./SlideRegulatory";
import { SlideClose } from "./SlideClose";

export const SLIDES: ComponentType[] = [
  SlideCover,
  SlideProblem,
  SlideWhyNow,
  SlideSolution,
  SlideUseCases,
  SlideRegulatory,
  SlideClose,
];
