import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Department, Dashboard, Product, ProductInput, PurchaseRequest } from '../../shared/models/erp.model';
@Injectable({ providedIn: 'root' })
export class ErpApiService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  departments() { return this.http.get<Department[]>(this.url + '/departments'); }
  createDepartment(body: { code: string; name: string }) { return this.http.post<Department>(this.url + '/departments', body); }
  products() { return this.http.get<Product[]>(this.url + '/products'); }
  createProduct(body: ProductInput) { return this.http.post<Product>(this.url + '/products', body); }
  updateProduct(id: number, body: ProductInput) { return this.http.put<Product>(this.url + '/products/' + id, body); }
  deactivateProduct(id: number) { return this.http.delete<void>(this.url + '/products/' + id); }
  purchases() { return this.http.get<PurchaseRequest[]>(this.url + '/purchase-requests'); }
  createPurchase(body: { reason: string; items: { productId: number; quantity: number }[] }) {
    return this.http.post<PurchaseRequest>(this.url + '/purchase-requests', body);
  }
  submitPurchase(id: number) { return this.http.post<PurchaseRequest>(this.url + '/purchase-requests/' + id + '/submit', {}); }
  approvals() { return this.http.get<PurchaseRequest[]>(this.url + '/approvals'); }
  decide(id: number, approved: boolean, comment: string) { return this.http.post<PurchaseRequest>(this.url + '/approvals/' + id + '/decision', { approved, comment }); }
  dashboard() { return this.http.get<Dashboard>(this.url + '/reports/dashboard'); }
}
