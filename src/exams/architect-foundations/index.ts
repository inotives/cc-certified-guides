import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ExamContent } from '../types.js';
import { domains } from './domains.js';
import { plan } from './plan.js';
import { scenarios } from './scenarios.js';

export const architectFoundations: ExamContent = {
  slug: 'architect-foundations',
  base: '/architect-foundations',
  brand: 'CCA-F',
  code: 'CCAR-F',
  name: 'Claude Certified Architect – Foundations',
  domains,
  scenarios,
  plan,
  questionsDir: join(dirname(fileURLToPath(import.meta.url)), 'questions'),
  guideFile: 'docs/guides/architect-foundations.txt',
  // Blueprint 27/18/20/20/15% of 60 items; 4 of the 6 scenarios per sitting.
  mock: { items: 60, minutes: 120, domainTargets: { 1: 16, 2: 11, 3: 12, 4: 12, 5: 9 }, scenariosPerSitting: 4 },
  officialSamples: 12,
};
