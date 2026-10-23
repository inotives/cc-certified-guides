import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ExamContent } from '../types.js';
import { domains } from './domains.js';
import { plan } from './plan.js';

export const developerFoundations: ExamContent = {
  slug: 'developer-foundations',
  base: '/developer-foundations',
  brand: 'CCD-F',
  code: 'CCDV-F',
  name: 'Claude Certified Developer – Foundations',
  domains,
  scenarios: [],
  plan,
  questionsDir: join(dirname(fileURLToPath(import.meta.url)), 'questions'),
  guideFile: 'docs/guides/developer-foundations.txt',
  studyNotes: true,
  // Blueprint 14.7/33.1/3.1/2.6/16.8/11.0/8.1/10.6% of 53 items; no scenarios.
  mock: { items: 53, minutes: 120, domainTargets: { 1: 8, 2: 18, 3: 2, 4: 1, 5: 9, 6: 6, 7: 4, 8: 5 } },
  officialSamples: 3,
};
