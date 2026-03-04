import { create } from 'zustand';

interface Project {
  id: string;
  name: string;
  nameZh: string;
  description: string | null;
  descriptionZh: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  setProjects: (projects) => set({ projects }),
}));
