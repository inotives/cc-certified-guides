import type { ExamContent } from '../exams/types.js';
import * as architectFoundations from '../exams/architect-foundations/pages.js';
import * as architectProfessional from '../exams/architect-professional/pages.js';
import * as associateFoundations from '../exams/associate-foundations/pages.js';
import * as developerFoundations from '../exams/developer-foundations/pages.js';

/** Hand-written page bodies that differ per exam (exam focus guide, cheat sheet). */
interface ExamPages {
  guideBody(exam: ExamContent): string;
  cheatsheetBody(exam: ExamContent): string;
}

export const examPages: Record<string, ExamPages> = {
  'associate-foundations': associateFoundations,
  'architect-foundations': architectFoundations,
  'architect-professional': architectProfessional,
  'developer-foundations': developerFoundations,
};
