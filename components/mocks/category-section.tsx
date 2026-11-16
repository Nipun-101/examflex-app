import type { ApiExamCategory } from "@/types/exam";
import { ExamTile } from "@/components/mocks/exam-tile";

type CategorySectionProps = {
  category: ApiExamCategory;
};

export function CategorySection({ category }: CategorySectionProps) {
  if (!category.exams.length) return null;

  return (
    <section
      id={`mocks-category-${category.id}`}
      className="scroll-mt-28"
      aria-labelledby={`mocks-category-heading-${category.id}`}
    >
      <h2
        id={`mocks-category-heading-${category.id}`}
        className="font-display text-xl font-semibold tracking-tight text-study-ink sm:text-2xl"
      >
        {category.name}
      </h2>
      {category.description ? (
        <p className="mt-1 max-w-2xl text-sm text-study-muted-soft">
          {category.description}
        </p>
      ) : null}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {category.exams.map((exam) => (
          <ExamTile
            key={exam.id}
            examId={exam.id}
            title={exam.title}
            imageUrl={category.imageUrl}
            testsCount={exam.testsCount}
            trending={exam.trending}
          />
        ))}
      </div>
    </section>
  );
}
