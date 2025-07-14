interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ApiError {
  message: string;
  code?: string;
  errors?: ValidationError[];
  status?: number;
}

interface ProcessedError {
  type: 'field_errors' | 'general_error';
  message: string;
  fieldErrors?: Record<string, string>;
  originalError?: any;
}

export class ErrorHandler {
  private static errorMessages: Record<string, string> = {
    // Backend error code → User-friendly message mapping
    'COURSE_NAME_REQUIRED': 'Please enter a course name',
    'COURSE_NAME_TOO_SHORT': 'Course name must be at least 3 characters',
    'EMAIL_INVALID': 'Please enter a valid email address',
    'PASSWORD_TOO_SHORT': 'Password must be at least 8 characters',
    'USER_NOT_FOUND': 'The user you\'re looking for doesn\'t exist',
    'DUPLICATE_EMAIL': 'This email address is already registered',
    'VALIDATION_ERROR': 'Please check your input and try again',
    'DUPLICATE_USERNAME': 'This username is already taken',
    'COURSE_CODE_EXISTS': 'A course with this code already exists',
    'INVALID_ROLE': 'Please select a valid user role',
    'UNAUTHORIZED': 'You don\'t have permission to perform this action',
    'NETWORK_ERROR': 'Network error. Please check your connection.',
    'SERVER_ERROR': 'Server error. Please try again later.',
    'UNKNOWN_ERROR': 'An unexpected error occurred',
  }

  static processApiError(error: any): ProcessedError {
    const apiError = error.response?.data as ApiError;
    
    // Handle field-level validation errors
    if (apiError?.errors && Array.isArray(apiError.errors)) {
      return {
        type: 'field_errors',
        fieldErrors: this.mapFieldErrors(apiError.errors),
        message: 'Please correct the errors below'
      };
    }
    
    // Handle general API errors
    const errorCode = apiError?.code || 'UNKNOWN_ERROR';
    const userMessage = this.errorMessages[errorCode] || apiError?.message || 'An unexpected error occurred';
    
    return {
      type: 'general_error',
      message: userMessage,
      originalError: error
    };
  }

  private static mapFieldErrors(errors: ValidationError[]): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    
    errors.forEach(error => {
      const userMessage = this.errorMessages[error.code] || error.message;
      fieldErrors[error.field] = userMessage;
    });
    
    return fieldErrors;
  }

  static getUserFriendlyMessage(error: any): string {
    const processed = this.processApiError(error);
    return processed.message;
  }

  /**
   * Map common backend field names to frontend field names
   */
  static mapFieldName(backendField: string): string {
    const fieldMapping: Record<string, string> = {
      'title': 'name', // Backend uses 'title', frontend uses 'name' for courses
      'first_name': 'firstName',
      'last_name': 'lastName',
      'role_id': 'roleId',
      'course_id': 'courseId',
    };
    
    return fieldMapping[backendField] || backendField;
  }

  /**
   * Handle network errors (no response from server)
   */
  static handleNetworkError(error: any): ProcessedError {
    if (!error.response) {
      return {
        type: 'general_error',
        message: this.errorMessages['NETWORK_ERROR'],
        originalError: error
      };
    }
    
    return this.processApiError(error);
  }
}