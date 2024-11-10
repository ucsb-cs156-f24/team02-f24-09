package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(controllers = RecommendationRequestsController.class)
@Import(TestConfig.class)
public class RecommendationRequestsControllerTests extends ControllerTestCase {

    @MockBean
    private RecommendationRequestRepository recRequestRepo;

    @MockBean
    private UserRepository userRepo;

    // Authorization tests for /api/recommendationrequests/admin/all
    @Test
    public void logged_out_users_cannot_access_all_requests() throws Exception {
        mockMvc.perform(get("/api/recommendationrequests/all"))
                .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = "USER")
    @Test
    public void logged_in_users_can_access_all_requests() throws Exception {
        mockMvc.perform(get("/api/recommendationrequests/all"))
                .andExpect(status().isOk());
    }

    @WithMockUser(roles = "USER")
    @Test
    public void logged_in_users_can_get_all_recommendation_requests() throws Exception {
        LocalDateTime date1 = LocalDateTime.parse("2023-02-01T10:00:00");
        LocalDateTime date2 = LocalDateTime.parse("2024-05-15T12:00:00");

        RecommendationRequest req1 = createRequest("prof.smith@university.edu", "student.a@university.edu", 
                "Please provide a recommendation for graduate school.", date1, false);
        RecommendationRequest req2 = createRequest("prof.jones@university.edu", "student.b@university.edu", 
                "Recommendation for internship application.", date2, true);

        List<RecommendationRequest> expectedRequests = Arrays.asList(req1, req2);

        when(recRequestRepo.findAll()).thenReturn(expectedRequests);

        MvcResult response = mockMvc.perform(get("/api/recommendationrequests/all"))
                .andExpect(status().isOk()).andReturn();

        verify(recRequestRepo, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedRequests);
        assertEquals(expectedJson, response.getResponse().getContentAsString());
    }

    @Test
    public void logged_out_users_cannot_submit_request() throws Exception {
        mockMvc.perform(post("/api/recommendationrequests/post"))
                .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = "USER")
    @Test
    public void non_admin_users_cannot_submit_request() throws Exception {
        mockMvc.perform(post("/api/recommendationrequests/post"))
                .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = {"ADMIN", "USER"})
    @Test
    public void admin_user_can_submit_new_request() throws Exception {
        LocalDateTime requestDate = LocalDateTime.parse("2023-02-01T10:00:00");

        RecommendationRequest newRequest = createRequest("prof.brown@university.edu", "student.c@university.edu", 
                "Please provide a recommendation for job application.", requestDate, true);

        when(recRequestRepo.save(eq(newRequest))).thenReturn(newRequest);

        MvcResult response = mockMvc.perform(
                        post("/api/recommendationrequests/post")
                                .param("professorEmail", "prof.brown@university.edu")
                                .param("requesterEmail", "student.c@university.edu")
                                .param("explanation", "Please provide a recommendation for job application.")
                                .param("dateNeeded", "2023-02-01T10:00:00")
                                .param("dateRequested", "2023-02-01T10:00:00")
                                .param("doneBool", "true")
                                .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(recRequestRepo, times(1)).save(newRequest);
        String expectedJson = mapper.writeValueAsString(newRequest);
        assertEquals(expectedJson, response.getResponse().getContentAsString());
    }

    // Tests for GET by ID
    @Test
    public void logged_out_users_cannot_get_request_by_id() throws Exception {
        mockMvc.perform(get("/api/recommendationrequests?id=10"))
                .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = "USER")
    @Test
    public void logged_in_users_can_get_request_by_id_if_exists() throws Exception {
        LocalDateTime requestDate = LocalDateTime.parse("2023-02-01T10:00:00");
        RecommendationRequest req = createRequest("prof.white@university.edu", "student.d@university.edu", 
                "Recommendation for scholarship.", requestDate, true);

        when(recRequestRepo.findById(eq(10L))).thenReturn(Optional.of(req));

        MvcResult response = mockMvc.perform(get("/api/recommendationrequests?id=10"))
                .andExpect(status().isOk()).andReturn();

        verify(recRequestRepo, times(1)).findById(10L);
        String expectedJson = mapper.writeValueAsString(req);
        assertEquals(expectedJson, response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = "USER")
    @Test
    public void logged_in_users_cannot_get_request_by_id_if_not_exists() throws Exception {
        when(recRequestRepo.findById(eq(10L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/recommendationrequests?id=10"))
                .andExpect(status().isNotFound()).andReturn();

        verify(recRequestRepo, times(1)).findById(10L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("RecommendationRequest with id 10 not found", json.get("message"));
    }

    @WithMockUser(roles = {"ADMIN", "USER"})
    @Test
    public void admin_can_delete_existing_request() throws Exception {
        LocalDateTime requestDate = LocalDateTime.parse("2023-02-01T10:00:00");
        RecommendationRequest req = createRequest("prof.clark@university.edu", "student.e@university.edu", 
                "Please provide a recommendation for a project.", requestDate, false);

        when(recRequestRepo.findById(eq(20L))).thenReturn(Optional.of(req));

        MvcResult response = mockMvc.perform(delete("/api/recommendationrequests?id=20").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(recRequestRepo, times(1)).findById(20L);
        verify(recRequestRepo, times(1)).delete(any());

        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 20 deleted", json.get("message"));
    }

    @WithMockUser(roles = {"ADMIN", "USER"})
    @Test
    public void admin_cannot_delete_non_existing_request() throws Exception {
        when(recRequestRepo.findById(eq(20L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(delete("/api/recommendationrequests?id=20").with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        verify(recRequestRepo, times(1)).findById(20L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 20 not found", json.get("message"));
    }

    @WithMockUser(roles = {"ADMIN", "USER"})
    @Test
    public void admin_can_edit_existing_request() throws Exception {
        LocalDateTime originalDate = LocalDateTime.parse("2023-02-01T10:00:00");
        LocalDateTime editedDate = LocalDateTime.parse("2024-04-20T15:00:00");

        RecommendationRequest originalReq = createRequest("prof.lewis@university.edu", "student.f@university.edu", 
                "Recommendation for research grant.", originalDate, false);
        RecommendationRequest editedReq = createRequest("prof.thomas@university.edu", "student.g@university.edu", 
                "Please update the recommendation for a new position.", editedDate, true);

        String requestBody = mapper.writeValueAsString(editedReq);

        when(recRequestRepo.findById(eq(30L))).thenReturn(Optional.of(originalReq));

        MvcResult response = mockMvc.perform(
                        put("/api/recommendationrequests?id=30")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(recRequestRepo, times(1)).findById(30L);
        verify(recRequestRepo, times(1)).save(editedReq);
        assertEquals(requestBody, response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = {"ADMIN", "USER"})
    @Test
    public void admin_cannot_edit_non_existing_request() throws Exception {
        LocalDateTime editedDate = LocalDateTime.parse("2024-04-20T15:00:00");

        RecommendationRequest editedReq = createRequest("prof.jackson@university.edu", "student.h@university.edu", 
                "Update the recommendation for fellowship.", editedDate, true);

        String requestBody = mapper.writeValueAsString(editedReq);

        when(recRequestRepo.findById(eq(30L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(
                        put("/api/recommendationrequests?id=30")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        verify(recRequestRepo, times(1)).findById(30L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 30 not found", json.get("message"));
    }

    private RecommendationRequest createRequest(String professorEmail, String requesterEmail, String explanation, LocalDateTime dateNeeded, boolean done) {
        return RecommendationRequest.builder()
                .professorEmail(professorEmail)
                .requesterEmail(requesterEmail)
                .explanation(explanation)
                .dateNeeded(dateNeeded)
                .dateRequested(dateNeeded)
                .done(done)
                .build();
    }
}
