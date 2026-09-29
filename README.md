# Company ERP

ระบบ ERP สำหรับหลายแผนก รันบนเครื่อง local แยก Java Spring Boot API และ Angular Web

**ใช้งานได้แล้ว:** Login/JWT, แผนก, สินค้า, ใบขอซื้อหลายรายการ, ส่งอนุมัติ, อนุมัติ/ปฏิเสธ, ประวัติเอกสาร, Dashboard และรายงานใบขอซื้อ

## โครงสร้าง

```text
backend/erp-api/       Java 21 + Spring Boot 3.5.16
frontend/erp-web/      Angular 22.2 + TypeScript 6
database/             PostgreSQL local และ SQL สำหรับ DBeaver
docs/                 สถาปัตยกรรม, ER diagram, API, workflow
scripts/              คำสั่งเริ่มต้นสำหรับ Windows
```

```text
Angular → REST/JSON → Controller → Service → Repository → PostgreSQL
                                       ↕          ↕
                                 Request/Response Entity (JPA)
DBeaver ─────────────────────────────────────────────────→ PostgreSQL
```

**DBeaver เป็นโปรแกรมจัดการฐานข้อมูล** ทั้ง DBeaver และ Spring Boot เชื่อม PostgreSQL โดยตรง

## เริ่มต้นบน Windows

ต้องมี JDK 21, Node.js 24.15 ขึ้นไปในสาย 24 และ PostgreSQL 17 หรือ Docker Desktop
สคริปต์ backend ใช้ JDK ใน `.tools/jdk21/` ก่อน ถ้าไม่มีจึงใช้ JAVA_HOME หรือ PATH
มี Maven wrapper จึงไม่ต้องติดตั้ง Maven แยก

### 1. เปิด PostgreSQL

เปิด Docker Desktop แล้วรันจาก root:

```powershell
docker compose -f database/compose.yml up -d
```

ถ้าติดตั้ง PostgreSQL ไว้แล้ว ใช้ [create-database.sql](database/scripts/create-database.sql) ด้วยสิทธิ์ผู้ดูแลเพียงครั้งเดียว

ถ้ามี PostgreSQL portable ใน `.tools/pgsql/` จากการเตรียมเครื่องนี้ ใช้:

```powershell
.\scripts\start-database.cmd
```

Docker/ฐาน native ใช้ 5432 ส่วน portable ของโปรเจกต์ใช้ 5433 เพื่อแยกจากฐานเดิม

### 2. เปิด Backend — terminal แรก

```powershell
.\scripts\start-backend.cmd
```

API: http://localhost:8081/api/v1

เมื่อพบฐาน portable สคริปต์ backend เลือกพอร์ต 5433 อัตโนมัติ ถ้าตั้ง DB_URL เองจะใช้ค่าที่ตั้งไว้

| ค่า | ค่าเริ่มต้น |
|---|---|
| Database | company_erp |
| Host / Port | localhost / 5432 |
| Username | erp |
| Password | erp_local |
| Frontend | http://localhost:4200 |

ใช้ฐานข้อมูลของคุณเองได้โดยกำหนดใน terminal ก่อนเปิด backend:

```powershell
$env:DB_URL = 'jdbc:postgresql://localhost:5432/company_erp'
$env:DB_USERNAME = 'postgres'
$env:DB_PASSWORD = 'your_password'
.\scripts\start-backend.cmd
```

Flyway สร้างตารางจาก `backend/erp-api/src/main/resources/db/migration/` อัตโนมัติ
JPA ใช้ `ddl-auto: validate` ไม่แก้ schema เอง

### 3. เปิด Frontend — terminal ที่สอง

```powershell
cd frontend/erp-web
npm.cmd ci
npm.cmd start
```

เปิด **http://localhost:4200** — Angular proxy ส่ง /api ไป backend พอร์ต 8081

### 4. เชื่อม DBeaver

New Database Connection → PostgreSQL → Host localhost → Port 5432 → Database company_erp
→ Username erp → Password erp_local → Test Connection

สำหรับ portable บนเครื่องนี้ให้ใช้ Port 5433 (ค่าอื่นเหมือนเดิม)
หากเปลี่ยนค่า DB ให้ใช้ค่าชุดเดียวกับ backend แล้ว refresh schema public หลังเปิด backend

## บัญชีทดลอง

สร้างเฉพาะ profile local เมื่อตาราง users ยังว่าง รหัสผ่านทุกบัญชี: **LocalDemo123!**

| Username | Role | แผนก |
|---|---|---|
| admin | ADMIN | IT |
| employee.it | EMPLOYEE | IT |
| manager.it | MANAGER | IT |
| employee.hr | EMPLOYEE | HR |
| manager.hr | MANAGER | HR |

ตั้ง DEMO_PASSWORD ก่อนเปิดครั้งแรกเพื่อเปลี่ยนรหัสผ่าน seed; ไม่รีเซ็ตผู้ใช้เดิม
ตั้ง JWT_SECRET เพื่อทับ local secret ได้ Token อายุ 60 นาที เก็บใน sessionStorage ต่อแท็บ
Logout ล้าง token ฝั่งเว็บ ยังไม่มี server-side token revocation

## ทดลองใช้งาน

1. Login employee.it → ใบขอซื้อ → สร้างใบขอซื้อ → เลือกสินค้า/จำนวน → บันทึกฉบับร่าง
2. ตรวจรายละเอียด → ส่งอนุมัติ
3. Logout → Login manager.it → อนุมัติเอกสาร → ใส่ความเห็น → อนุมัติหรือปฏิเสธ
4. Login พนักงานอีกครั้ง → ตรวจสถานะ/ประวัติ หรือเปิดรายงานและพิมพ์/PDF
5. Login manager.hr เพื่อตรวจว่าไม่เห็นเอกสาร IT

พนักงานเห็นเฉพาะเอกสารตัวเอง หัวหน้าเห็นแผนกตัวเอง ADMIN เห็นทุกแผนก
ทุกบทบาทห้ามอนุมัติของตัวเอง เฉพาะผู้สร้างส่งฉบับร่างได้
ยอดเงิน/ราคา/ผู้ขอ/แผนกกำหนดที่ backend การลบสินค้าเป็นการปิดใช้งานเพื่อรักษาประวัติ

## ทดสอบ

```powershell
.\scripts\test-backend.cmd
cd frontend/erp-web
npm.cmd test
npm.cmd run build
```

Backend ใช้ H2 PostgreSQL compatibility โดย default รัน migration จริง และทดสอบ authentication,
validation, สิทธิ์ข้ามแผนก, price snapshot, status transitions, concurrent approval

รันกับ PostgreSQL จริงโดยสร้างฐานแยกชื่อ **company_erp_test** ก่อน:

```powershell
$env:TEST_DB_URL = 'jdbc:postgresql://localhost:5432/company_erp_test'
$env:TEST_DB_USERNAME = 'erp'
$env:TEST_DB_PASSWORD = 'erp_local'
.\scripts\test-backend.cmd
```

ชุดทดสอบล้างตารางในฐานทดสอบ และตรวจชื่อ company_erp_test ก่อนล้าง ห้ามใช้ฐานข้อมูลใช้งานจริง

## ขอบเขต

สถานะ PR: DRAFT → PENDING_APPROVAL → APPROVED / REJECTED
SUBMITTED เป็นชื่อ audit event ไม่ใช่สถานะค้าง เอกสารปฏิเสธให้สร้างใหม่
ยังไม่มีแก้ไขฉบับร่าง, ส่งซ้ำ, PO, Supplier, รับ/เบิกสินค้า, Stock, Sales Order, Payment,
บัญชีแยกประเภท, CRUD ผู้ใช้/พนักงาน, permission แบบปรับได้, approval หลายระดับ หรือหลายบริษัท
เตรียมแพ็กเกจและ feature ไว้ต่อยอดแล้ว รายการยังไม่มี pagination เหมาะกับข้อมูล local ชุดเล็ก
รายงานเป็นยอดใบขอซื้อ ไม่ใช่ยอดจ่ายเงินจริง

[Architecture](docs/architecture.md) · [API](docs/api/README.md) · [ER diagram](docs/er-diagram/README.md) · [Workflow](docs/flow/README.md)

[ผลทดสอบและค่าพอร์ตที่เตรียมบนเครื่องนี้](docs/verification.md)

อ้างอิงเวอร์ชัน: [Angular](https://angular.dev/reference/versions), [Spring Boot](https://docs.spring.io/spring-boot/3.5/system-requirements.html)

## แก้ปัญหา

- release version 21 not supported: Java ใน PATH ยังเป็น 11 ให้ใช้สคริปต์ หรือแก้ JAVA_HOME ไป JDK 21
- Connection refused/password authentication failed: เปิด PostgreSQL และตรวจ DB_URL/DB_USERNAME/DB_PASSWORD
- Docker ตอบ 500: แก้ Docker Desktop หรือใช้ PostgreSQL native/portable
- พอร์ต 5432 ถูกใช้: ใช้ PostgreSQL ตัวเดิมพร้อมฐานใหม่ หรือเปลี่ยนพอร์ตและ DB_URL
- Frontend เชื่อมต่อไม่ได้: ตรวจ backend 8081 และใช้ npm.cmd start เพื่อเปิด proxy
- schema เปลี่ยน: เพิ่ม migration V2, V3; ไม่แก้ V1 หลังใช้งานแล้ว

หยุด backend/frontend ด้วย Ctrl+C; Docker ด้วย docker compose -f database/compose.yml stop
หรือ portable ด้วย .\scripts\stop-database.cmd ข้อมูลยังอยู่บนเครื่อง
