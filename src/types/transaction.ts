export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'খাবার', icon: '🍛' },
  { id: 'transport', label: 'যাতায়াত', icon: '🚗' },
  { id: 'shopping', label: 'শপিং', icon: '🛒' },
  { id: 'bills', label: 'বিল', icon: '📄' },
  { id: 'health', label: 'স্বাস্থ্য', icon: '💊' },
  { id: 'entertainment', label: 'বিনোদন', icon: '🎬' },
  { id: 'education', label: 'শিক্ষা', icon: '📚' },
  { id: 'others', label: 'অন্যান্য', icon: '📦' },
] as const;

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'বেতন', icon: '💰' },
  { id: 'business', label: 'ব্যবসা', icon: '💼' },
  { id: 'investment', label: 'বিনিয়োগ', icon: '📈' },
  { id: 'freelance', label: 'ফ্রিল্যান্স', icon: '💻' },
  { id: 'gift', label: 'উপহার', icon: '🎁' },
  { id: 'others', label: 'অন্যান্য', icon: '📦' },
] as const;
