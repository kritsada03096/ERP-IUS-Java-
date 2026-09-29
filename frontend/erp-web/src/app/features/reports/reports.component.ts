import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { ErpApiService } from '../../core/services/erp-api.service';
import { PurchaseRequest } from '../../shared/models/erp.model';
import { errorMessage } from '../../shared/models/api-error';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
@Component({
  selector: 'app-reports', imports: [DecimalPipe, StatusBadgeComponent],
  template: `
    <div class="page-heading"><div><span class="eyebrow">REPORTS</span><h1>รายงานใบขอซื้อ</h1><p class="muted">แสดงเฉพาะเอกสารที่คุณมีสิทธิ์เข้าถึง</p></div><button class="primary" (click)="print()">พิมพ์ / บันทึก PDF</button></div>
    @if (error()) { <div class="error" role="alert">{{ error() }} <button (click)="load()">ลองใหม่</button></div> }
    @if (loading()) { <p role="status">กำลังโหลดข้อมูล…</p> }
    <section class="panel"><div class="table-wrap"><table><thead><tr><th>เลขที่เอกสาร</th><th>แผนก</th><th>ผู้ขอ</th><th>สถานะ</th><th>ยอดรวม (บาท)</th></tr></thead><tbody>@for (p of purchases(); track p.id) { <tr><td class="document-number">{{ p.number }}</td><td>{{ p.departmentName }}</td><td>{{ p.requesterName }}</td><td><app-status-badge [status]="p.status" /></td><td>{{ p.total | number:'1.2-2' }}</td></tr> } @empty { @if (!loading()) { <tr><td colspan="5" class="empty">ยังไม่มีข้อมูลรายงาน</td></tr> } }</tbody></table></div><p class="total">ยอดเอกสารทุกสถานะ ฿{{ total() | number:'1.2-2' }}</p><p class="hint">รายงานนี้เป็นยอดใบขอซื้อ ไม่ใช่ยอดจ่ายเงินจริง</p></section>`
})
export class ReportsComponent {
  private readonly api = inject(ErpApiService);
  readonly purchases = signal<PurchaseRequest[]>([]); readonly error = signal(''); readonly loading = signal(false);
  constructor() { this.load(); }
  load(): void { this.error.set(''); this.loading.set(true); this.api.purchases().pipe(finalize(() => this.loading.set(false))).subscribe({ next: p => this.purchases.set(p), error: e => this.error.set(errorMessage(e)) }); }
  total(): number { return this.purchases().reduce((sum, p) => sum + p.total, 0); }
  print(): void { window.print(); }
}
