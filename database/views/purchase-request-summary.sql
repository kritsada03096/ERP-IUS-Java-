-- Read-only administrative query for DBeaver; displays every department.
-- Application authorization is enforced by the API.
SELECT pr.number, d.code AS department, u.display_name AS requester,
       pr.status, pr.total, pr.created_at
FROM purchase_requests pr
JOIN departments d ON d.id = pr.department_id
JOIN users u ON u.id = pr.requester_id
ORDER BY pr.created_at DESC;
