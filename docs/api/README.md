# REST API v1

Base: http://localhost:8081/api/v1
ส่ง Authorization: Bearer <accessToken> ยกเว้น Login; Content-Type: application/json

| Method | Path | สิทธิ์ / ผลลัพธ์ |
|---|---|---|
| POST | /auth/login | username/password → accessToken, expiresAt, user |
| GET | /auth/me | ผู้ใช้ปัจจุบัน |
| GET / POST | /departments | อ่านทุกบัญชี; สร้าง ADMIN (code, name), 201 |
| GET | /products และ /products/{id} | ทุกบัญชี รวมสินค้าปิดใช้งาน |
| POST / PUT | /products และ /products/{id} | ADMIN (sku, name, unit, price) |
| DELETE | /products/{id} | ADMIN; ปิดใช้งาน; 204 |
| GET | /purchase-requests และ /purchase-requests/{id} | เฉพาะเอกสารที่มีสิทธิ์ พร้อม items/history |
| POST | /purchase-requests | สร้าง DRAFT; 201 |
| POST | /purchase-requests/{id}/submit | เจ้าของ DRAFT เท่านั้น |
| GET | /approvals | ADMIN/MANAGER; pending ยกเว้นของตนเอง |
| POST | /approvals/{id}/decision | ADMIN/MANAGER ตามแผนก; id คือ PR id |
| GET | /reports/dashboard | สรุปเฉพาะเอกสารตามสิทธิ์ |

## สร้างใบขอซื้อ

```json
{
  "reason": "ซื้ออุปกรณ์สำหรับพนักงานใหม่",
  "items": [{"productId": 1, "quantity": 2}, {"productId": 2, "quantity": 1}]
}
```

สินค้าไม่ซ้ำ จำนวนเต็ม 1–100000 สูงสุด 100 lines เหตุผลไม่ว่างและไม่เกิน 1000 ตัวอักษร
ยอดและราคาใช้ข้อมูลจากฐาน ไม่รับ total หรือ unitPrice จากเว็บ

## ตัดสินเอกสาร

```json
{"approved": true, "comment": "อนุมัติตามงบประมาณแผนก"}
```

false = ปฏิเสธ; ต้องมี comment ทั้งสองกรณี การตัดสินซ้ำตอบ 409

## ข้อผิดพลาด

```json
{"status":409,"message":"รายการนี้ไม่ได้อยู่ระหว่างรออนุมัติ","path":"/api/v1/approvals/1/decision","timestamp":"2026-09-29T10:00:00Z"}
```

400 input, 401 login/token, 403 ไม่มีสิทธิ์, 404 ไม่พบ, 409 business rule/ข้อมูลซ้ำ/concurrent update
Security filter errors อาจมีเพียง status/message
ยังไม่มี API ของ PO, Stock, Sales และ Payments
