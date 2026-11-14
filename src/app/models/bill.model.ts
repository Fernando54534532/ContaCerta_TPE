export type Category = 'Moradia' | 'Água' | 'Energia' | 'Internet' | 'Cartão' | 'Assinatura' | 'Outros';
export type Priority = 'alta' | 'media' | 'baixa';
export type BillStatus = 'pendente' | 'paga';

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD em horário local
  category: Category;
  priority: Priority;
  status: BillStatus;
  notes: string;
  createdAt: string;
  paidAt: string | null;
}

export interface BillDraft {
  title: string;
  amount: number | null;
  dueDate: string;
  category: Category;
  priority: Priority;
  notes: string;
}

export const CATEGORIES: Category[] = ['Moradia', 'Água', 'Energia', 'Internet', 'Cartão', 'Assinatura', 'Outros'];

export function localIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function relativeDate(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return localIsoDate(date);
}

export function dateFromIso(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function createDemoBills(): Bill[] {
  const now = new Date().toISOString();
  const examples: Array<[string, number, Category, number, Priority, BillStatus]> = [
    ['Aluguel do apartamento', 1450, 'Moradia', 3, 'alta', 'pendente'],
    ['Conta de energia', 182.65, 'Energia', 1, 'alta', 'pendente'],
    ['Internet residencial', 109.90, 'Internet', 6, 'media', 'pendente'],
    ['Fatura do cartão', 728.40, 'Cartão', -2, 'alta', 'pendente'],
    ['Conta de água', 78.25, 'Água', -5, 'media', 'paga'],
    ['Streaming mensal', 39.90, 'Assinatura', 12, 'baixa', 'pendente'],
  ];
  return examples.map(([title, amount, category, offset, priority, status], index) => ({
    id: `exemplo-${index + 1}`,
    title,
    amount,
    category,
    dueDate: relativeDate(offset),
    priority,
    status,
    notes: index === 0 ? 'Exemplo para demonstração do trabalho de TPE.' : '',
    createdAt: now,
    paidAt: status === 'paga' ? now : null,
  }));
}
