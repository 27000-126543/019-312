import { create } from 'zustand';
import {
  RiskEvent,
  Annotation,
  ActionType,
  ScenarioResult,
  TodoItem,
  MeetingState,
  MeetingStep,
  AnnotationCategory,
} from '@/types';
import { mockEvents } from '@/data/mockEvents';
import { initialAnnotations } from '@/data/mockAnnotations';
import { getScenarioResult } from '@/data/mockScenarios';

function resolveOwnerFromContent(content: string, annotation: Annotation): { name: string; role: string } {
  if (content.includes('发布声明') || content.includes('声明')) return { name: '品牌公关部', role: '品牌公关部' };
  if (content.includes('法务复核') || content.includes('法务')) return { name: '法务部', role: '法务部' };
  if (content.includes('数字银行') || content.includes('减免')) return { name: '数字银行部', role: '数字银行部' };
  if (content.includes('分行') || content.includes('支行')) return { name: '属地分行', role: '属地分行' };
  if (content.includes('内部核实') || content.includes('内审')) return { name: '内审部', role: '内审部' };
  if (content.includes('整改')) return { name: '业务部门', role: '业务部门' };
  return { name: annotation.author, role: annotation.role };
}

function generateInitialTodos(annotations: Annotation[], events: RiskEvent[]): TodoItem[] {
  const todos: TodoItem[] = [];
  annotations.forEach((ann) => {
    if (!ann.category || !['approval', 'review', 'delegation'].includes(ann.category)) return;
    const event = events.find((e) => e.id === ann.eventId);
    if (!event) return;
    const owner = resolveOwnerFromContent(ann.content, ann);
    todos.push({
      id: `todo-init-${ann.id}`,
      eventId: event.id,
      eventTitle: event.title,
      content: ann.content,
      owner: owner.name,
      ownerRole: owner.role,
      status: 'pending',
      createdAt: ann.timestamp,
      sourceAnnotationId: ann.id,
      category: ann.category as AnnotationCategory,
    });
  });
  return todos;
}

interface AppState {
  events: RiskEvent[];
  annotations: Annotation[];
  todos: TodoItem[];
  selectedEventId: string | null;
  selectedAction: ActionType | null;
  currentScenarioResult: ScenarioResult | null;
  allScenarioResults: Record<string, ScenarioResult> | null;
  meeting: MeetingState;
  detailModalEventId: string | null;

  setSelectedEventId: (id: string | null) => void;
  setSelectedAction: (action: ActionType | null) => void;
  computeScenarioResult: (eventId: string, action: ActionType) => void;
  computeAllScenarioResults: (eventId: string) => void;
  resetScenarioState: () => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  addTodoFromAnnotation: (
    annotation: Annotation,
    event: RiskEvent,
    category: AnnotationCategory
  ) => void;
  updateTodoStatus: (todoId: string, status: TodoItem['status']) => void;
  getEventById: (id: string) => RiskEvent | undefined;
  getAnnotationsByEventId: (eventId: string) => Annotation[];
  getTodosByEventId: (eventId: string) => TodoItem[];

  setDetailModalEventId: (id: string | null) => void;

  toggleMeetingEvent: (eventId: string) => void;
  setMeetingSelectedEvents: (eventIds: string[]) => void;
  startMeeting: () => void;
  endMeeting: () => void;
  setMeetingStep: (step: MeetingStep) => void;
  nextMeetingStep: () => void;
  prevMeetingEvent: () => void;
  nextMeetingEvent: () => void;
  setCurrentMeetingEventIndex: (index: number, step?: MeetingStep) => void;
  markEventDiscussed: (eventId: string) => void;

  getMeetingEvents: () => RiskEvent[];
  getCurrentMeetingEvent: () => RiskEvent | null;
  getMeetingAnnotations: () => Annotation[];
  getMeetingTodos: () => TodoItem[];
}

export const useAppStore = create<AppState>((set, get) => ({
  events: mockEvents,
  annotations: initialAnnotations,
  todos: generateInitialTodos(initialAnnotations, mockEvents),
  selectedEventId: null,
  selectedAction: null,
  currentScenarioResult: null,
  allScenarioResults: null,
  meeting: {
    isActive: false,
    selectedEventIds: [],
    currentEventIndex: 0,
    currentStep: 'overview',
    discussedEventIds: [],
  },
  detailModalEventId: null,

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

  computeAllScenarioResults: (eventId) => {
    const actions: ActionType[] = ['silence', 'customer_service', 'official_statement', 'business_rectification'];
    const results: Record<string, ScenarioResult> = {};
    actions.forEach((action) => {
      const result = getScenarioResult(eventId, action);
      if (result) {
        results[action] = result;
      }
    });
    set({ allScenarioResults: results, selectedAction: null, currentScenarioResult: null });
  },

  resetScenarioState: () => {
    set({
      selectedAction: null,
      currentScenarioResult: null,
      allScenarioResults: null,
    });
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

    const event = get().getEventById(annotation.eventId);
    if (event && annotation.category && ['approval', 'review', 'delegation'].includes(annotation.category)) {
      get().addTodoFromAnnotation(newAnnotation, event, annotation.category);
    }

    return newAnnotation;
  },

  addTodoFromAnnotation: (annotation, event, category) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const defaultOwner = resolveOwnerFromContent(annotation.content, annotation);

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      content: annotation.content,
      owner: defaultOwner.name,
      ownerRole: defaultOwner.role,
      status: 'pending',
      createdAt: timestamp,
      sourceAnnotationId: annotation.id,
      category,
    };

    set((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },

  updateTodoStatus: (todoId, status) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === todoId ? { ...t, status } : t)),
    }));
  },

  getEventById: (id) => get().events.find((e) => e.id === id),

  getAnnotationsByEventId: (eventId) =>
    get().annotations.filter((a) => a.eventId === eventId),

  getTodosByEventId: (eventId) => get().todos.filter((t) => t.eventId === eventId),

  setDetailModalEventId: (id) => set({ detailModalEventId: id }),

  toggleMeetingEvent: (eventId) => {
    set((state) => {
      const isSelected = state.meeting.selectedEventIds.includes(eventId);
      return {
        meeting: {
          ...state.meeting,
          selectedEventIds: isSelected
            ? state.meeting.selectedEventIds.filter((id) => id !== eventId)
            : [...state.meeting.selectedEventIds, eventId],
        },
      };
    });
  },

  setMeetingSelectedEvents: (eventIds) => {
    set((state) => ({
      meeting: {
        ...state.meeting,
        selectedEventIds: eventIds,
      },
    }));
  },

  startMeeting: () => {
    const now = new Date();
    const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    set((state) => ({
      meeting: {
        ...state.meeting,
        isActive: true,
        currentEventIndex: 0,
        currentStep: 'overview',
        discussedEventIds: [],
        startTime,
      },
    }));
  },

  endMeeting: () => {
    set((state) => ({
      meeting: {
        ...state.meeting,
        isActive: false,
      },
    }));
  },

  setMeetingStep: (step) => {
    set((state) => ({
      meeting: {
        ...state.meeting,
        currentStep: step,
      },
    }));
  },

  nextMeetingStep: () => {
    const state = get();
    const steps: MeetingStep[] = ['overview', 'scenario', 'annotations'];
    const currentIdx = steps.indexOf(state.meeting.currentStep);
    if (currentIdx < steps.length - 1) {
      set({
        meeting: {
          ...state.meeting,
          currentStep: steps[currentIdx + 1],
        },
      });
    } else if (state.meeting.currentEventIndex < state.meeting.selectedEventIds.length - 1) {
      const currentEventId = state.meeting.selectedEventIds[state.meeting.currentEventIndex];
      const nextIndex = state.meeting.currentEventIndex + 1;
      set({
        meeting: {
          ...state.meeting,
          currentEventIndex: nextIndex,
          currentStep: 'overview',
          discussedEventIds: state.meeting.discussedEventIds.includes(currentEventId)
            ? state.meeting.discussedEventIds
            : [...state.meeting.discussedEventIds, currentEventId],
        },
      });
      get().resetScenarioState();
    }
  },

  prevMeetingEvent: () => {
    const state = get();
    if (state.meeting.currentEventIndex > 0) {
      set({
        meeting: {
          ...state.meeting,
          currentEventIndex: state.meeting.currentEventIndex - 1,
        },
      });
      get().resetScenarioState();
    }
  },

  nextMeetingEvent: () => {
    const state = get();
    if (state.meeting.currentEventIndex < state.meeting.selectedEventIds.length - 1) {
      set({
        meeting: {
          ...state.meeting,
          currentEventIndex: state.meeting.currentEventIndex + 1,
        },
      });
      get().resetScenarioState();
    }
  },

  setCurrentMeetingEventIndex: (index, step) => {
    set((state) => ({
      meeting: {
        ...state.meeting,
        currentEventIndex: index,
        currentStep: step || state.meeting.currentStep,
      },
    }));
    get().resetScenarioState();
  },

  markEventDiscussed: (eventId) => {
    set((state) => {
      if (state.meeting.discussedEventIds.includes(eventId)) return {};
      return {
        meeting: {
          ...state.meeting,
          discussedEventIds: [...state.meeting.discussedEventIds, eventId],
        },
      };
    });
  },

  getMeetingEvents: () => {
    const state = get();
    return state.meeting.selectedEventIds
      .map((id) => state.getEventById(id))
      .filter((e): e is RiskEvent => e !== undefined);
  },

  getCurrentMeetingEvent: () => {
    const state = get();
    if (state.meeting.selectedEventIds.length === 0) return null;
    const eventId = state.meeting.selectedEventIds[state.meeting.currentEventIndex];
    return state.getEventById(eventId) || null;
  },

  getMeetingAnnotations: () => {
    const state = get();
    return state.annotations.filter((a) =>
      state.meeting.selectedEventIds.includes(a.eventId)
    );
  },

  getMeetingTodos: () => {
    const state = get();
    return state.todos.filter((t) =>
      state.meeting.selectedEventIds.includes(t.eventId)
    );
  },
}));
