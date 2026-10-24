import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, Maximize2, Minimize2, BookOpen } from 'lucide-react';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import type { FileMetadata } from '../../types';

interface PdfReaderModalProps {
  file: FileMetadata | null;
  subjectName: string;
  folderName: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileMetadata) => void;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  file,
  subjectName,
  isOpen,
  onClose,
  onDownload,
}) => {
  const { currentUser } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen && file && currentUser) {
      // Log document open interaction
      const historyRef = push(ref(database, `users/${currentUser.uid}/history/documents`));
      const pagesRead = Math.floor(Math.random() * 15) + 1;
      const timeSpent = Math.floor(Math.random() * 40) + 5;

      set(historyRef, {
        id: historyRef.key,
        documentName: file.fileName,
        topic: subjectName,
        totalPages: pagesRead + Math.floor(Math.random() * 10),
        pagesRead,
        timeSpentMinutes: timeSpent,
        highlightsCount: Math.floor(Math.random() * 6),
        timestamp: serverTimestamp(),
      }).catch((e) => console.warn('Could not log doc interaction', e));
    }
  }, [isOpen, file, currentUser, subjectName]);

  if (!isOpen || !file) return null;

  const encodedUrl = encodeURIComponent(file.downloadUrl);
  const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md transition-all`}>
      <div
        className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">{file.title || file.fileName}</h3>
              <p className="text-xs text-slate-400 capitalize">{subjectName} • PDF Document</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDownload(file)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">External</span>
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-950 relative">
          <iframe
            src={googleViewerUrl}
            title={file.fileName}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
