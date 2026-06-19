import { create } from 'zustand';
import { RiskEvent, Annotation, ActionType, ScenarioResult } from '@/types';
import { mockEvents } from '@/data/mockEvents';
import { initialAnnotations } from '@/data/mockAnnotations';
import { getScenarioResult } from '@/data/mockScenarios';

interface AppState {
  events: RiskEvent[];
  annotations: Annotation[];
  selectedEventId: string | null;
  selectedAction: ActionType | null;
  currentScenarioResult: ScenarioResult | null;

  setSelectedEventId: (id: string | null) => void;
  setSelectedAction: (action: ActionType | null) => void;
  computeScenarioResult: (eventId: string, action: ActionType) => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  getEventById: (id: string) => RiskEvent | undefined;
  getAnnotationsByEventId: (eventId: string) => Annotation[];
}

export const useAppStore = create<AppState>((set, get) => ({
  events: mockEvents,
  annotations: initialAnnotations,
  selectedEventId: null,
  selectedAction: null,
  currentScenarioResult: null,

  setSelectedEventId: (id) => set({ selectedEventId: id }),

  setSelectedAction: (action) => {
    const state = get();
    if (action && state.selectedEventId) {
      const result = getScenarioResult(state.selectedEventId, action);
      set({ selectedAction: action, currentScenarioResult: result });
    } else {
      set({ selectedAction: action, currentScenarioResult: null });
    }
  },

  computeScenarioResult: (eventId, action) => {
    const result = getScenarioResult(eventId, action);
    set({ selectedAction: action, currentScenarioResult: result });
  },

  addAnnotation: (annotation) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann-${Date.now()}`,
      timestamp,
    };
    set((state) => ({
      annotations: [...state.annotations, newAnnotation],
    }));
  },

  getEventById: (id) => get().events.find((e) => e.id === id),

  getAnnotationsByEventId: (eventId) =>
    get().annotations.filter((a) => a.eventId === eventId),
}));
