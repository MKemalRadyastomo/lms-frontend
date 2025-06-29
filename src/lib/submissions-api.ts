
import {
  Submission,
  SubmissionDetail,
  EssaySubmissionData,
  FileSubmissionData,
  QuizSubmissionData,
  SubmissionFilters,
  ApiResponse,
  PaginatedResponse,
} from '@/types';
import { api } from './api';

/**
 * Submits an essay-type assignment.
 * @param assignmentId - The ID of the assignment.
 * @param data - The essay submission data.
 * @returns A promise that resolves to the created submission.
 */
export const submitEssay = async (
  assignmentId: number,
  data: EssaySubmissionData
): Promise<Submission> => {
  try {
    const response = await api.post<ApiResponse<Submission>>(
      `/assignments/${assignmentId}/submit/essay`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error('Error submitting essay:', error);
    throw error;
  }
};

/**
 * Submits a file-type assignment.
 * @param assignmentId - The ID of the assignment.
 * @param data - The file submission data, typically FormData.
 * @returns A promise that resolves to the created submission.
 */
export const submitFile = async (
  assignmentId: number,
  data: FormData
): Promise<Submission> => {
  try {
    const response = await api.post<ApiResponse<Submission>>(
      `/assignments/${assignmentId}/submit/file`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error submitting file:', error);
    throw error;
  }
};

/**
 * Submits a quiz-type assignment.
 * @param assignmentId - The ID of the assignment.
 * @param data - The quiz submission data.
 * @returns A promise that resolves to the created submission.
 */
export const submitQuiz = async (
  assignmentId: number,
  data: QuizSubmissionData
): Promise<Submission> => {
  try {
    const response = await api.post<ApiResponse<Submission>>(
      `/assignments/${assignmentId}/submit/quiz`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

/**
 * Fetches the current student's submission for a specific assignment.
 * @param assignmentId - The ID of the assignment.
 * @returns A promise that resolves to the student's submission details.
 */
export const getStudentSubmission = async (
  assignmentId: number
): Promise<SubmissionDetail> => {
  try {
    const response = await api.get<SubmissionDetail>(
      `/assignments/${assignmentId}/submission`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching student submission:', error);
    throw error;
  }
};

/**
 * Fetches all submissions for a given assignment (for teachers).
 * @param assignmentId - The ID of the assignment.
 * @param filters - Optional filters for sorting and pagination.
 * @returns A promise that resolves to a paginated response of submissions.
 */
export const getSubmissionsByAssignment = async (
  assignmentId: number,
  filters: SubmissionFilters = {}
): Promise<PaginatedResponse<Submission>> => {
  try {
    const response = await api.get<PaginatedResponse<Submission>>(
      `/assignments/${assignmentId}/submissions`,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions by assignment:', error);
    throw error;
  }
};

/**
 * Updates a submission, typically to save a draft.
 * @param submissionId - The ID of the submission to update.
 * @param data - The data to update.
 * @returns A promise that resolves to the updated submission.
 */
export const updateSubmission = async (
  submissionId: number,
  data: Partial<EssaySubmissionData | FileSubmissionData | QuizSubmissionData>
): Promise<Submission> => {
  try {
    const response = await api.put<ApiResponse<Submission>>(
      `/assignments/submissions/${submissionId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
};

/**
 * Grades a submission (for teachers).
 * @param submissionId - The ID of the submission to grade.
 * @param grade - The numerical grade.
 * @param feedback - Optional feedback text.
 * @returns A promise that resolves to the graded submission.
 */
export const gradeSubmission = async (
  submissionId: number,
  grade: number,
  feedback?: string
): Promise<Submission> => {
  try {
    const response = await api.patch<ApiResponse<Submission>>(
      `/assignments/submissions/${submissionId}/grade`,
      { grade, feedback }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};
