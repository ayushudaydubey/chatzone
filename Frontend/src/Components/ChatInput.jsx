import React, { useRef, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';

const ChatInput = ({ handleSend, message, setMessage, toUser, users, handleFileUpload }) => {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const userObj = users.find(u => (typeof u === 'object' ? u.username : u) === toUser);
  const isOnline = userObj && typeof userObj === 'object' ? userObj.isOnline : true;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadProgress(0);

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
      await handleFileUpload(file, (progress) => setUploadProgress(progress));
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      setUploadError(error.message || 'Failed to upload file');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    setUploadError('');
    fileInputRef.current?.click();
  };

  // Fixed form submit handler to prevent screen jumping
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store current scroll position
    const chatContainer = document.querySelector('.overflow-y-auto');
    const scrollTop = chatContainer ? chatContainer.scrollTop : 0;
    
    // Call original handleSend
    handleSend(e);
    
    // Maintain focus on input to prevent screen jumping
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        // Restore scroll position if needed
        if (chatContainer) {
          chatContainer.scrollTop = scrollTop;
        }
      }, 0);
    }
  };

  const getPlaceholderText = () => {
    if (isUploading) return `Uploading... ${uploadProgress}%`;
    if (!toUser) return 'Select a user to chat';
    return window.innerWidth < 640
      ? `Message ${toUser}`
      : `Message ${toUser} ${isOnline ? '(online)' : '(offline)'}`;
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 border-t border-gray-700 bg-zinc-950 sticky bottom-0">
      
      {isUploading && (
        <div className="mb-2 sm:mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mb-2 sm:mb-3 p-2 bg-red-900/20 border border-red-500/30 rounded-md text-xs text-red-400">
          {uploadError}
        </div>
      )}

      <form 
        ref={formRef}
        onSubmit={handleFormSubmit} 
        className="flex gap-1 sm:gap-2 items-center"
      >
        
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={!toUser || isUploading}
          className="p-2 text-gray-400 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-800/50"
          title="Upload"
        >
          <Paperclip size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <input
          ref={inputRef}
          type="text"
          className="flex-1 p-2 sm:p-3 text-sm sm:text-base text-blue-100 border border-gray-600 rounded-md bg-zinc-800 focus:outline-none"
          placeholder={getPlaceholderText()}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!toUser || isUploading}
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={!toUser || (!message.trim() && !isUploading) || isUploading}
          className="bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </form>

      {isUploading && (
        <div className="mt-2 text-xs text-gray-400 flex gap-2 sm:hidden">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Uploading... {uploadProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;