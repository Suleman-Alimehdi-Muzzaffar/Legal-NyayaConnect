import React, { useRef, useState } from 'react';
import { UploadCloud, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface FormFileUploadProps {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  hint?: string;
  error?: string;
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  label,
  name,
  accept,
  multiple = false,
  maxFiles = 5,
  hint,
  error,
  onFilesChange,
  className
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | File[]) => {
    let fileArray = Array.from(newFiles);
    if (!multiple) {
      fileArray = [fileArray[0]];
    } else {
      fileArray = [...files, ...fileArray].slice(0, maxFiles);
    }
    setFiles(fileArray);
    onFilesChange(fileArray);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(newFiles);
    onFilesChange(newFiles);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <label className="block font-sans text-sm font-medium text-gray-300">
        {label}
      </label>
      
      <div
        className={cn(
          "w-full rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 cursor-pointer bg-white/5",
          isDragging 
            ? "border-[#D4AF37] bg-[#D4AF37]/10" 
            : "border-white/20 hover:border-[#D4AF37]/50 hover:bg-white/10",
          error ? "border-red-400/60" : ""
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className={cn("w-8 h-8 mb-3 transition-colors", isDragging ? "text-[#D4AF37]" : "text-gray-400")} />
        <p className="text-white font-sans text-sm font-medium text-center">
          Drag & Drop or Click to Browse
        </p>
        {accept && (
          <p className="text-gray-500 font-sans text-xs mt-2 text-center">
            Accepted formats: {accept.split(',').join(', ')}
          </p>
        )}
        <input
          type="file"
          ref={inputRef}
          name={name}
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
      
      {error && <span className="text-xs text-red-400 font-sans">{error}</span>}
      {!error && hint && <span className="text-xs text-gray-400 font-sans">{hint}</span>}

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <AnimatePresence>
            {files.map((file, idx) => (
              <motion.div
                key={`${file.name}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-[#102542] flex items-center justify-center shrink-0 border border-white/5">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
                    ) : (
                      <FileIcon className="w-5 h-5 text-[#D4AF37]" />
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm text-white font-sans font-medium truncate">{file.name}</span>
                    <span className="text-xs text-gray-400 font-sans">{formatSize(file.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FormFileUpload;