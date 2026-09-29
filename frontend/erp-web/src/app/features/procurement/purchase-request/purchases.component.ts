import { Component, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { ErpApiService } from '../../../core/services/erp-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, PurchaseRequest } from '../../../shared/models/erp.model';
import { errorMessage } from '../../../shared/models/api-error';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { PurchaseDetailComponent } from '../../../shared/components/purchase-detail.component';
@Component({
  selector: 'app-purchases', imports: [FormsModule, DecimalPipe, DatePipe, StatusBadgeComponent, PurchaseDetailComponent],
  template: `
    <div class="page-heading"><div><span class="eyebrow">PROCUREMENT</span><h1>ใบขอซื้อ</h1><p class="muted">จัดทำคำขอและติดตามการอนุมัติของแผนก</p></div><button class="primary" (click)="creating.set(!creating())" [disabled]="loading() || busy()">+ สร้างใบขอซื้อ</button></div>
    @if (error()) { <div class="error" role="alert">{{ error() }} <button (click)="load()">โหลดใหม่</button></div> }
    @if (success()) { <div class="success" role="status">{{ success() }}</div> }
    @if (creating()) {
      <form class="panel form-panel" #form="ngForm" (ngSubmit)="create()"><h2>ใบขอซื้อใหม่</h2><p class="muted">แผนก {{ auth.user()?.departmentName }} · บันทึกเป็นฉบับร่างก่อนส่งอนุมัติ</p>
      <label>เหตุผลในการขอซื้อ<textarea name="reason" [(ngModel)]="reason" required maxlength="1000" rows="3" placeholder="ระบุความจำเป็นในการใช้งาน"></textarea></label>
      @for (line of lines; track line.key; let index = $index) {
        <div class="item-form"><label>สินค้า<select [name]="'product' + line.key" [(ngModel)]="line.productId" required><option [ngValue]="null" disabled>เลือกสินค้า</option>@for (p of products(); track p.id) { <option [ngValue]="p.id">{{ p.name }} · ฿{{ p.price | number:'1.2-2' }} / {{ p.unit }}</option> }</select></label>
        <label>จำนวน<input [name]="'quantity' + line.key" [(ngModel)]="line.quantity" required type="number" min="1" max="100000" step="1"></label><button type="button" class="danger-text" [disabled]="lines.length === 1" (click)="removeLine(index)">ลบ</button></div>
      }
      <button type="button" (click)="addLine()" [disabled]="lines.length >= 100">+ เพิ่มรายการ</button><p class="total">ยอดประมาณการ ฿{{ estimate() | number:'1.2-2' }}</p><p class="hint">ระบบใช้ราคากลาง ณ เวลาบันทึกเอกสาร</p>
      <div class="actions"><button class="primary" [disabled]="form.invalid || busy()">{{ busy() ? 'กำลังบันทึก…' : 'บันทึกฉบับร่าง' }}</button><button type="button" (click)="creating.set(false)" [disabled]="busy()">ยกเลิก</button></div></form>
    }
    <section class="panel"><div class="panel-heading"><h2>เอกสารของคุณ</h2><span class="tag">{{ purchases().length }} รายการ</span></div>
    @if (loading()) { <p class="empty" role="status">กำลังโหลดข้อมูล…</p> }
    <div class="table-wrap"><table><thead><tr><th>เลขที่เอกสาร / วันที่</th><th>ผู้ขอ / แผนก</th><th>ยอดรวม</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>
    @for (p of purchases(); track p.id) { <tr><td><strong class="document-number">{{ p.number }}</strong><small>{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</small></td><td>{{ p.requesterName }}<small>{{ p.departmentName }}</small></td><td>฿{{ p.total | number:'1.2-2' }}</td><td><app-status-badge [status]="p.status" /></td><td><div class="actions"><button (click)="selected.set(selected()?.id === p.id ? null : p)">รายละเอียด</button>@if (p.status === 'DRAFT' && p.requesterId === auth.user()?.id) { <button class="primary" [disabled]="busy()" (click)="submit(p)">ส่งอนุมัติ</button> }</div></td></tr> }
    @empty { @if (!loading()) { <tr><td colspan="5" class="empty">ยังไม่มีใบขอซื้อ เริ่มต้นด้วยปุ่ม “สร้างใบขอซื้อ”</td></tr> } }
    </tbody></table></div></section>
    @if (selected(); as p) { <section class="panel detail-panel"><button class="close-detail" (click)="selected.set(null)">ปิดรายละเอียด</button><app-purchase-detail [purchase]="p" /></section> }`
})
export class PurchasesComponent {
  private readonly api = inject(ErpApiService); readonly auth = inject(AuthService);
  readonly purchases = signal<PurchaseRequest[]>([]); readonly products = signal<Product[]>([]); readonly selected = signal<PurchaseRequest | null>(null);
  readonly creating = signal(false); readonly busy = signal(false); readonly loading = signal(false); readonly error = signal(''); readonly success = signal('');
  reason = ''; private nextKey = 1; lines: { key: number; productId: number | null; quantity: number }[] = [{ key: 0, productId: null, quantity: 1 }];
  constructor() { this.load(); }
  addLine(): void { this.lines.push({ key: this.nextKey++, productId: null, quantity: 1 }); }
  removeLine(index: number): void { this.lines.splice(index, 1); }
  estimate(): number { return this.lines.reduce((sum, l) => sum + (this.products().find(p => p.id === l.productId)?.price ?? 0) * (l.quantity || 0), 0); }
  load(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({ purchases: this.api.purchases(), products: this.api.products() }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: data => { this.purchases.set(data.purchases); this.products.set(data.products.filter(p => p.active)); const id = this.selected()?.id; this.selected.set(data.purchases.find(p => p.id === id) ?? null); }, error: e => this.error.set(errorMessage(e))
    });
  }
  create(): void {
    if (this.busy()) return;
    if (this.lines.some(l => l.productId === null || !Number.isInteger(l.quantity) || l.quantity < 1)) { this.error.set('กรุณาเลือกสินค้าและระบุจำนวนเต็มที่มากกว่า 0'); return; }
    if (new Set(this.lines.map(l => l.productId)).size !== this.lines.length) { this.error.set('สินค้าในใบขอซื้อห้ามซ้ำ'); return; }
    this.busy.set(true); this.error.set(''); this.success.set('');
    this.api.createPurchase({ reason: this.reason, items: this.lines.map(l => ({ productId: l.productId!, quantity: l.quantity })) }).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: p => { this.creating.set(false); this.reason = ''; this.lines = [{ key: this.nextKey++, productId: null, quantity: 1 }]; this.selected.set(p); this.success.set('บันทึกฉบับร่างแล้ว ตรวจสอบรายละเอียดก่อนกดส่งอนุมัติ'); this.load(); },
      error: e => this.error.set(errorMessage(e))
    });
  }
  submit(p: PurchaseRequest): void {
    if (this.busy()) return;
    this.busy.set(true); this.error.set(''); this.success.set('');
    this.api.submitPurchase(p.id).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: updated => { this.selected.set(updated); this.success.set('ส่งใบขอซื้อให้ผู้อนุมัติแล้ว'); this.load(); }, error: e => this.error.set(errorMessage(e))
    });
  }
}
