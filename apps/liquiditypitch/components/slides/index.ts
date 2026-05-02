import type { ComponentType } from "react";
import { SlideCover } from "./SlideCover";
import { SlideProtocol } from "./SlideProtocol";
import { SlideAmmoSquared } from "./SlideAmmoSquared";
import { SlideProblem } from "./SlideProblem";
import { SlideAsk } from "./SlideAsk";
import { SlideReturns } from "./SlideReturns";
import { SlideClose } from "./SlideClose";

export const SLIDES: ComponentType[] = [
  SlideCover,
  SlideProtocol,
  SlideAmmoSquared,
  SlideProblem,
  SlideAsk,
  SlideReturns,
  SlideClose,
];
