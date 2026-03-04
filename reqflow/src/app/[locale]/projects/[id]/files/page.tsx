'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import { Upload, FileText, Image, File, Trash2, Download, Search, LayoutGrid, List, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectFileItem {
  id: string; filename: string; originalName: string; mimeType: string; size: number;
  path: string; category: string; createdAt: string; requirementId: string | null;
  uploadedBy: { name: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  BRIEF: 'bg-blue-100 text-blue-700', DESIGN: 'bg-purple-100 text-purple-700',
  SPEC: 'bg-green-100 text-green-700', REPORT: 'bg-amber-100 text-amber-700',
  OTHER: 'bg-slate-100 text-slate-700',
};

const FILE_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText, 'image/': Image,
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf') return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function FilesPage() {
  const t = useTranslations();
  const { currentProject } = useProjectStore();
  const [files, setFiles] = useState<ProjectFileItem[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<ProjectFileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState('OTHER');

  const loadFiles = useCallback(async () => {
    if (!currentProject) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    const r = await fetch(`/api/projects/${currentProject.id}/files?${params}`);
    if (r.ok) setFiles(await r.json());
  }, [currentProject, search, categoryFilter]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleUpload = async (fileList: FileList) => {
    if (!currentProject) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', uploadCategory);
        formData.append('uploadedById', 'user-1');
        await fetch(`/api/projects/${currentProject.id}/files`, { method: 'POST', body: formData });
      }
      toast.success(t('toast.fileUploaded'));
      loadFiles();
    } catch { toast.error(t('toast.error')); }
    setUploading(false);
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fetch(`/api/projects/${currentProject!.id}/files`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });
      toast.success('File deleted');
      loadFiles();
    } catch { toast.error(t('toast.error')); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  if (!currentProject) return null;

  const categories = ['BRIEF', 'DESIGN', 'SPEC', 'REPORT', 'OTHER'];
  const filteredFiles = files;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={cn('border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          uploading ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto mb-2 text-slate-400" size={32} />
        <p className="text-sm text-slate-600 font-medium">{t('files.dropHere')}</p>
        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, PNG, JPG, ZIP (max 50MB)</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded text-xs">
            {categories.map((c) => <option key={c} value={c}>{t(`files.${c.toLowerCase()}`)}</option>)}
          </select>
        </div>
        <input ref={fileInputRef} type="file" multiple className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')}
              className="pl-8 pr-3 py-2 border border-slate-200 rounded-md text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex gap-1">
            <button onClick={() => setCategoryFilter('')}
              className={cn('px-2.5 py-1.5 rounded-md text-xs', !categoryFilter ? 'bg-slate-200 text-slate-700' : 'text-slate-500 hover:bg-slate-100')}>
              {t('dashboard.allTab')}
            </button>
            {categories.map((c) => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={cn('px-2.5 py-1.5 rounded-md text-xs', categoryFilter === c ? 'bg-slate-200 text-slate-700' : 'text-slate-500 hover:bg-slate-100')}>
                {t(`files.${c.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 border border-slate-200 rounded-md p-0.5">
          <button onClick={() => setView('grid')} className={cn('p-1.5 rounded', view === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400')}><LayoutGrid size={16} /></button>
          <button onClick={() => setView('list')} className={cn('p-1.5 rounded', view === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400')}><List size={16} /></button>
        </div>
      </div>

      {/* Files Display */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((f) => {
            const Icon = getFileIcon(f.mimeType);
            return (
              <div key={f.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setPreviewFile(f)}>
                <div className="flex items-center justify-center h-20 mb-3">
                  <Icon size={40} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-medium text-slate-700 truncate">{f.originalName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', CATEGORY_COLORS[f.category])}>{t(`files.${f.category.toLowerCase()}`)}</span>
                  <span className="text-[10px] text-slate-400">{formatSize(f.size)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">{f.uploadedBy.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
          {filteredFiles.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <File size={48} className="mx-auto mb-2" />
              <p className="text-sm">{t('empty.noFiles')}</p>
              <p className="text-xs mt-1">{t('empty.noFilesDesc')}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr>
              {['', t('files.fileName'), t('files.category'), t('files.uploader'), t('members.date'), t('files.size'), t('common.actions')].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.map((f) => {
                const Icon = getFileIcon(f.mimeType);
                return (
                  <tr key={f.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setPreviewFile(f)}>
                    <td className="px-4 py-3"><Icon size={20} className="text-slate-400" /></td>
                    <td className="px-4 py-3 font-medium">{f.originalName}</td>
                    <td className="px-4 py-3"><span className={cn('px-1.5 py-0.5 rounded text-xs', CATEGORY_COLORS[f.category])}>{t(`files.${f.category.toLowerCase()}`)}</span></td>
                    <td className="px-4 py-3 text-slate-500">{f.uploadedBy.name}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-500">{formatSize(f.size)}</td>
                    <td className="px-4 py-3"><button onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPreviewFile(null)} />
          <div className="fixed inset-8 bg-white rounded-xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 h-14 border-b">
              <h2 className="text-lg font-semibold truncate">{previewFile.originalName}</h2>
              <div className="flex items-center gap-2">
                <a href={previewFile.path} download className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"><Download size={20} /></a>
                <button onClick={() => setPreviewFile(null)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-slate-50">
              {previewFile.mimeType.startsWith('image/') ? (
                <img src={previewFile.path} alt={previewFile.originalName} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center">
                  <File size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500">{previewFile.originalName}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatSize(previewFile.size)} &middot; {previewFile.mimeType}</p>
                  <a href={previewFile.path} download className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#0066FF] text-white rounded-md text-sm hover:bg-[#0052cc]">
                    <Download size={16} />{t('common.download')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
