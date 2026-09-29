import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ErpApiService } from '../../../core/services/erp-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, ProductInput } from '../../../shared/models/erp.model';
import { errorMessage } from '../../../shared/models/api-error';
@Component({
  selector: 'app-products', imports: [FormsModule, DecimalPipe],
  template: `
    <div class="page-heading"><div><span class="eyebrow">MASTER DATA</span><h1>ข้อมูลสินค้า</h1><p class="muted">รายการสินค้าและราคากลางสำหรับใบขอซื้อ</p></div>@if (auth.isAdmin()) { <button class="primary" (click)="newProduct()">+ เพิ่มสินค้า</button> }</div>
    @if (error()) { <div class="error" role="alert">{{ error() }} <button (click)="load()">โหลดใหม่</button></div> }
    @if (editing()) { <form class="panel form-panel" #form="ngForm" (ngSubmit)="save()"><h2>{{ editingId === null ? 'เพิ่มสินค้า' : 'แก้ไขสินค้า' }}</h2><div class="form-grid">
      <label>รหัสสินค้า<input name="sku" [(ngModel)]="draft.sku" required pattern="[A-Z0-9_-]{2,40}"></label>
      <label>ชื่อสินค้า<input name="name" [(ngModel)]="draft.name" required maxlength="160"></label>
      <label>หน่วย<input name="unit" [(ngModel)]="draft.unit" required maxlength="30"></label>
      <label>ราคา (บาท)<input name="price" [(ngModel)]="draft.price" required type="number" min="0" max="999999999999.99" step="0.01"></label>
    </div><div class="actions"><button class="primary" [disabled]="form.invalid || busy()">บันทึกสินค้า</button><button type="button" (click)="editing.set(false)" [disabled]="busy()">ยกเลิก</button></div></form> }
    <section class="panel"><div class="panel-heading"><h2>สินค้าทั้งหมด</h2><label class="search"><span class="sr-only">ค้นหาสินค้า</span><input [(ngModel)]="search" placeholder="ค้นหารหัสหรือชื่อสินค้า…"></label></div>
    @if (loading()) { <p class="empty" role="status">กำลังโหลดข้อมูล…</p> }
    <div class="table-wrap"><table><thead><tr><th>รหัสสินค้า</th><th>ชื่อสินค้า</th><th>หน่วย</th><th>ราคา</th><th>สถานะ</th>@if (auth.isAdmin()) { <th>จัดการ</th> }</tr></thead><tbody>
      @for (p of filtered(); track p.id) { <tr><td><span class="tag">{{ p.sku }}</span></td><td><strong>{{ p.name }}</strong></td><td>{{ p.unit }}</td><td>฿{{ p.price | number:'1.2-2' }}</td><td><span class="badge" [attr.data-status]="p.active ? 'APPROVED' : 'REJECTED'">{{ p.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span></td>@if (auth.isAdmin()) { <td><div class="actions"><button (click)="edit(p)" [disabled]="busy()">แก้ไข</button>@if (p.active) { <button class="danger-text" (click)="deactivate(p)" [disabled]="busy()">ปิดใช้งาน</button> }</div></td> }</tr> }
      @empty { @if (!loading()) { <tr><td colspan="6" class="empty">ไม่พบสินค้า</td></tr> } }
    </tbody></table></div></section>`
})
export class ProductsComponent {
  private readonly api = inject(ErpApiService); readonly auth = inject(AuthService);
  readonly products = signal<Product[]>([]); readonly error = signal(''); readonly busy = signal(false); readonly loading = signal(false); readonly editing = signal(false);
  editingId: number | null = null; search = ''; draft: ProductInput = { sku: '', name: '', unit: '', price: 0 };
  constructor() { this.load(); }
  filtered(): Product[] { const q = this.search.toLowerCase(); return this.products().filter(p => (p.sku + p.name).toLowerCase().includes(q)); }
  load(): void { this.loading.set(true); this.error.set(''); this.api.products().pipe(finalize(() => this.loading.set(false))).subscribe({ next: p => this.products.set(p), error: e => this.error.set(errorMessage(e)) }); }
  newProduct(): void { this.editingId = null; this.draft = { sku: '', name: '', unit: '', price: 0 }; this.editing.set(true); }
  edit(p: Product): void { this.editingId = p.id; this.draft = { sku: p.sku, name: p.name, unit: p.unit, price: p.price }; this.editing.set(true); }
  save(): void {
    if (this.busy()) return;
    this.busy.set(true); this.error.set('');
    const action = this.editingId === null ? this.api.createProduct(this.draft) : this.api.updateProduct(this.editingId, this.draft);
    action.pipe(finalize(() => this.busy.set(false))).subscribe({ next: () => { this.editing.set(false); this.load(); }, error: e => this.error.set(errorMessage(e)) });
  }
  deactivate(p: Product): void {
    if (this.busy() || !window.confirm('ปิดใช้งานสินค้า ' + p.name + ' ?')) return;
    this.busy.set(true); this.api.deactivateProduct(p.id).pipe(finalize(() => this.busy.set(false))).subscribe({ next: () => this.load(), error: e => this.error.set(errorMessage(e)) });
  }
}
