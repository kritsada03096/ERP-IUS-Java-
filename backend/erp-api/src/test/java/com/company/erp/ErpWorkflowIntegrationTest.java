package com.company.erp;

import com.company.erp.enums.Role;
import com.company.erp.model.entity.*;
import com.company.erp.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import java.math.BigDecimal;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ErpWorkflowIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired DepartmentRepository departments;
    @Autowired UserRepository users;
    @Autowired ProductRepository products;
    @Autowired PurchaseRequestRepository requests;
    @Autowired ApprovalEventRepository events;
    @Autowired PasswordEncoder encoder;
    @Autowired javax.sql.DataSource dataSource;
    Long productId;
    String employeeToken, managerToken, hrToken, adminToken, colleagueToken;

    @BeforeEach
    void setup() throws Exception {
        try (var connection = dataSource.getConnection()) {
            String url = connection.getMetaData().getURL();
            if (!url.startsWith("jdbc:h2:mem:") && !url.matches("jdbc:postgresql://[^/]+/company_erp_test")) {
                throw new IllegalStateException("Tests may only reset an in-memory DB or company_erp_test");
            }
        }
        events.deleteAll(); requests.deleteAll(); products.deleteAll(); users.deleteAll(); departments.deleteAll();
        Department it = department("IT"), hr = department("HR");
        user("employee", Role.EMPLOYEE, it); user("manager", Role.MANAGER, it);
        user("hr", Role.MANAGER, hr); user("admin", Role.ADMIN, it); user("colleague", Role.EMPLOYEE, it);
        Product p = new Product(); p.setSku("NB-001"); p.setName("Notebook"); p.setUnit("unit"); p.setPrice(new BigDecimal("25000.25"));
        productId = products.save(p).getId();
        employeeToken = login("employee"); managerToken = login("manager"); hrToken = login("hr"); adminToken = login("admin"); colleagueToken = login("colleague");
    }
    private Department department(String code) {
        Department d = new Department(); d.setCode(code); d.setName(code); return departments.save(d);
    }
    private void user(String name, Role role, Department d) {
        User u = new User(); u.setUsername(name); u.setDisplayName(name); u.setDepartment(d); u.setRole(role); u.setPasswordHash(encoder.encode("Test123!")); users.save(u);
    }
    private String login(String username) throws Exception {
        String response = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(Map.of("username", username, "password", "Test123!")))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("accessToken").asText();
    }
    private ResultActions postJson(String path, String token, String body) throws Exception {
        return mvc.perform(post(path).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content(body));
    }
    private JsonNode create(String token) throws Exception {
        return json.readTree(postJson("/api/v1/purchase-requests", token,
            "{\"reason\":\"Office equipment\",\"items\":[{\"productId\":" + productId + ",\"quantity\":2}]}")
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }
    private void submit(long id, String token) throws Exception {
        postJson("/api/v1/purchase-requests/" + id + "/submit", token, "{}").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));
    }
    @Test
    void completeWorkflowUsesServerPricesAndRecordsHistory() throws Exception {
        JsonNode draft = create(employeeToken); long id = draft.get("id").asLong();
        assertThat(draft.get("total").decimalValue()).isEqualByComparingTo("50000.50");
        assertThat(draft.get("status").asText()).isEqualTo("DRAFT");
        assertThat(draft.has("passwordHash")).isFalse();
        submit(id, employeeToken);
        mvc.perform(get("/api/v1/approvals").header("Authorization", "Bearer " + managerToken)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        postJson("/api/v1/approvals/" + id + "/decision", managerToken, "{\"approved\":true,\"comment\":\"Within budget\"}")
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("APPROVED")).andExpect(jsonPath("$.history.length()").value(3))
            .andExpect(jsonPath("$.history[2].actorName").value("manager"));
        mvc.perform(get("/api/v1/reports/dashboard").header("Authorization", "Bearer " + employeeToken))
            .andExpect(status().isOk()).andExpect(jsonPath("$.approvedTotal").value(50000.50));
    }
    @Test
    void protectsAnonymousAndInvalidCredentials() throws Exception {
        mvc.perform(get("/api/v1/products")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/products").header("Authorization", "Bearer invalid")).andExpect(status().isUnauthorized());
        postJson("/api/v1/auth/login", "", "{\"username\":\"employee\",\"password\":\"wrong\"}").andExpect(status().isUnauthorized());
    }
    @Test
    void isolatesDocumentsAcrossDepartmentsAndEmployees() throws Exception {
        long id = create(employeeToken).get("id").asLong(); submit(id, employeeToken);
        for (String token : new String[] { hrToken, colleagueToken }) {
            mvc.perform(get("/api/v1/purchase-requests/" + id).header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
            mvc.perform(get("/api/v1/purchase-requests").header("Authorization", "Bearer " + token)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
            mvc.perform(get("/api/v1/reports/dashboard").header("Authorization", "Bearer " + token)).andExpect(status().isOk()).andExpect(jsonPath("$.visibleRequests").value(0));
        }
        postJson("/api/v1/approvals/" + id + "/decision", hrToken, "{\"approved\":true,\"comment\":\"Wrong department\"}").andExpect(status().isForbidden());
    }
    @Test
    void employeesCannotApproveAndManagersCannotSelfApprove() throws Exception {
        long id = create(employeeToken).get("id").asLong(); submit(id, employeeToken);
        postJson("/api/v1/approvals/" + id + "/decision", employeeToken, "{\"approved\":true,\"comment\":\"Self\"}").andExpect(status().isForbidden());
        long own = create(managerToken).get("id").asLong(); submit(own, managerToken);
        postJson("/api/v1/approvals/" + own + "/decision", managerToken, "{\"approved\":true,\"comment\":\"Self\"}").andExpect(status().isConflict());
        long adminOwn = create(adminToken).get("id").asLong(); submit(adminOwn, adminToken);
        postJson("/api/v1/approvals/" + adminOwn + "/decision", adminToken, "{\"approved\":true,\"comment\":\"Self\"}").andExpect(status().isConflict());
    }
    @Test
    void blocksInvalidTransitionsAndDuplicateDecisions() throws Exception {
        long id = create(employeeToken).get("id").asLong();
        postJson("/api/v1/approvals/" + id + "/decision", managerToken, "{\"approved\":true,\"comment\":\"Too soon\"}").andExpect(status().isConflict());
        postJson("/api/v1/purchase-requests/" + id + "/submit", managerToken, "{}").andExpect(status().isForbidden());
        submit(id, employeeToken);
        postJson("/api/v1/purchase-requests/" + id + "/submit", employeeToken, "{}").andExpect(status().isConflict());
        postJson("/api/v1/approvals/" + id + "/decision", managerToken, "{\"approved\":false,\"comment\":\"Not necessary\"}").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("REJECTED"));
        postJson("/api/v1/approvals/" + id + "/decision", managerToken, "{\"approved\":true,\"comment\":\"Retry\"}").andExpect(status().isConflict());
    }
    @Test
    void snapshotsProductPriceAndName() throws Exception {
        long id = create(employeeToken).get("id").asLong();
        Product p = products.findById(productId).orElseThrow(); p.setName("New name"); p.setPrice(new BigDecimal("1.00")); products.save(p);
        mvc.perform(get("/api/v1/purchase-requests/" + id).header("Authorization", "Bearer " + employeeToken))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(50000.50)).andExpect(jsonPath("$.items[0].productName").value("Notebook"));
    }
    @Test
    void validatesLinesAndRejectsClientControlledTotals() throws Exception {
        for (String items : new String[] { "[]", "[null]", "[{\"productId\":" + productId + ",\"quantity\":0}]", "[{\"productId\":" + productId + ",\"quantity\":100001}]" }) {
            postJson("/api/v1/purchase-requests", employeeToken, "{\"reason\":\"Test\",\"items\":" + items + "}").andExpect(status().isBadRequest());
        }
        String line = "{\"productId\":" + productId + ",\"quantity\":1}";
        postJson("/api/v1/purchase-requests", employeeToken, "{\"reason\":\"Test\",\"items\":[" + line + "," + line + "]}").andExpect(status().isConflict());
        postJson("/api/v1/purchase-requests", employeeToken, "{\"reason\":\"Test\",\"total\":1,\"items\":[" + line + "]}").andExpect(status().isBadRequest());
        postJson("/api/v1/purchase-requests", employeeToken, "{\"reason\":\"Test\",\"items\":[{\"productId\":999999,\"quantity\":1}]}").andExpect(status().isNotFound());
    }
    @Test
    void onlyAdminCanMaintainMasterDataAndDuplicateSkuConflicts() throws Exception {
        String product = "{\"sku\":\"NEW-01\",\"name\":\"Mouse\",\"unit\":\"unit\",\"price\":100.25}";
        postJson("/api/v1/products", employeeToken, product).andExpect(status().isForbidden());
        postJson("/api/v1/products", managerToken, product).andExpect(status().isForbidden());
        postJson("/api/v1/products", adminToken, product).andExpect(status().isCreated());
        postJson("/api/v1/products", adminToken, product).andExpect(status().isConflict());
        postJson("/api/v1/departments", employeeToken, "{\"code\":\"NEW\",\"name\":\"New department\"}").andExpect(status().isForbidden());
        postJson("/api/v1/departments", adminToken, "{\"code\":\"NEW\",\"name\":\"New department\"}").andExpect(status().isCreated());
    }
    @Test
    void inactiveProductsCannotBeRequestedOrSubmitted() throws Exception {
        long id = create(employeeToken).get("id").asLong();
        mvc.perform(delete("/api/v1/products/" + productId).header("Authorization", "Bearer " + adminToken)).andExpect(status().isNoContent());
        postJson("/api/v1/purchase-requests/" + id + "/submit", employeeToken, "{}").andExpect(status().isConflict());
        postJson("/api/v1/purchase-requests", employeeToken, "{\"reason\":\"Test\",\"items\":[{\"productId\":" + productId + ",\"quantity\":1}]}").andExpect(status().isConflict());
    }
    @Test
    void approvalRequiresDecisionAndNonblankReason() throws Exception {
        long id = create(employeeToken).get("id").asLong(); submit(id, employeeToken);
        postJson("/api/v1/approvals/" + id + "/decision", managerToken, "{\"approved\":true,\"comment\":\" \"}").andExpect(status().isBadRequest());
        postJson("/api/v1/approvals/" + id + "/decision", managerToken, "{\"comment\":\"Missing decision\"}").andExpect(status().isBadRequest());
    }
    @Test
    void concurrentDecisionsOnlyCommitOnce() throws Exception {
        long id = create(employeeToken).get("id").asLong(); submit(id, employeeToken);
        var executor = java.util.concurrent.Executors.newFixedThreadPool(2);
        var start = new java.util.concurrent.CountDownLatch(1);
        try {
            java.util.concurrent.Callable<Integer> task = () -> {
                start.await();
                return postJson("/api/v1/approvals/" + id + "/decision", managerToken, "{\"approved\":true,\"comment\":\"Concurrent approval\"}").andReturn().getResponse().getStatus();
            };
            var first = executor.submit(task); var second = executor.submit(task); start.countDown();
            assertThat(java.util.List.of(first.get(15, java.util.concurrent.TimeUnit.SECONDS), second.get(15, java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(200, 409);
            assertThat(events.findByPurchaseRequestIdOrderByCreatedAtAscIdAsc(id)).hasSize(3);
        } finally { executor.shutdownNow(); }
    }
}
