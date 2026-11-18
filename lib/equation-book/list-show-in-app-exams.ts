import { getExamsByCategory } from "@/lib/api/exams";
import type { EquationExamOption } from "@/types/equation-book";

/** Flatten showInApp exams from the student mocks catalog. */
export async function listShowInAppExams(): Promise<EquationExamOption[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const exams: EquationExamOption[] = [];
  const seen = new Set<string>();

  while (page <= totalPages) {
    const result = await getExamsByCategory({ page, limit: pageSize });
    if (!result.ok) break;

    for (const category of result.data.categories) {
      for (const exam of category.exams) {
        if (seen.has(exam.id)) continue;
        seen.add(exam.id);
        exams.push({ id: exam.id, name: exam.title });
      }
    }

    totalPages = result.data.pagination.totalPages || 1;
    page += 1;
    if (page > 10) break;
  }

  return exams;
}
