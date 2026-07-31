import type { SemanticTypographyTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

/** Semantic typography roles — compose primitive typography refs */
export const typography = {
  headingXl: {
    fontSize: createTokenRef("typography.fontSize.headingXl"),
    fontWeight: createTokenRef("typography.fontWeight.bold"),
    lineHeight: createTokenRef("typography.lineHeight.tight"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  headingLg: {
    fontSize: createTokenRef("typography.fontSize.headingLg"),
    fontWeight: createTokenRef("typography.fontWeight.bold"),
    lineHeight: createTokenRef("typography.lineHeight.tight"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  headingMd: {
    fontSize: createTokenRef("typography.fontSize.headingMd"),
    fontWeight: createTokenRef("typography.fontWeight.semibold"),
    lineHeight: createTokenRef("typography.lineHeight.tight"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  headingSm: {
    fontSize: createTokenRef("typography.fontSize.headingSm"),
    fontWeight: createTokenRef("typography.fontWeight.semibold"),
    lineHeight: createTokenRef("typography.lineHeight.tight"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  section: {
    fontSize: createTokenRef("typography.fontSize.section"),
    fontWeight: createTokenRef("typography.fontWeight.semibold"),
    lineHeight: createTokenRef("typography.lineHeight.tight"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  bodyLg: {
    fontSize: createTokenRef("typography.fontSize.bodyLg"),
    fontWeight: createTokenRef("typography.fontWeight.regular"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  body: {
    fontSize: createTokenRef("typography.fontSize.body"),
    fontWeight: createTokenRef("typography.fontWeight.regular"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  bodySm: {
    fontSize: createTokenRef("typography.fontSize.bodySm"),
    fontWeight: createTokenRef("typography.fontWeight.regular"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  label: {
    fontSize: createTokenRef("typography.fontSize.label"),
    fontWeight: createTokenRef("typography.fontWeight.medium"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  labelSm: {
    fontSize: createTokenRef("typography.fontSize.labelSm"),
    fontWeight: createTokenRef("typography.fontWeight.medium"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  caption: {
    fontSize: createTokenRef("typography.fontSize.caption"),
    fontWeight: createTokenRef("typography.fontWeight.regular"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  captionXs: {
    fontSize: createTokenRef("typography.fontSize.captionXs"),
    fontWeight: createTokenRef("typography.fontWeight.regular"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.sans"),
  },
  code: {
    fontSize: createTokenRef("typography.fontSize.code"),
    fontWeight: createTokenRef("typography.fontWeight.regular"),
    lineHeight: createTokenRef("typography.lineHeight.normal"),
    fontFamily: createTokenRef("typography.fontFamily.mono"),
  },
} as const satisfies SemanticTypographyTokens;
