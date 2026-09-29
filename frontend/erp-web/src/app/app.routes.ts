import { Routes } from '@angular/router';
import { authGuard, approvalGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: '', canActivate: [authGuard], loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent), children: [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'organization', loadComponent: () => import('./features/organization/departments.component').then(m => m.DepartmentsComponent) },
    { path: 'products', loadComponent: () => import('./features/master-data/products/products.component').then(m => m.ProductsComponent) },
    { path: 'procurement', loadComponent: () => import('./features/procurement/purchase-request/purchases.component').then(m => m.PurchasesComponent) },
    { path: 'approval', canActivate: [approvalGuard], loadComponent: () => import('./features/approval/approval.component').then(m => m.ApprovalComponent) },
    { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) }
  ] },
  { path: '**', redirectTo: 'dashboard' }
];
