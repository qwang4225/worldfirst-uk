export type Locale = 'en' | 'zh';

export type UserRole = 'ADMIN' | 'PM' | 'STAKEHOLDER' | 'DEVELOPER';
export type ProjectStatus = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSURE';
export type MemberRole = 'PM' | 'MEMBER' | 'STAKEHOLDER';
export type Priority = 'P0' | 'P1' | 'P2';
export type GoalType = 'CONVERSION' | 'AWARENESS' | 'LEAD_GEN' | 'DOWNLOAD' | 'REGISTRATION' | 'OTHER';
export type RequirementStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'IN_PROGRESS' | 'TESTING' | 'DONE' | 'REJECTED';
export type KanbanColumn = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type FileCategory = 'BRIEF' | 'DESIGN' | 'SPEC' | 'REPORT' | 'OTHER';

export const KANBAN_COLUMNS: KanbanColumn[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  INITIATION: 'bg-slate-100 text-slate-700',
  PLANNING: 'bg-amber-100 text-amber-700',
  EXECUTION: 'bg-blue-100 text-blue-700',
  MONITORING: 'bg-violet-100 text-violet-700',
  CLOSURE: 'bg-green-100 text-green-700',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  P0: 'bg-red-100 text-red-700 border-red-200',
  P1: 'bg-orange-100 text-orange-700 border-orange-200',
  P2: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const KANBAN_STATUS_COLORS: Record<KanbanColumn, string> = {
  BACKLOG: 'bg-slate-400',
  TODO: 'bg-sky-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-violet-500',
  DONE: 'bg-green-500',
};
