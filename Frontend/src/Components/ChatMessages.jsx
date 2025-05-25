import React from 'react';
import { Download, FileText } from 'lucide-react';

const ChatMessages = ({ messages, username, toUser, formatTime, formatDate, messagesEndRef }) => {
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileMessage = (message) => {
    const { fileInfo } = message;
    const isImage = fileInfo?.mimeType?.startsWith('image/');
    const isVideo = fileInfo?.mimeType?.startsWith('video/');

    if (isImage) {
      return (
        <div className="max-w-xs">
          <img
            src={message.message}
            alt={fileInfo?.fileName || 'Shared image'}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.message, '_blank')}
            loading="lazy"
          />
          {fileInfo?.fileName && (
            <div className="text-xs text-gray-300 mt-1 flex items-center justify-between">
              <span className="truncate">{fileInfo.fileName}</span>
              <a
                href={message.message}
                download
                className="ml-2 p-1 hover:bg-gray-600 rounded"
                title="Download"
              >
                <Download size={12} />
              </a>
            </div>
          )}
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="max-w-xs">
          <video
            controls
            className="rounded-lg max-w-full h-auto"
            preload="metadata"
          >
            <source src={message.message} type={fileInfo?.mimeType} />
            Your browser does not support the video tag.
          </video>
          {fileInfo?.fileName && (
            <div className="text-xs text-gray-300 mt-1 flex items-center justify-between">
              <span className="truncate">{fileInfo.fileName}</span>
              <div className="flex items-center gap-1">
                {fileInfo.fileSize && (
                  <span className="text-gray-400">({formatFileSize(fileInfo.fileSize)})</span>
                )}
                <a
                  href={message.message}
                  download
                  className="p-1 hover:bg-gray-600 rounded"
                  title="Download"
                >
                  <Download size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback for other file types
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg max-w-xs">
        <FileText size={24} className="text-gray-300" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {fileInfo?.fileName || 'Unknown file'}
          </div>
          {fileInfo?.fileSize && (
            <div className="text-xs text-gray-400">
              {formatFileSize(fileInfo.fileSize)}
            </div>
          )}
        </div>
        <a
          href={message.message}
          download
          className="p-1 hover:bg-gray-600 rounded"
          title="Download"
        >
          <Download size={16} />
        </a>
      </div>
    );
  };

  return (
    <div className="flex-1 px-6 py-4 space-y-3 pb-28 overflow-y-auto bg-zinc-950">
      {messages
        .filter(
          (m) =>
            (m.fromUser === username && m.toUser === toUser) ||
            (m.fromUser === toUser && m.toUser === username)
        )
        .map((m, i) => {
          const messageTime = m.timestamp || m.timeStamp || Date.now();
          const isFileMessage = m.messageType === 'file';
          
          return (
            <div key={i} className="flex flex-col">
              {i === 0 || formatDate(messageTime) !== formatDate(messages[i - 1]?.timestamp || messages[i - 1]?.timeStamp || Date.now()) ? (
                <div className="text-center text-xs text-gray-500 my-2">
                  {formatDate(messageTime)}
                </div>
              ) : null}

              <div className={`px-3 py-3 rounded-lg ${
                m.fromUser === username
                  ? 'bg-green-900 text-white self-end ml-auto'
                  : 'bg-green-800 text-white'
              } ${isFileMessage ? 'max-w-sm' : 'max-w-sm'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <span className="font-thin capitalize">{m.fromUser}:</span>
                    {isFileMessage ? (
                      <div className="mt-2">
                        {renderFileMessage(m)}
                      </div>
                    ) : (
                      <span className="ml-1">{m.message}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-300 mt-1 text-right">
                  {formatTime(messageTime)}
                </div>
              </div>
            </div>
          );
        })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;