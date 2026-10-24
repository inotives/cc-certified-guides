import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ExamContent } from '../types.js';
import { domains } from './domains.js';
import { plan } from './plan.js';
import { scenarios } from './scenarios.js';

export const architectProfessional: ExamContent = {
  slug: 'architect-professional',
  base: '/architect-professional',
  brand: 'CCAR-P',
  code: 'CCAR-P',
  name: 'Claude Certified Architect – Professional',
  domains,
  // Unofficial study case studies; the real exam has standalone items only.
  scenarios,
  caseStudies: true,
  plan,
  questionsDir: join(dirname(fileURLToPath(import.meta.url)), 'questions'),
  guideFile: 'docs/guides/architect-professional.txt',
  studyNotes: true,
  // Blueprint 17/13/19/16/14/14/7% of 63 items. No scenariosPerSitting: the mock is chosen by domain targets alone.
  mock: { items: 63, minutes: 120, domainTargets: { 1: 11, 2: 8, 3: 12, 4: 10, 5: 9, 6: 9, 7: 4 } },
  officialSamples: 3,
};
