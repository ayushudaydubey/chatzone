import React, { useRef, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';

const ChatInput = ({ handleSend, message, setMessage, toUser, users, handleFileUpload }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const userObj = users.find(u => (typeof u === 'object' ? u.username : u) === toUser);
  const isOnline = userObj && typeof userObj === 'object' ? userObj.isOnline : true;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setUploadError('');
    setUploadProgress(0);

    // Client-side validation
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size must be less than 50MB');
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadError('Only image and video files are allowed');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Starting file upload:', file.name);
      
      await handleFileUpload(file, (progress) => {
        setUploadProgress(progress);
      });
      
      console.log('File upload completed successfully');
      setUploadProgress(100);
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    setUploadError(''); // Clear any previous errors
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-black absolute bottom-0 left-0 right-0">
      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Uploading file...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-500/30 rounded-md">
          <p className="text-red-400 text-xs">{uploadError}</p>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        {/* File Upload Button */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={!toUser || isUploading}
          className="p-2 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload image or video"
        >
          <Paperclip size={20} />
        </button>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text Input */}
        <input
          type="text"
          className="flex-1 p-3 text-blue-100 border border-gray-300 rounded-md focus:outline-none bg-zinc-800 focus:border-blue-500 transition-colors"
          placeholder={
            isUploading
              ? `Uploading... ${uploadProgress}%`
              : toUser
                ? `Message ${toUser} ${isOnline ? '(online)' : '(offline - will receive later)'}`
                : 'Select a user to chat'
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!toUser || isUploading}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!toUser || (!message.trim() && !isUploading) || isUploading}
          className="bg-green-700 text-blue-50 px-4 py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>
            Uploading file... 
            {uploadProgress > 0 && ` ${uploadProgress}%`}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;