import { z } from 'zod'

// Authentication Schemas
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  firstName: z
    .string()
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  roleId: z
    .number()
    .min(1, 'Please select a role'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Course Schemas
export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'Course title is required')
    .min(5, 'Course title must be at least 5 characters')
    .max(200, 'Course title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  categoryId: z
    .number()
    .min(1, 'Please select a category'),
  instructorId: z
    .number()
    .min(1, 'Please select an instructor'),
  status: z
    .enum(['draft', 'published', 'archived'])
    .default('draft'),
})

// Assignment Schemas
export const assignmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Assignment title is required')
    .min(5, 'Assignment title must be at least 5 characters')
    .max(200, 'Assignment title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  type: z
    .enum(['essay', 'file_upload', 'quiz']),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Due date must be in the future',
    }),
  maxScore: z
    .number()
    .min(0, 'Max score cannot be negative')
    .max(1000, 'Max score cannot exceed 1000')
    .optional(),
  courseId: z
    .number()
    .min(1, 'Please select a course'),
})

// Submission Schemas
export const essaySubmissionSchema = z.object({
  answerText: z
    .string()
    .min(1, 'Essay answer is required')
    .min(50, 'Essay must be at least 50 characters')
    .max(10000, 'Essay must be less than 10000 characters'),
  isDraft: z
    .boolean()
    .default(false),
})

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CourseFormData = z.infer<typeof courseSchema>
export type AssignmentFormData = z.infer<typeof assignmentSchema>
export type EssaySubmissionFormData = z.infer<typeof essaySubmissionSchema>
