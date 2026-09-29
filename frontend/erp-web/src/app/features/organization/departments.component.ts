import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ErpApiService } from '../../core/services/erp-api.service';
import { AuthService } from '../../core/services/auth.service';
import { Department } from '../../shared/models/erp.model';
import { errorMessage } from '../../shared/models/api-error';
@Component({
  selector: 'app-departments', imports: [FormsModule],
  template: `
    <div class="page-heading"><div><span class="eyebrow">ORGANIZATION</span><h1>แผนกในองค์กร</h1><p class="muted">โครงสร้างแผนกสำหรับผู้ใช้งานและการอนุมัติ</p></div></div>
    @if (error()) { <div class="error" role="alert">{{ error() }} <button (click)="load()">โหลดใหม่</button></div> }
    @if (auth.isAdmin()) { <form class="panel inline-form" #form="ngForm" (ngSubmit)="create()"><label>รหัสแผนก<input name="code" [(ngModel)]="code" required pattern="[A-Z0-9_-]{2,30}" placeholder="เช่น LEGAL"></label><label>ชื่อแผนก<input name="name" [(ngModel)]="name" required maxlength="120"></label><button class="primary" [disabled]="form.invalid || busy()">+ เพิ่มแผนก</button></form> }
    @if (loading()) { <p role="status">กำลังโหลดข้อมูล…</p> }
    <div class="department-grid">@for (d of departments(); track d.id) { <article class="panel department"><span class="department-icon">▦</span><h2>{{ d.name }}</h2><span class="tag">{{ d.code }}</span></article> } @empty { @if (!loading()) { <p class="empty">ยังไม่มีแผนก</p> } }</div>`
})
export class DepartmentsComponent {
  private readonly api = inject(ErpApiService); readonly auth = inject(AuthService);
  readonly departments = signal<Department[]>([]); readonly error = signal(''); readonly busy = signal(false); readonly loading = signal(false);
  code = ''; name = '';
  constructor() { this.load(); }
  load(): void { this.loading.set(true); this.error.set(''); this.api.departments().pipe(finalize(() => this.loading.set(false))).subscribe({ next: d => this.departments.set(d), error: e => this.error.set(errorMessage(e)) }); }
  create(): void {
    if (this.busy()) return;
    this.busy.set(true); this.error.set('');
    this.api.createDepartment({ code: this.code, name: this.name }).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => { this.code = ''; this.name = ''; this.load(); }, error: e => this.error.set(errorMessage(e))
    });
  }
}
