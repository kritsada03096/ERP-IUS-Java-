import { Component, input } from '@angular/core';
import { RequestStatus } from '../models/erp.model';
@Component({ selector: 'app-status-badge', template: '<span class="badge" [attr.data-status]="status()">{{ labels[status()] }}</span>' })
export class StatusBadgeComponent {
  readonly status = input.required<RequestStatus>();
  readonly labels: Record<RequestStatus, string> = { DRAFT: 'ฉบับร่าง', PENDING_APPROVAL: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ' };
}
