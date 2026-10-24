import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, FileText, Download, Eye, AlertTriangle, Loader2, LayoutGrid, List, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchLiveFiles } from '../../services/githubService';
import type { FileMetadata } from '../../types';
import { PdfReaderModal } from '../../components/common/PdfReaderModal';
import { Modal } from '../../components/common/Modal';

export const PdfViewerPage: React.FC = () => {
  const { subjectName, folderName } = useParams<{ subjectName: string; folderName: string }>();
  const decodedSubject = decodeURIComponent(subjectName || 'Subject');
  const decodedFolder = decodeURIComponent(folderName || 'Folder');

  const { userProfile, isPremium, incrementDownloadCount } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'title'>('name');

  // Modals
  const [selectedFileForViewing, setSelectedFileForViewing] = useState<FileMetadata | null>(null);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

  const loadFiles = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const userLang = userProfile?.language || 'tamil';
      const fetched = await fetchLiveFiles(decodedSubject, decodedFolder, userLang);
      setFiles(fetched);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load materials from repository.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [decodedSubject, decodedFolder, userProfile?.language]);

  const handleFileAction = async (file: FileMetadata, type: 'view' | 'download') => {
    const downloadsCount = userProfile?.freeDownloadsCount || 0;
    if (!isPremium && downloadsCount >= 5) {
      setShowLimitModal(true);
      return;
    }

    if (!isPremium) {
      await incrementDownloadCount();
    }

    if (type === 'view') {
      setSelectedFileForViewing(file);
    } else {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = file.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredFiles = files
    .filter((f) =>
      (f.title || f.fileName).toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
    .sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || a.fileName).localeCompare(b.title || b.fileName);
      }
      return a.fileName.localeCompare(b.fileName);
    });

  const freeCount = userProfile?.freeDownloadsCount || 0;
  const progressWidth = Math.min(100, Math.round((freeCount / 5) * 100));

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/folder/${encodeURIComponent(decodedSubject)}`)}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white transition shadow-md"
            title="Back to Categories"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-400 font-bold uppercase tracking-wider capitalize">
                {decodedSubject}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 capitalize">{decodedFolder}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight mt-0.5">
              {decodedSubject} — {decodedFolder}
            </h1>
          </div>
        </div>

        {/* Free downloads counter with progress bar */}
        {!isPremium ? (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 min-w-[200px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Free Downloads Used:</span>
              <span className="font-mono font-bold text-amber-400">{freeCount} / 5</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  freeCount >= 4 ? 'bg-red-500' : 'bg-amber-400'
                }`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold shadow-inner">
            <Sparkles className="w-4 h-4" />
            <span>Unlimited Access (Premium)</span>
          </div>
        )}
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${filteredFiles.length} files in ${decodedFolder}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* View & Sort toggles */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'title')}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="name">Sort by File Name</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Content View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800/80">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-300">Fetching PDF documents...</p>
          <p className="text-xs text-slate-500 mt-1">Connecting to official subject materials repo</p>
        </div>
      ) : errorMessage ? (
        <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 text-center text-red-400 space-y-3">
          <p className="text-sm font-bold">{errorMessage}</p>
          <button
            onClick={loadFiles}
            className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold rounded-xl transition"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/80 text-center p-6 space-y-3">
          <div className="p-4 bg-slate-800/60 rounded-3xl text-slate-400 shadow-inner">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white">No PDF Documents Found</h3>
          <p className="text-xs text-slate-400 max-w-md">
            {searchQuery
              ? `No papers matched "${searchQuery}".`
              : `There are currently no files uploaded under ${decodedSubject}/${decodedFolder}. You can suggest materials using the Suggest button!`}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id || file.fileName}
              className="group p-5 rounded-3xl bg-slate-900 border border-slate-800/90 hover:border-brand-500/40 hover:bg-slate-850/80 transition-all duration-200 flex flex-col justify-between h-52 shadow-lg hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl group-hover:scale-105 transition-transform shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    PDF DOCUMENT
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm sm:text-base tracking-tight line-clamp-2 group-hover:text-brand-300 transition-colors">
                  {file.title || file.fileName}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {file.fileName}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleFileAction(file, 'view')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open & View</span>
                </button>

                <button
                  onClick={() => handleFileAction(file, 'download')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="grid grid-cols-1 gap-2.5">
          {filteredFiles.map((file) => (
            <div
              key={file.id || file.fileName}
              className="group p-4 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-850/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center space-x-3.5 truncate">
                <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="font-bold text-white text-sm truncate group-hover:text-brand-300 transition-colors">
                    {file.title || file.fileName}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {file.fileName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleFileAction(file, 'view')}
                  className="px-3.5 py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>

                <button
                  onClick={() => handleFileAction(file, 'download')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded PDF Viewer Modal */}
      <PdfReaderModal
        file={selectedFileForViewing}
        subjectName={decodedSubject}
        folderName={decodedFolder}
        isOpen={Boolean(selectedFileForViewing)}
        onClose={() => setSelectedFileForViewing(null)}
        onDownload={(f) => handleFileAction(f, 'download')}
      />

      {/* Download Limit Reached Modal */}
      <Modal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Download Limit Reached"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h4 className="text-xl font-bold text-white">
            5 Free Downloads / Views Used
          </h4>
          <p className="text-sm text-slate-300">
            You have reached the free tier limit of 5 downloads/views. Upgrade to Premium for Rs. 500 to enjoy unlimited access forever.
          </p>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => setShowLimitModal(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <Link
              to="/payment"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-yellow-500/20 hover:brightness-110 transition"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};
