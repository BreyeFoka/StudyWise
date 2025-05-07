'use client';

import type React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null, dataUri: string | null) => void;
  acceptedFileTypes?: string; // e.g., ".pdf,.doc,.docx,audio/*"
}

export function FileUpload({ onFileSelect, acceptedFileTypes = "application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,audio/*" }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        onFileSelect(file, dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
      onFileSelect(null, null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    onFileSelect(null, null);
    // Reset the input field
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="w-full">
      <Label htmlFor="file-upload-input" className="block mb-2 text-sm font-medium">
        Upload Document
      </Label>
      {!selectedFile ? (
        <div className="flex items-center justify-center w-full">
          <Label
            htmlFor="file-upload-input"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF, PPT, DOC, TXT, Audio files</p>
            </div>
            <Input id="file-upload-input" type="file" className="hidden" onChange={handleFileChange} accept={acceptedFileTypes} />
          </Label>
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate max-w-xs">{selectedFile.name}</p>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {preview && selectedFile.type.startsWith('image/') && (
             // eslint-disable-next-line @next/next/no-img-element
            <img data-ai-hint="file preview" src={preview} alt="Preview" className="mt-2 rounded-md max-h-48 object-contain" />
          )}
          {selectedFile.type.startsWith('audio/') && (
            <audio controls src={preview || ''} className="mt-2 w-full">
              Your browser does not support the audio element.
            </audio>
          )}
          {/* Add more previews for other file types if needed, e.g. PDF placeholder */}
        </div>
      )}
    </div>
  );
}
