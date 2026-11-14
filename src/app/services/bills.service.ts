import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Bill, createDemoBills } from '../models/bill.model';

const STORAGE_KEY = 'contacerta_bills_v1';
const INITIALIZED_KEY = 'contacerta_initialized_v1';
const DB_NAME = 'contacerta';

/** Persistência: SQLite nativo no Android/iOS, localStorage para demonstração web. */
@Injectable({ providedIn: 'root' })
export class BillsService {
  private database: SQLiteDBConnection | null = null;
  private ready = false;

  async initialize(): Promise<void> {
    if (this.ready) return;
    if (Capacitor.isNativePlatform()) {
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      this.database = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      await this.database.open();
      await this.database.execute(`
        CREATE TABLE IF NOT EXISTS contas (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          amount REAL NOT NULL,
          dueDate TEXT NOT NULL,
          category TEXT NOT NULL,
          priority TEXT NOT NULL,
          status TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          createdAt TEXT NOT NULL,
          paidAt TEXT
        );
        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      const hasSeed = await this.database.query('SELECT value FROM app_meta WHERE key = ?', [INITIALIZED_KEY]);
      if (!hasSeed.values?.length) {
        for (const example of createDemoBills()) await this.writeNative(example);
        await this.database.run('INSERT INTO app_meta (key, value) VALUES (?, ?)', [INITIALIZED_KEY, '1']);
      }
    } else if (localStorage.getItem(INITIALIZED_KEY) !== '1') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createDemoBills()));
      localStorage.setItem(INITIALIZED_KEY, '1');
    }
    this.ready = true;
  }

  async all(): Promise<Bill[]> {
    await this.initialize();
    if (this.database) {
      const result = await this.database.query('SELECT * FROM contas ORDER BY dueDate ASC, title ASC');
      return (result.values ?? []).map((row: Record<string, unknown>) => ({
        id: String(row['id']),
        title: String(row['title']),
        amount: Number(row['amount']),
        dueDate: String(row['dueDate']),
        category: row['category'] as Bill['category'],
        priority: row['priority'] as Bill['priority'],
        status: row['status'] as Bill['status'],
        notes: String(row['notes'] ?? ''),
        createdAt: String(row['createdAt']),
        paidAt: row['paidAt'] == null ? null : String(row['paidAt']),
      }));
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Os dados armazenados não estão em um formato válido.');
    return data as Bill[];
  }

  async save(bill: Bill): Promise<void> {
    await this.initialize();
    if (this.database) {
      await this.writeNative(bill);
      return;
    }
    const existing = await this.all();
    const index = existing.findIndex((item) => item.id === bill.id);
    if (index === -1) existing.push(bill);
    else existing[index] = bill;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }

  async delete(id: string): Promise<void> {
    await this.initialize();
    if (this.database) {
      await this.database.run('DELETE FROM contas WHERE id = ?', [id]);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify((await this.all()).filter((bill) => bill.id !== id)));
  }

  private async writeNative(bill: Bill): Promise<void> {
    if (!this.database) throw new Error('Banco de dados SQLite indisponível.');
    await this.database.run(`
      INSERT OR REPLACE INTO contas
      (id, title, amount, dueDate, category, priority, status, notes, createdAt, paidAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [bill.id, bill.title, bill.amount, bill.dueDate, bill.category, bill.priority,
        bill.status, bill.notes, bill.createdAt, bill.paidAt]);
  }
}
