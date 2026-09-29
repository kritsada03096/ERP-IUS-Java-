# ผลตรวจสอบระบบ local

ตรวจวันที่ 29 กันยายน 2026

| รายการ | ผล |
|---|---|
| Angular production build | ผ่าน |
| Angular authentication tests | 4 ผ่าน |
| Spring Boot integration tests บน H2 | 11 ผ่าน |
| Spring Boot integration tests บน PostgreSQL 17.11 | 11 ผ่าน |
| Chrome end-to-end workflow | ผ่าน |
| หน้าจอ 1440px และมือถือ 390px | ตรวจแล้ว ไม่มี page overflow |

Backend tests ตรวจ login, token ไม่ถูกต้อง, validation, role/department isolation,
ห้ามอนุมัติตนเอง, status transitions, ป้องกันตัดสินซ้ำทั้งเรียงลำดับและพร้อมกัน,
ราคา snapshot, ปิดใช้งานสินค้า และข้อจำกัด master data

Browser smoke ตรวจสร้าง DRAFT → submit → หัวหน้าต่างแผนกไม่เห็น → หัวหน้า IT อนุมัติ
→ พนักงานเห็นสถานะ/ประวัติ → reload รักษา session โดยเชื่อม PostgreSQL จริง
มีใบขอซื้อตัวอย่างที่อนุมัติแล้วจากการทดสอบหนึ่งรายการใน company_erp

## รัน browser smoke ซ้ำ

ต้องเปิด PostgreSQL, backend 8081 และ frontend 4200 และมีบัญชี seed เดิม
สคริปต์นี้เพิ่มเอกสารทดสอบลงฐาน local ทุกครั้ง

```powershell
npm.cmd install --prefix .tools/browser playwright
node scripts/browser-smoke.cjs
```

ใช้ Google Chrome ที่ติดตั้งในเครื่อง ภาพตรวจหน้าจอบันทึกใน .tools/

## ค่าของเครื่องที่เตรียมไว้

- Web: http://localhost:4200
- API: http://localhost:8081/api/v1
- PostgreSQL portable: localhost:5433, database company_erp, user erp, password erp_local
- ฐาน integration test แยก: company_erp_test
- JDK 21 และ PostgreSQL portable อยู่ใต้ .tools/ ซึ่งไม่รวมใน Git
- Docker Desktop ตอบ 500 จึงใช้ PostgreSQL portable; ไม่แก้โปรแกรมเดิมที่พอร์ต 5432/8080

โค้ดฐานข้อมูลและแพ็กเกจทั้งหมดอยู่ใน Git workspace แต่ไม่มีการ commit/push/deploy
