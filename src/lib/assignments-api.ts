
import {
  Assignment,
  AssignmentCreateData,
  AssignmentDetail,
  AssignmentFilters,
} from '@/types';
import { api } from './api';
import { ApiResponse, PaginatedResponse } from '@/types';

const ASSIGNMENT_API_URL = '/assignments';

/**
 * Fetches a paginated list of assignments for a specific course.
 * @param courseId - The ID of the course.
 * @param filters - Optional filters for searching and sorting assignments.
 * @returns A promise that resolves to a paginated response of assignments.
 */
export const getAssignmentsByCourse = async (
  courseId: number,
  filters: AssignmentFilters = {}
): Promise<PaginatedResponse<Assignment>> => {
  try {
    const response = await api.get<PaginatedResponse<Assignment>>(
      `/courses/${courseId}/assignments`,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    // Handle and re-throw the error for the caller to manage
    console.error('Error fetching assignments by course:', error);
    throw error;
  }
};

/**
 * Fetches the details of a specific assignment.
 * @param courseId - The ID of the course the assignment belongs to.
 * @param assignmentId - The ID of the assignment to fetch.
 * @returns A promise that resolves to the assignment details.
 */
export const getAssignmentDetails = async (
  courseId: number,
  assignmentId: number
): Promise<AssignmentDetail> => {
  try {
    const response = await api.get<AssignmentDetail>(
      `/courses/${courseId}/assignments/${assignmentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    throw error;
  }
};

/**
 * Creates a new assignment for a course.
 * @param courseId - The ID of the course where the assignment will be created.
 * @param data - The data for the new assignment.
 * @returns A promise that resolves to the newly created assignment.
 */
export const createAssignment = async (
  courseId: number,
  data: AssignmentCreateData
): Promise<Assignment> => {
  try {
    const response = await api.post<ApiResponse<Assignment>>(
      `/courses/${courseId}/assignments`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

/**
 * Updates an existing assignment.
 * @param courseId - The ID of the course.
 * @param assignmentId - The ID of the assignment to update.
 * @param data - The updated assignment data.
 * @returns A promise that resolves to the updated assignment.
 */
export const updateAssignment = async (
  courseId: number,
  assignmentId: number,
  data: Partial<AssignmentCreateData>
): Promise<Assignment> => {
  try {
    const response = await api.put<ApiResponse<Assignment>>(
      `/courses/${courseId}/assignments/${assignmentId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

/**
 * Deletes an assignment.
 * @param courseId - The ID of the course.
 * @param assignmentId - The ID of the assignment to delete.
 * @returns A promise that resolves when the assignment is deleted.
 */
export const deleteAssignment = async (
  courseId: number,
  assignmentId: number
): Promise<void> => {
  try {
    await api.delete(`/courses/${courseId}/assignments/${assignmentId}`);
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};
