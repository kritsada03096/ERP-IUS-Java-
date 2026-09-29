import { Component, input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PurchaseRequest } from '../models/erp.model';
import { StatusBadgeComponent } from './status-badge.component';
@Component({
  selector: 'app-purchase-detail', imports: [DecimalPipe, DatePipe, StatusBadgeComponent],
  template: `
    <div class="purchase-detail"><div class="panel-heading"><div><strong class="document-number">{{ purchase().number }}</strong><p class="muted">{{ purchase().requesterName }} · {{ purchase().departmentName }}</p></div><app-status-badge [status]="purchase().status" /></div>
    <p class="reason">{{ purchase().reason }}</p><div class="table-wrap"><table><thead><tr><th>สินค้า</th><th>จำนวน</th><th>ราคาต่อหน่วย</th><th>รวม</th></tr></thead><tbody>@for (i of purchase().items; track i.productId) { <tr><td>{{ i.productName }}</td><td>{{ i.quantity }} {{ i.unit }}</td><td>{{ i.unitPrice | number:'1.2-2' }}</td><td>{{ i.lineTotal | number:'1.2-2' }}</td></tr> }</tbody></table></div>
    <p class="total">ยอดรวม ฿{{ purchase().total | number:'1.2-2' }}</p><h3>ประวัติเอกสาร</h3><ol class="history">@for (event of purchase().history; track event.id) { <li><strong>{{ actionLabel(event.action) }}</strong> · {{ event.actorName }}<small>{{ event.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>@if (event.comment) { <p>{{ event.comment }}</p> }</li> }</ol></div>`
})
export class PurchaseDetailComponent {
  readonly purchase = input.required<PurchaseRequest>();
  actionLabel(action: string): string { return ({ CREATED: 'สร้างเอกสาร', SUBMITTED: 'ส่งอนุมัติ', APPROVED: 'อนุมัติ', REJECTED: 'ปฏิเสธ' } as Record<string, string>)[action] ?? action; }
}
