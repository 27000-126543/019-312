import { Annotation, QuickAnnotation } from '@/types';

export const initialAnnotations: Annotation[] = [
  {
    id: 'ann-001',
    eventId: 'evt-001',
    author: '张行长',
    role: '行长',
    content: '此事必须高度重视，同意先发布官方声明，同时安排专人上门安抚客户。',
    timestamp: '09:15',
    category: 'approval',
  },
  {
    id: 'ann-002',
    eventId: 'evt-001',
    author: '李总',
    role: '合规总监',
    content: '请法务部复核声明文稿，确保措辞严谨，不产生新的法律风险。',
    timestamp: '09:18',
    category: 'review',
  },
  {
    id: 'ann-003',
    eventId: 'evt-002',
    author: '王行长',
    role: '副行长',
    content: '由数字银行部牵头处理，对受影响用户统一给予三个月转账手续费减免。',
    timestamp: '09:25',
    category: 'delegation',
  },
];

export const quickAnnotations: QuickAnnotation[] = [
  { id: 'qa-1', label: '同意发布声明', category: 'approval' },
  { id: 'qa-2', label: '请法务复核', category: 'review' },
  { id: 'qa-3', label: '由分行先沟通', category: 'delegation' },
  { id: 'qa-4', label: '先内部核实', category: 'delegation' },
  { id: 'qa-5', label: '建议谨慎处理', category: 'other' },
  { id: 'qa-6', label: '纳入本周督办', category: 'other' },
  { id: 'qa-7', label: '持续监测舆情', category: 'other' },
  { id: 'qa-8', label: '同意整改方案', category: 'approval' },
];
