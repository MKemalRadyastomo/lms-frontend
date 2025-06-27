
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSubmissionData } from '@/types';
import { Button } from '@/components/ui/button';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface FileSubmissionFormProps {
  onSubmit: (data: FileSubmissionData) => void;
  isSubmitting: boolean;
  allowedFileTypes?: string;
  maxFileSizeMb?: number;
}

export const FileSubmissionForm: React.FC<FileSubmissionFormProps> = ({ onSubmit, isSubmitting, allowedFileTypes, maxFileSizeMb }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      setError(rejectedFiles[0].errors[0].message);
      setFile(null);
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedFileTypes ? Object.fromEntries(allowedFileTypes.split(',').map(t => [`.${t.trim()}`, []])) : undefined,
    maxSize: maxFileSizeMb ? maxFileSizeMb * 1024 * 1024 : undefined,
    multiple: false,
  });

  const handleSubmit = () => {
    if (file) {
      onSubmit({ submitted_file: file, draft: false });
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary' : 'border-muted-foreground'}`}>
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive ? 'Drop the file here ...' : 'Drag & drop a file here, or click to select a file'}
        </p>
        <p className="text-xs text-muted-foreground">
          {allowedFileTypes ? `Allowed types: ${allowedFileTypes}` : ''}
          {maxFileSizeMb ? ` Max size: ${maxFileSizeMb}MB` : ''}
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {file && (
        <div className="flex items-center justify-between p-2 border rounded-lg">
          <div className="flex items-center space-x-2">
            <FileIcon className="h-6 w-6" />
            <span>{file.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit File'}
        </Button>
      </div>
    </div>
  );
};
