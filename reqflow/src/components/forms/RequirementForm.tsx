'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronRight, ChevronLeft, Save, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';

interface FormData {
  title: string;
  titleZh: string;
  requester: string;
  contactEmail: string;
  desiredLaunchDate: string;
  isHardDeadline: boolean;
  hardDeadlineReason: string;
  priority: string;
  priorityReason: string;
  goal: string;
  goalDetail: string;
  successMetric: string;
  successMetricOwner: string;
  pageScope: string;
  audience: string[];
  targetRegions: string[];
  customerType: string[];
  contentAssets: string[];
  designNeeded: boolean;
  figmaLink: string;
  trackingRequirements: string;
  seoReviewPoints: string;
  dependencies: string;
  acceptanceCriteria: string;
  estimatedHours: string;
  tags: string;
  internalComments: string;
}

const initialFormData: FormData = {
  title: '', titleZh: '', requester: '', contactEmail: '',
  desiredLaunchDate: '', isHardDeadline: false, hardDeadlineReason: '',
  priority: 'P2', priorityReason: '', goal: 'OTHER', goalDetail: '',
  successMetric: '', successMetricOwner: '', pageScope: '',
  audience: [], targetRegions: [], customerType: [],
  contentAssets: [], designNeeded: false, figmaLink: '',
  trackingRequirements: '', seoReviewPoints: '', dependencies: '',
  acceptanceCriteria: '', estimatedHours: '', tags: '', internalComments: '',
};

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

export default function RequirementForm({ projectId }: { projectId: string }) {
  const t = useTranslations();
  const { requirementDrawerOpen, requirementDrawerId, closeRequirementDrawer } = useUIStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  // Load existing data for editing
  useEffect(() => {
    if (requirementDrawerId && requirementDrawerOpen) {
      fetch(`/api/requirements/${requirementDrawerId}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            title: data.title || '',
            titleZh: data.titleZh || '',
            requester: data.requester || '',
            contactEmail: data.contactEmail || '',
            desiredLaunchDate: data.desiredLaunchDate?.split('T')[0] || '',
            isHardDeadline: data.isHardDeadline || false,
            hardDeadlineReason: data.hardDeadlineReason || '',
            priority: data.priority || 'P2',
            priorityReason: data.priorityReason || '',
            goal: data.goal || 'OTHER',
            goalDetail: data.goalDetail || '',
            successMetric: data.successMetric || '',
            successMetricOwner: data.successMetricOwner || '',
            pageScope: data.pageScope || '',
            audience: data.audience ? JSON.parse(data.audience) : [],
            targetRegions: data.targetRegions ? JSON.parse(data.targetRegions) : [],
            customerType: data.customerType ? JSON.parse(data.customerType) : [],
            contentAssets: data.contentAssets ? JSON.parse(data.contentAssets) : [],
            designNeeded: data.designNeeded || false,
            figmaLink: data.figmaLink || '',
            trackingRequirements: data.trackingRequirements || '',
            seoReviewPoints: data.seoReviewPoints || '',
            dependencies: data.dependencies || '',
            acceptanceCriteria: data.acceptanceCriteria || '',
            estimatedHours: data.estimatedHours?.toString() || '',
            tags: data.tags ? JSON.parse(data.tags).join(', ') : '',
            internalComments: '',
          });
        })
        .catch(() => {});
    } else if (!requirementDrawerOpen) {
      setForm(initialFormData);
      setStep(0);
    }
  }, [requirementDrawerId, requirementDrawerOpen]);

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (requirementDrawerOpen && form.title) {
        localStorage.setItem('reqflow-draft', JSON.stringify(form));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [form, requirementDrawerOpen]);

  const update = useCallback((field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArray = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }, []);

  const handleSubmit = async (asDraft = false) => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        status: asDraft ? 'DRAFT' : 'SUBMITTED',
        kanbanColumn: 'BACKLOG',
        submittedById: 'user-1',
        desiredLaunchDate: form.desiredLaunchDate || null,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      const url = requirementDrawerId
        ? `/api/requirements/${requirementDrawerId}`
        : `/api/projects/${projectId}/requirements`;
      const method = requirementDrawerId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success(t(requirementDrawerId ? 'toast.requirementUpdated' : 'toast.requirementCreated'));
      localStorage.removeItem('reqflow-draft');
      closeRequirementDrawer();
    } catch {
      toast.error(t('toast.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!requirementDrawerOpen) return null;

  const priorityOptions = [
    { value: 'P0', label: 'P0', color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'P1', label: 'P1', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'P2', label: 'P2', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ];

  const goalTypes = ['CONVERSION', 'AWARENESS', 'LEAD_GEN', 'DOWNLOAD', 'REGISTRATION', 'OTHER'];
  const audienceOpts = ['SME', 'Enterprise', 'Personal'];
  const regionOpts = ['UK', 'EU', 'APAC', 'US', 'Global'];
  const customerOpts = ['New', 'Existing', 'Both'];
  const contentOpts = ['Copy', 'Images', 'Video', 'Compliance'];

  const renderInput = (label: string, field: keyof FormData, type = 'text', placeholder = '', required = false) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );

  const renderTextarea = (label: string, field: keyof FormData, placeholder = '', required = false) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={form[field] as string}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
      />
    </div>
  );

  const renderChips = (label: string, field: keyof FormData, options: string[], tPrefix: string) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleArray(field, opt)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              (form[field] as string[]).includes(opt)
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            )}
          >
            {t(`${tPrefix}.${opt.toLowerCase().replace(/ /g, '')}`)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            {renderInput(t('req.title'), 'title', 'text', '', true)}
            {renderInput(t('req.requester'), 'requester', 'text', '', true)}
            {renderInput(t('req.contactEmail'), 'contactEmail', 'email', '', true)}
            {renderInput(t('req.launchDate'), 'desiredLaunchDate', 'date', '', true)}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isHardDeadline}
                  onChange={(e) => update('isHardDeadline', e.target.checked)}
                  className="rounded border-slate-300"
                />
                {t('req.isHardDDL')}
              </label>
              {form.isHardDeadline && renderTextarea(t('req.hardDeadlineReason'), 'hardDeadlineReason')}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">{t('req.priority')} <span className="text-red-500">*</span></label>
              <div className="flex gap-3">
                {priorityOptions.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => update('priority', p.value)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors',
                      form.priority === p.value ? p.color : 'bg-white text-slate-500 border-slate-200'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {renderTextarea(t('req.priorityReason'), 'priorityReason')}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">{t('req.goal')} <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {goalTypes.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update('goal', g)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      form.goal === g
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {t(`goal.${g.toLowerCase().replace('_', '')}`)}
                  </button>
                ))}
              </div>
            </div>
            {renderTextarea(t('req.goalDetail'), 'goalDetail', t('reqForm.goalPlaceholder'), true)}
            {renderTextarea(t('req.successMetric'), 'successMetric', t('reqForm.successPlaceholder'), true)}
            {renderInput(t('req.successMetricOwner'), 'successMetricOwner')}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {renderTextarea(t('req.pageScope'), 'pageScope', t('reqForm.scopePlaceholder'), true)}
            {renderChips(t('req.audience'), 'audience', audienceOpts, 'audience')}
            {renderChips(t('req.targetRegions'), 'targetRegions', regionOpts, 'region')}
            {renderChips(t('req.customerType'), 'customerType', customerOpts, 'customer')}
            {renderChips(t('req.contentAssets'), 'contentAssets', contentOpts, 'content')}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.designNeeded}
                  onChange={(e) => update('designNeeded', e.target.checked)}
                  className="rounded border-slate-300"
                />
                {t('req.designNeeded')}
              </label>
              {form.designNeeded && renderInput(t('req.figmaLink'), 'figmaLink', 'url')}
            </div>
            {renderTextarea(t('req.tracking'), 'trackingRequirements', t('reqForm.trackingPlaceholder'), true)}
            {renderTextarea(t('req.seoReview'), 'seoReviewPoints', t('reqForm.seoPlaceholder'), true)}
            {renderTextarea(t('req.dependencies'), 'dependencies', t('reqForm.dependenciesPlaceholder'))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            {renderTextarea(t('req.acceptance'), 'acceptanceCriteria', t('reqForm.acceptancePlaceholder'), true)}
            {renderInput(t('req.estimatedHours'), 'estimatedHours', 'number')}
            {renderInput(t('req.tags'), 'tags', 'text', 'tag1, tag2, tag3')}
            {renderTextarea(t('req.internalComments'), 'internalComments')}
          </div>
        );
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={closeRequirementDrawer} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-[680px] max-w-full bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b">
          <h2 className="text-lg font-semibold">
            {requirementDrawerId ? t('common.edit') : t('req.newRequirement')}
          </h2>
          <button onClick={closeRequirementDrawer} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <button
                  onClick={() => setStep(i)}
                  className={cn(
                    'w-full h-1.5 rounded-full transition-colors',
                    i <= step ? 'bg-[#0066FF]' : 'bg-slate-200'
                  )}
                />
                <div className={cn('text-xs mt-1 text-center', i === step ? 'text-[#0066FF] font-medium' : 'text-slate-400')}>
                  {t(`reqForm.${s}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{renderStep()}</div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t bg-slate-50">
          <button
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-md"
          >
            <Save size={16} />
            {t('req.saveDraft')}
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
                {t('common.previous')}
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-[#0066FF] text-white rounded-md hover:bg-[#0052cc]"
              >
                {t('common.next')}
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#0066FF] text-white rounded-md hover:bg-[#0052cc] disabled:opacity-50"
              >
                <Send size={16} />
                {t('req.submitRequirement')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
