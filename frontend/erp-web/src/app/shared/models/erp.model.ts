export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type RequestStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export interface Department { id: number; code: string; name: string; }
export interface User { id: number; username: string; displayName: string; role: Role; departmentId: number; departmentName: string; }
export interface Product { id: number; sku: string; name: string; unit: string; price: number; active: boolean; }
export interface ProductInput { sku: string; name: string; unit: string; price: number; }
export interface PurchaseItem { productId: number; productName: string; unit: string; quantity: number; unitPrice: number; lineTotal: number; }
export interface ApprovalEvent { id: number; action: string; actorName: string; comment: string; createdAt: string; }
export interface PurchaseRequest {
  id: number; number: string; requesterId: number; requesterName: string; departmentId: number; departmentName: string;
  reason: string; status: RequestStatus; total: number; createdAt: string; items: PurchaseItem[]; history: ApprovalEvent[];
}
export interface Dashboard { departments: number; activeProducts: number; visibleRequests: number; pendingApproval: number; approvedTotal: number; }
export interface Session { accessToken: string; expiresAt: string; user: User; }
