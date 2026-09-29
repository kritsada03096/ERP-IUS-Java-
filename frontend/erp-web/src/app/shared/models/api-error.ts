import { HttpErrorResponse } from '@angular/common/http';
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 || error.status === 504 || error.status === 502) return 'เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบว่า Backend กำลังทำงาน';
    return error.error?.message ?? 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง';
  }
  return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
}
