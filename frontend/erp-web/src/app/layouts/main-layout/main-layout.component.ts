import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-main-layout', imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="workspace">
      <aside class="sidebar">
        <a class="brand" routerLink="/dashboard"><span class="brand-mark">E</span><span>Company ERP<small>พื้นที่ทำงานขององค์กร</small></span></a>
        <div class="nav-label">WORKSPACE</div>
        <nav aria-label="เมนูหลัก">
          <a routerLink="/dashboard" routerLinkActive="active"><span>◫</span> ภาพรวม</a>
          <a routerLink="/organization" routerLinkActive="active"><span>▦</span> แผนก</a>
          <a routerLink="/products" routerLinkActive="active"><span>◇</span> ข้อมูลสินค้า</a>
          <a routerLink="/procurement" routerLinkActive="active"><span>▤</span> ใบขอซื้อ</a>
          @if (auth.canApprove()) { <a routerLink="/approval" routerLinkActive="active"><span>✓</span> อนุมัติเอกสาร</a> }
          <a routerLink="/reports" routerLinkActive="active"><span>↗</span> รายงาน</a>
        </nav>
        <div class="sidebar-footer"><span class="status-dot"></span> Local workspace<small>Company ERP · รุ่นเริ่มต้น</small></div>
      </aside>
      <div class="main-area">
        <header class="topbar"><span>{{ auth.user()?.departmentName }}</span><div class="profile"><span class="avatar">{{ auth.user()?.displayName?.slice(0, 1) }}</span><span>{{ auth.user()?.displayName }}<small>{{ auth.user()?.role }}</small></span><button class="text-button" (click)="logout()">ออกจากระบบ</button></div></header>
        <main><router-outlet /></main>
      </div>
    </div>`
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  constructor() { this.auth.refreshUser().subscribe({ error: () => {} }); }
  logout(): void { this.auth.clear(); void this.router.navigateByUrl('/login'); }
}
