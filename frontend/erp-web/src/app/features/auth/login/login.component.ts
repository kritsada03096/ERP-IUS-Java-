import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { errorMessage } from '../../../shared/models/api-error';
@Component({
  selector: 'app-login', imports: [FormsModule],
  template: `
    <div class="login-page"><section class="login-story"><div class="brand"><span class="brand-mark">E</span> Company ERP</div><div><span class="eyebrow">ONE CONNECTED WORKSPACE</span><h1>งานของทุกแผนก<br>เชื่อมต่อกันได้<br>ในที่เดียว</h1><p>เริ่มจากข้อมูลที่เป็นระบบ สู่การจัดซื้อ<br>และการอนุมัติที่ตรวจสอบได้</p></div><small>ระบบจัดการองค์กร · Local edition</small></section>
    <section class="login-panel"><form #form="ngForm" (ngSubmit)="login()"><span class="eyebrow">WELCOME BACK</span><h2>เข้าสู่พื้นที่ทำงาน</h2><p class="muted">ใช้บัญชีของคุณเพื่อเข้าสู่ระบบ ERP</p>
      @if (error()) { <div class="error" role="alert">{{ error() }}</div> }
      <label>ชื่อผู้ใช้<input name="username" [(ngModel)]="username" required maxlength="60" autocomplete="username" placeholder="เช่น employee.it"></label>
      <label>รหัสผ่าน<input name="password" [(ngModel)]="password" required maxlength="100" type="password" autocomplete="current-password" placeholder="กรอกรหัสผ่าน"></label>
      <button class="primary full-width" [disabled]="form.invalid || busy()">{{ busy() ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ →' }}</button>
      <p class="hint">บัญชีสำหรับทดลองใช้งานดูได้ใน README ของโปรเจกต์</p>
    </form></section></div>`
})
export class LoginComponent {
  private readonly auth = inject(AuthService); private readonly router = inject(Router);
  username = ''; password = ''; readonly error = signal(''); readonly busy = signal(false);
  login(): void {
    if (this.busy()) return;
    this.busy.set(true); this.error.set('');
    this.auth.login(this.username, this.password).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => { this.password = ''; void this.router.navigateByUrl('/dashboard'); },
      error: e => this.error.set(errorMessage(e))
    });
  }
}
