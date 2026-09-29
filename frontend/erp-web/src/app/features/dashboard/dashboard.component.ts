import { Component, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { ErpApiService } from '../../core/services/erp-api.service';
import { AuthService } from '../../core/services/auth.service';
import { Dashboard, PurchaseRequest } from '../../shared/models/erp.model';
import { errorMessage } from '../../shared/models/api-error';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
@Component({
  selector: 'app-dashboard', imports: [DecimalPipe, DatePipe, RouterLink, StatusBadgeComponent],
  template: `
    <div class="page-heading"><div><span class="eyebrow">OVERVIEW</span><h1>ภาพรวมการทำงาน</h1><p class="muted">สวัสดี {{ auth.user()?.displayName }} · ติดตามงานที่เกี่ยวข้องกับคุณ</p></div><a class="button primary" routerLink="/procurement">+ สร้างใบขอซื้อ</a></div>
    @if (error()) { <div class="error" role="alert">{{ error() }} <button (click)="load()">ลองใหม่</button></div> }
    @if (loading()) { <p role="status">กำลังโหลดข้อมูล…</p> }
    @if (summary(); as s) {
      <div class="stats"><article class="stat"><span>ใบขอซื้อที่เข้าถึงได้</span><strong>{{ s.visibleRequests }}</strong><small>เอกสารทั้งหมดตามสิทธิ์ของคุณ</small></article><article class="stat"><span>รอการอนุมัติ</span><strong class="amber">{{ s.pendingApproval }}</strong><small>เอกสารที่อยู่ระหว่างพิจารณา</small></article><article class="stat"><span>ยอดอนุมัติแล้ว</span><strong>฿{{ s.approvedTotal | number:'1.0-2' }}</strong><small>ยอดรวมตามใบขอซื้อ</small></article><article class="stat"><span>สินค้าที่เปิดใช้งาน</span><strong>{{ s.activeProducts }}</strong><small>ข้อมูลกลางสำหรับ {{ s.departments }} แผนก</small></article></div>
      <div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h2>ใบขอซื้อล่าสุด</h2><a routerLink="/procurement">ดูทั้งหมด →</a></div><div class="table-wrap"><table><thead><tr><th>เอกสาร / ผู้ขอ</th><th>ยอดรวม</th><th>สถานะ</th></tr></thead><tbody>
      @for (p of recent(); track p.id) { <tr><td><strong class="document-number">{{ p.number }}</strong><small>{{ p.requesterName }} · {{ p.createdAt | date:'dd/MM/yyyy' }}</small></td><td>฿{{ p.total | number:'1.2-2' }}</td><td><app-status-badge [status]="p.status" /></td></tr> }
      @empty { <tr><td colspan="3" class="empty">ยังไม่มีใบขอซื้อ เริ่มสร้างเอกสารแรกได้เลย</td></tr> }
      </tbody></table></div></section>
      <section class="panel workflow-panel"><span class="eyebrow">PURCHASE WORKFLOW</span><h2>จากความต้องการ<br>สู่การอนุมัติ</h2><ol class="workflow"><li><b>01</b><div>สร้างใบขอซื้อ<small>เลือกสินค้าและระบุเหตุผล</small></div></li><li><b>02</b><div>ส่งให้หัวหน้าพิจารณา<small>ผู้อนุมัติตามสิทธิ์แผนก</small></div></li><li><b>03</b><div>ติดตามผลการอนุมัติ<small>ตรวจสอบประวัติได้ทุกขั้นตอน</small></div></li></ol><p class="hint">PO, คลังสินค้า, ขาย และการเงิน<br>อยู่ในแผนพัฒนาระยะถัดไป</p></section></div>
    }`
})
export class DashboardComponent {
  private readonly api = inject(ErpApiService); readonly auth = inject(AuthService);
  readonly summary = signal<Dashboard | null>(null); readonly recent = signal<PurchaseRequest[]>([]);
  readonly error = signal(''); readonly loading = signal(false);
  constructor() { this.load(); }
  load(): void {
    this.error.set(''); this.loading.set(true);
    forkJoin({ summary: this.api.dashboard(), purchases: this.api.purchases() }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: data => { this.summary.set(data.summary); this.recent.set(data.purchases.slice(0, 5)); }, error: e => this.error.set(errorMessage(e))
    });
  }
}
