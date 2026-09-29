import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ErpApiService } from '../../core/services/erp-api.service';
import { PurchaseRequest } from '../../shared/models/erp.model';
import { errorMessage } from '../../shared/models/api-error';
import { PurchaseDetailComponent } from '../../shared/components/purchase-detail.component';
@Component({
  selector: 'app-approval', imports: [FormsModule, PurchaseDetailComponent],
  template: `
    <div class="page-heading"><div><span class="eyebrow">APPROVAL CENTER</span><h1>อนุมัติเอกสาร</h1><p class="muted">รายการที่รอคุณพิจารณาตามสิทธิ์ของแผนก</p></div><button (click)="load()" [disabled]="busy() || loading()">รีเฟรช</button></div>
    @if (error()) { <div class="error" role="alert">{{ error() }}</div> }
    @if (success()) { <div class="success" role="status">{{ success() }}</div> }
    @if (loading()) { <p role="status">กำลังโหลดข้อมูล…</p> }
    @for (p of purchases(); track p.id) {
      <section class="panel approval-card"><app-purchase-detail [purchase]="p" />
      <form #form="ngForm" (ngSubmit)="decide(p.id, true)"><label>ความเห็นประกอบการพิจารณา<textarea [name]="'comment' + p.id" [(ngModel)]="comments[p.id]" required maxlength="1000" rows="2" placeholder="ระบุเหตุผลในการอนุมัติหรือปฏิเสธ"></textarea></label><div class="actions"><button class="primary" [disabled]="form.invalid || busy()">✓ อนุมัติ</button><button type="button" class="danger" [disabled]="form.invalid || busy()" (click)="decide(p.id, false)">ปฏิเสธ</button></div></form></section>
    } @empty { @if (!loading()) { <section class="panel empty"><div class="empty-icon">✓</div><h2>ไม่มีรายการรอพิจารณา</h2><p class="muted">เมื่อมีใบขอซื้อที่คุณมีสิทธิ์อนุมัติ รายการจะแสดงที่นี่</p></section> } }`
})
export class ApprovalComponent {
  private readonly api = inject(ErpApiService);
  readonly purchases = signal<PurchaseRequest[]>([]); readonly error = signal(''); readonly success = signal(''); readonly busy = signal(false); readonly loading = signal(false);
  comments: Record<number, string> = {};
  constructor() { this.load(); }
  load(): void { this.error.set(''); this.loading.set(true); this.api.approvals().pipe(finalize(() => this.loading.set(false))).subscribe({ next: p => this.purchases.set(p), error: e => this.error.set(errorMessage(e)) }); }
  decide(id: number, approved: boolean): void {
    const comment = this.comments[id]?.trim();
    if (!comment || this.busy()) return;
    this.busy.set(true); this.error.set(''); this.success.set('');
    this.api.decide(id, approved, comment).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => { delete this.comments[id]; this.success.set(approved ? 'อนุมัติใบขอซื้อแล้ว' : 'ปฏิเสธใบขอซื้อแล้ว'); this.load(); },
      error: e => this.error.set(errorMessage(e))
    });
  }
}
