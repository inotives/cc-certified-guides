import type { ExamContent } from './types.js';
import { architectFoundations } from './architect-foundations/index.js';
import { architectProfessional } from './architect-professional/index.js';
import { associateFoundations } from './associate-foundations/index.js';
import { developerFoundations } from './developer-foundations/index.js';

/** Every exam that has a study site, in certification-path order. */
export const exams: ExamContent[] = [associateFoundations, developerFoundations, architectFoundations, architectProfessional];
export const examBySlug = (slug: string) => exams.find((e) => e.slug === slug);
