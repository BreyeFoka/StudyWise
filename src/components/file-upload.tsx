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
      <Label htmlFor="file-upload-input" className="block mb-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Upload Document
      </Label>
      {!selectedFile ? (
        <div className="flex items-center justify-center w-full">
          <Label
            htmlFor="file-upload-input"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full">
                <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">PDF, PPT, DOC, TXT, Audio files (max 10MB)</p>
            </div>
            <Input id="file-upload-input" type="file" className="hidden" onChange={handleFileChange} accept={acceptedFileTypes} />
          </Label>
        </div>
      ) : (
        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                <UploadCloud className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {preview && selectedFile.type.startsWith('image/') && (
             // eslint-disable-next-line @next/next/no-img-element
            <img data-ai-hint="file preview" src={preview} alt="Preview" className="mt-3 rounded-lg max-h-48 object-contain border border-slate-200 dark:border-slate-700" />
          )}
          {selectedFile.type.startsWith('audio/') && (
            <audio controls src={preview || ''} className="mt-3 w-full">
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      )}
    </div>
  );
}
