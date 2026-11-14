import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonApp, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline,
  barChartOutline, calendarOutline, checkmarkCircleOutline, checkmarkDoneOutline,
  checkmarkOutline, chevronForwardOutline, closeOutline, documentTextOutline,
  homeOutline, informationCircleOutline, gridOutline, pencilOutline, receiptOutline,
  searchOutline, sparklesOutline, timeOutline, trashOutline, walletOutline,
} from 'ionicons/icons';
import {
  Bill, BillDraft, Category, CATEGORIES, dateFromIso, localIsoDate,
  Priority,
} from './models/bill.model';
import { BillsService } from './services/bills.service';

type Screen = 'home' | 'bills' | 'categories' | 'reports' | 'form';
type StatusFilter = 'todas' | 'pendentes' | 'pagas' | 'vencidas';
interface CategoryTotal { category: Category; total: number; count: number; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IonApp, IonContent, IonIcon, IonSpinner],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly categories = CATEGORIES;
  readonly dateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  screen: Screen = 'home';
  returnScreen: Screen = 'bills';
  bills: Bill[] = [];
  loading = true;
  saving = false;
  storageError = '';
  formError = '';
  notice = '';
  search = '';
  statusFilter: StatusFilter = 'todas';
  categoryFilter: Category | 'Todas' = 'Todas';
  editingId: string | null = null;
  draft: BillDraft = this.emptyDraft();
  private noticeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly service: BillsService) {
    addIcons({
      addOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline,
      barChartOutline, calendarOutline, checkmarkCircleOutline, checkmarkDoneOutline,
      checkmarkOutline, chevronForwardOutline, closeOutline, documentTextOutline,
      homeOutline, informationCircleOutline, gridOutline, pencilOutline, receiptOutline,
      searchOutline, sparklesOutline, timeOutline, trashOutline, walletOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading = true;
    this.storageError = '';
    try {
      this.bills = await this.service.all();
    } catch (error) {
      this.storageError = `Não foi possível acessar os dados locais. ${this.errorText(error)}`;
    } finally {
      this.loading = false;
    }
  }

  get today(): string { return localIsoDate(new Date()); }
  get pendingBills(): Bill[] { return this.bills.filter(b => b.status === 'pendente'); }
  get paidBills(): Bill[] { return this.bills.filter(b => b.status === 'paga'); }
  get pendingValue(): number { return this.pendingBills.reduce((sum, b) => sum + b.amount, 0); }
  get paidValue(): number { return this.paidBills.reduce((sum, b) => sum + b.amount, 0); }
  get overdueBills(): Bill[] { return this.pendingBills.filter(b => b.dueDate < this.today); }
  get soonBills(): Bill[] {
    const limit = new Date(); limit.setDate(limit.getDate() + 7);
    const endDate = localIsoDate(limit);
    return this.pendingBills.filter(b => b.dueDate >= this.today && b.dueDate <= endDate);
  }
  get upcomingBills(): Bill[] {
    return [...this.pendingBills].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  }
  get paidThisMonth(): number {
    const month = this.today.slice(0, 7);
    return this.paidBills.filter(b => b.paidAt && localIsoDate(new Date(b.paidAt)).startsWith(month))
      .reduce((sum, b) => sum + b.amount, 0);
  }
  get visibleBills(): Bill[] {
    const term = this.search.trim().toLocaleLowerCase('pt-BR');
    return this.bills.filter(b => {
      const byTerm = !term || `${b.title} ${b.notes} ${b.category}`.toLocaleLowerCase('pt-BR').includes(term);
      const byCategory = this.categoryFilter === 'Todas' || b.category === this.categoryFilter;
      const byStatus = this.statusFilter === 'todas'
        || (this.statusFilter === 'pendentes' && b.status === 'pendente')
        || (this.statusFilter === 'pagas' && b.status === 'paga')
        || (this.statusFilter === 'vencidas' && this.isOverdue(b));
      return byTerm && byCategory && byStatus;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title));
  }
  get categoryTotals(): CategoryTotal[] {
    return this.categories.map(category => {
      const items = this.bills.filter(b => b.category === category && b.status === 'pendente');
      return { category, count: items.length, total: items.reduce((s, b) => s + b.amount, 0) };
    }).filter(item => item.count > 0).sort((a, b) => b.total - a.total);
  }
  get categoryOverview(): Array<{ category: Category; count: number; pending: number; paid: number; pendingValue: number }> {
    return this.categories.map(category => {
      const items = this.bills.filter(b => b.category === category);
      const pendentes = items.filter(b => b.status === 'pendente');
      return {
        category,
        count: items.length,
        pending: pendentes.length,
        paid: items.length - pendentes.length,
        pendingValue: pendentes.reduce((sum, b) => sum + b.amount, 0),
      };
    });
  }

  showCategory(category: Category): void {
    this.clearFilters();
    this.categoryFilter = category;
    this.go('bills');
  }

  get completionPercent(): number {
    return this.bills.length ? Math.round(this.paidBills.length / this.bills.length * 100) : 0;
  }

  go(screen: Exclude<Screen, 'form'>): void {
    this.screen = screen;
    this.formError = '';
  }

  newBill(): void {
    this.returnScreen = this.screen === 'form' ? 'bills' : this.screen;
    this.editingId = null;
    this.draft = this.emptyDraft();
    this.formError = '';
    this.screen = 'form';
  }

  editBill(bill: Bill): void {
    this.returnScreen = this.screen === 'form' ? 'bills' : this.screen;
    this.editingId = bill.id;
    this.draft = {
      title: bill.title, amount: bill.amount, dueDate: bill.dueDate,
      category: bill.category, priority: bill.priority, notes: bill.notes,
    };
    this.formError = '';
    this.screen = 'form';
  }

  cancelEdit(): void {
    this.screen = this.returnScreen === 'form' ? 'bills' : this.returnScreen;
    this.formError = '';
  }

  async saveBill(): Promise<void> {
    if (this.saving) return;
    const title = this.draft.title.trim();
    const amount = Number(this.draft.amount);
    const dueDate = this.draft.dueDate;
    if (!title) { this.formError = 'Informe uma descrição para a conta.'; return; }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999) {
      this.formError = 'Informe um valor válido maior que zero.'; return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(dateFromIso(dueDate).getTime())
      || localIsoDate(dateFromIso(dueDate)) !== dueDate) {
      this.formError = 'Informe uma data de vencimento válida.'; return;
    }
    this.saving = true;
    this.formError = '';
    const existing = this.bills.find(b => b.id === this.editingId);
    const bill: Bill = {
      id: existing?.id ?? this.newId(), title, amount: Math.round(amount * 100) / 100,
      dueDate, category: this.draft.category, priority: this.draft.priority,
      notes: this.draft.notes.trim(),
      status: existing?.status ?? 'pendente',
      paidAt: existing?.paidAt ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    try {
      await this.service.save(bill);
      this.bills = await this.service.all();
      this.screen = 'bills';
      this.toast(existing ? 'Conta atualizada com sucesso.' : 'Conta cadastrada com sucesso.');
    } catch (error) {
      this.formError = `Erro ao salvar a conta. ${this.errorText(error)}`;
    } finally {
      this.saving = false;
    }
  }

  async togglePaid(bill: Bill): Promise<void> {
    const nextStatus = bill.status === 'paga' ? 'pendente' : 'paga';
    try {
      await this.service.save({
        ...bill, status: nextStatus, paidAt: nextStatus === 'paga' ? new Date().toISOString() : null,
      });
      this.bills = await this.service.all();
      this.toast(nextStatus === 'paga' ? 'Conta marcada como paga.' : 'Conta reaberta como pendente.');
    } catch (error) {
      this.toast(`Não foi possível alterar a conta. ${this.errorText(error)}`);
    }
  }

  async deleteBill(bill: Bill): Promise<void> {
    if (!window.confirm(`Excluir a conta "${bill.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await this.service.delete(bill.id);
      this.bills = await this.service.all();
      this.toast('Conta excluída.');
      if (this.editingId === bill.id) this.go('bills');
    } catch (error) {
      this.toast(`Erro ao excluir a conta. ${this.errorText(error)}`);
    }
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = 'todas';
    this.categoryFilter = 'Todas';
  }

  money(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  shortDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(dateFromIso(value)).replace('.', '');
  }

  fullDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(dateFromIso(value));
  }

  isOverdue(bill: Bill): boolean { return bill.status === 'pendente' && bill.dueDate < this.today; }
  isDueToday(bill: Bill): boolean { return bill.status === 'pendente' && bill.dueDate === this.today; }

  dueLabel(bill: Bill): string {
    if (bill.status === 'paga') return 'Paga';
    if (this.isOverdue(bill)) return 'Vencida';
    if (this.isDueToday(bill)) return 'Vence hoje';
    return 'Pendente';
  }

  priorityText(value: Priority): string {
    return value === 'alta' ? 'Alta' : value === 'media' ? 'Média' : 'Baixa';
  }

  categoryIcon(category: Category): string {
    const icons: Record<Category, string> = {
      'Moradia': 'home-outline', 'Água': 'document-text-outline',
      'Energia': 'sparkles-outline', 'Internet': 'bar-chart-outline',
      'Cartão': 'wallet-outline', 'Assinatura': 'receipt-outline',
      'Outros': 'document-text-outline',
    };
    return icons[category];
  }

  categoryPercent(value: number): number {
    return this.pendingValue > 0 ? Math.min(100, Math.max(0, value / this.pendingValue * 100)) : 0;
  }

  private emptyDraft(): BillDraft {
    return { title: '', amount: null, dueDate: localIsoDate(new Date()),
      category: 'Moradia', priority: 'media', notes: '' };
  }

  private newId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private errorText(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private toast(message: string): void {
    this.notice = message;
    if (this.noticeTimeout) clearTimeout(this.noticeTimeout);
    this.noticeTimeout = setTimeout(() => { this.notice = ''; }, 3500);
  }
}
