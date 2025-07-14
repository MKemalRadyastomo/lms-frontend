import { UseFormSetError } from 'react-hook-form';
import { ErrorHandler } from '@/lib/error-handler';
import { useToast } from '@/components/ui/use-toast';

interface UseFormErrorHandlerProps {
  setError: UseFormSetError<any>;
  showToast?: boolean;
}

export function useFormErrorHandler({ setError, showToast = true }: UseFormErrorHandlerProps) {
  const { toast } = useToast();

  const handleError = (error: any) => {
    console.error('Form error:', error);
    
    const processedError = ErrorHandler.processApiError(error);
    
    if (processedError.type === 'field_errors' && processedError.fieldErrors) {
      // Set field-specific errors
      Object.entries(processedError.fieldErrors).forEach(([field, message]) => {
        // Map backend field names to frontend field names if needed
        const mappedField = ErrorHandler.mapFieldName(field);
        setError(mappedField as any, { message });
      });
      
      // Don't show toast for field errors - they're shown inline
      return;
    }
    
    // Handle general errors
    if (showToast) {
      toast({
        title: 'Error',
        description: processedError.message,
        variant: 'destructive',
      });
    } else {
      setError('root', { message: processedError.message });
    }
  };

  const handleNetworkError = (error: any) => {
    console.error('Network error:', error);
    
    const processedError = ErrorHandler.handleNetworkError(error);
    
    if (showToast) {
      toast({
        title: 'Connection Error',
        description: processedError.message,
        variant: 'destructive',
      });
    } else {
      setError('root', { message: processedError.message });
    }
  };

  return { 
    handleError,
    handleNetworkError,
    // Helper to show success messages
    showSuccess: (message: string) => {
      toast({
        title: 'Success',
        description: message,
        variant: 'default',
      });
    }
  };
}