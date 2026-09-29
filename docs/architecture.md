# สถาปัตยกรรม

Backend เป็น modular monolith แบ่งตามชั้นและ module ส่วน Angular แบ่ง feature
ระบบผูก localhost เท่านั้น

| ชั้น | หน้าที่ | ตัวอย่าง |
|---|---|---|
| Controller | HTTP, validate, role, เรียก service | PurchaseRequestController |
| Service | business logic, transaction, สิทธิ์รายเอกสาร | PurchaseRequestService, ApprovalService |
| Repository | อ่าน/เขียนผ่าน JPA | PurchaseRequestRepository |
| Entity | map ตาราง | PurchaseRequest, PurchaseRequestItem |
| Request/Response | input/output JSON ไม่ส่ง Entity ตรง | CreatePurchaseRequest, PurchaseRequestResponse |
| DTO/Mapper | ข้อมูลย่อยและแปลงผลลัพธ์ | PurchaseItemDto, ErpMapper |
| Security | BCrypt, JWT, authentication | JwtService, SecurityConfig |
| Exception | แปลงข้อผิดพลาดเป็น HTTP | GlobalExceptionHandler |

Service ใช้ concrete class ก่อน เมื่อมีหลาย implementation จึงแยก interface/Impl
ใช้ BearerTokenAuthenticationFilter ของ Spring Security Resource Server แทน JwtFilter ที่เขียนเอง
โหลด role จากฐานทุก request ไม่รับ role ที่ client ส่งมา

## เอกสารและ transaction

- สร้าง header, lines, CREATED event ใน transaction เดียว
- PR number ใช้ UUID + unique constraint ป้องกันเลขซ้ำ
- เก็บชื่อสินค้า หน่วย ราคาเป็น snapshot; เงินใช้ BigDecimal และ NUMERIC
- submit/decision lock แถวและตรวจสถานะภายใน transaction ป้องกันอนุมัติซ้ำ
- ไม่รับ requesterId, departmentId, total, unitPrice, status จาก client; reject unknown fields
- Audit ครอบคลุม create/submit/decision ของ PR ยังไม่รวม master data
- ADMIN ข้ามแผนกได้ แต่ยังห้ามอนุมัติเอกสารตัวเอง
- backend บังคับสิทธิ์จริง ส่วนซ่อนปุ่มบนเว็บมีไว้เพื่อความสะดวก

## Angular

core เก็บ auth, guard, interceptor, typed API client
shared เก็บ models และ component ที่ใช้ร่วมกัน
layouts เก็บ sidebar/header; features เป็น lazy-loaded standalone components
ใช้ signals + zoneless change detection มี loading/empty/error states
Token เก็บใน sessionStorage และล้างเมื่อ 401; local API ใช้ proxy

## ต่อเติม

เพิ่ม Entity/Request/Response/Repository → Service/transaction → Controller → Angular feature
schema เปลี่ยนด้วย migration ใหม่ ไม่สร้าง DDL ซ้ำสองชุด
ระยะถัดไป: Users/Supplier → PO → Stock ledger → Payment → Sales/Report
เมื่อข้อมูลมากขึ้นเพิ่ม pagination, projections, aggregate queries และ index
