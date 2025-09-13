'use client';

import { useState, useRef, useTransition } from 'react';
import { getCloudinarySignature, updateCheckInWithImage } from '@/app/dashboard/groups/[groupId]/actions';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInId: string;
  onSuccess: () => void;
}

export default function UploadPhotoModal({ isOpen, onClose, checkInId, onSuccess }: UploadPhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setError('');
    setUploadProgress(0);
    
    startTransition(async () => {
      try {
        // Step 1: Get Cloudinary signature
        const signatureResult = await getCloudinarySignature();
        if (!signatureResult.success) {
          setError(signatureResult.error || 'Failed to get upload signature');
          return;
        }
        
        // Step 2: Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('signature', signatureResult.signature);
        formData.append('timestamp', signatureResult.timestamp.toString());
        formData.append('folder', signatureResult.folder);
        formData.append('resource_type', 'image');
        formData.append('allowed_formats', 'jpg,jpeg,png,webp');
        formData.append('max_file_size', '10485760');
        
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureResult.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error?.message || 'Upload failed');
        }
        
        const uploadResult = await uploadResponse.json();
        setUploadProgress(100);
        
        // Step 3: Update check-in with image URL
        const updateResult = await updateCheckInWithImage(checkInId, uploadResult.secure_url);
        
        if (!updateResult.success) {
          setError(updateResult.error || 'Failed to update check-in');
          return;
        }
        
        // Success!
        onSuccess();
        onClose();
        
      } catch (err) {
        console.error('Upload error:', err);
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    });
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-3xl p-6 border border-slate-600/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Photo to Check-in</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* File Input */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-slate-600/50 rounded-2xl p-8 text-center hover:border-slate-500/50 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload a Photo</h3>
              <p className="text-slate-400 text-sm mb-4">
                Share your workout moment with the group
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Choose Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            /* Preview */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setError('');
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* File Info */}
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{selectedFile.name}</span>
                  <span className="text-slate-400 text-sm">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="text-slate-400 text-sm">
                  {selectedFile.type}
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isPending && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Uploading...</span>
                <span className="text-slate-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className="gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 p-3 bg-slate-800/50 text-slate-300 rounded-xl font-medium hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={isPending}
                className="flex-1 gradient-primary text-white p-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Upload Photo'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
