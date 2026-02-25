import type { ComponentType } from "react";
import { SlideCover } from "./SlideCover";
import { SlideProblem } from "./SlideProblem";
import { SlideWhyNow } from "./SlideWhyNow";
import { SlideMarket } from "./SlideMarket";
import { SlideSolution } from "./SlideSolution";
import { SlideUseCases } from "./SlideUseCases";
import { SlideTraction } from "./SlideTraction";
import { SlideRegulatory } from "./SlideRegulatory";
import { SlideClose } from "./SlideClose";

export const SLIDES: ComponentType[] = [
  SlideCover,
  SlideProblem,
  SlideWhyNow,
  SlideMarket,
  SlideSolution,
  SlideUseCases,
  SlideTraction,
  SlideRegulatory,
  SlideClose,
];
