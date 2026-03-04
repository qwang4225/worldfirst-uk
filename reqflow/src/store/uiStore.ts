import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  requirementDrawerOpen: boolean;
  requirementDrawerId: string | null;
  openRequirementDrawer: (id?: string | null) => void;
  closeRequirementDrawer: () => void;
  notificationPanelOpen: boolean;
  toggleNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  requirementDrawerOpen: false,
  requirementDrawerId: null,
  openRequirementDrawer: (id = null) => set({ requirementDrawerOpen: true, requirementDrawerId: id }),
  closeRequirementDrawer: () => set({ requirementDrawerOpen: false, requirementDrawerId: null }),
  notificationPanelOpen: false,
  toggleNotificationPanel: () => set((state) => ({ notificationPanelOpen: !state.notificationPanelOpen })),
  closeNotificationPanel: () => set({ notificationPanelOpen: false }),
  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));
