import { GradeMilestoneItem } from "@/types/report.types";

type Exam = {
    exam_index: number;
    id: number;
    documentId: string;
    title: string;
    status: "opened" | "closed"
};

export const getLatestOpenedExamBeforeClosed = (gradeMilestones: GradeMilestoneItem[]) => {
    return gradeMilestones.map(grade => {
        const exams = grade.exams;
        // Find the index of the first closed exam
        const firstClosedIdx = exams.findIndex((exam: Exam) => exam.status === "closed");
        // Limit the search to exams before the first closed (or all if none closed)
        const searchEnd = firstClosedIdx === -1 ? exams.length : firstClosedIdx;
        // Find the last opened exam before the first closed
        const openedExams = exams.slice(0, searchEnd).filter(exam => exam.status === "opened");
        const latestOpenedExam = openedExams.length > 0 ? openedExams[openedExams.length - 1] : null;
        return {
            gradeId: grade.id,
            gradeTitle: grade.title,
            latestOpenedExam,
            totalExam: exams.length,
        };
    });
}

// Returns only the first grade milestone with a non-null latestOpenedExam
export const getFirstGradeWithLatestOpenedExam = (gradeMilestones: GradeMilestoneItem[]) => {
    const results = getLatestOpenedExamBeforeClosed(gradeMilestones);
    return results.find(item => item.latestOpenedExam !== null) || null;
}

// Returns the last (latest) grade milestone with a non-null latestOpenedExam
export const getLastGradeWithLatestOpenedExam = (gradeMilestones: GradeMilestoneItem[]) => {
    const results = getLatestOpenedExamBeforeClosed(gradeMilestones);
    return results.slice().reverse().find(item => item.latestOpenedExam !== null) || null;
}