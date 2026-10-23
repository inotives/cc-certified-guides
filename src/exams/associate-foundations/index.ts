import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ExamContent } from '../types.js';
import { domains } from './domains.js';
import { plan } from './plan.js';

export const associateFoundations: ExamContent = {
  slug: 'associate-foundations',
  base: '/associate-foundations',
  brand: 'CCAO-F',
  code: 'CCAO-F',
  name: 'Claude Certified Associate – Foundations',
  domains,
  scenarios: [],
  plan,
  questionsDir: join(dirname(fileURLToPath(import.meta.url)), 'questions'),
  guideFile: 'docs/guides/associate-foundations.txt',
  studyNotes: true,
  // Blueprint 14/21/12/16/12/15/10% of 60 items; no scenarios.
  mock: { items: 60, minutes: 120, domainTargets: { 1: 8, 2: 13, 3: 7, 4: 10, 5: 7, 6: 9, 7: 6 } },
  officialSamples: 3,
};
