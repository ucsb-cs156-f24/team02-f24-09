package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBDiningCommons;
import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = UCSBOrganizationController.class)
@Import(TestConfig.class)
public class UCSBOrganizationControllerTests extends ControllerTestCase {
    @MockBean
    UCSBOrganizationRepository ucsbOrganizationRepository;

    @MockBean
    UserRepository userRepository;

    // Authorization tests for /api/ucsborganization/post
    // (Perhaps should also have these for put and delete)

    @Test
    public void logged_out_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/ucsborganization/post"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/ucsborganization/post"))
                .andExpect(status().is(403)); // only admins can post
    }

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/ucsborganization/all"))
                .andExpect(status().is(403)); // logged out users can't get all
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all() throws Exception {
        mockMvc.perform(get("/api/ucsborganization/all"))
                .andExpect(status().is(200)); // logged
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_user_can_get_all_ucsborganizations() throws Exception {

        // arrange

        UCSBOrganization org1 = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("Organization 1")
                .orgTranslation("Organization 1 Full Name")
                .inactive(false)
                .build();

        UCSBOrganization org2 = UCSBOrganization.builder()
                .orgCode("org2")
                .orgTranslationShort("Organization 2")
                .orgTranslation("Organization 2 Full Name")
                .inactive(false)
                .build();

        ArrayList<UCSBOrganization> expectedOrganizations = new ArrayList<>();
        expectedOrganizations.addAll(Arrays.asList(org1, org2));

        when(ucsbOrganizationRepository.findAll()).thenReturn(expectedOrganizations);

        // act
        MvcResult response = mockMvc.perform(get("/api/ucsborganization/all"))
                .andExpect(status().isOk()).andReturn();

        // assert

        verify(ucsbOrganizationRepository, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedOrganizations);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void an_admin_user_can_post_a_new_organization() throws Exception {
        // arrange

        UCSBOrganization newOrg = UCSBOrganization.builder()
                .orgCode("neworg")
                .orgTranslationShort("NewOrganization")
                .orgTranslation("NewOrganizationFullName")
                .inactive(false)
                .build();

        when(ucsbOrganizationRepository.save(eq(newOrg))).thenReturn(newOrg);

        // act
        MvcResult response = mockMvc.perform(
                post("/api/ucsborganization/post?orgCode=neworg&orgTranslationShort=NewOrganization&orgTranslation=NewOrganizationFullName&inactive=false")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).save(newOrg);
        String expectedJson = mapper.writeValueAsString(newOrg);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void an_admin_user_can_post_a_new_organization_true() throws Exception {
        // arrange

        UCSBOrganization newOrg = UCSBOrganization.builder()
                .orgCode("neworg")
                .orgTranslationShort("NewOrganization")
                .orgTranslation("NewOrganizationFullName")
                .inactive(true)
                .build();

        when(ucsbOrganizationRepository.save(eq(newOrg))).thenReturn(newOrg);

        // act
        MvcResult response = mockMvc.perform(
                post("/api/ucsborganization/post?orgCode=neworg&orgTranslationShort=NewOrganization&orgTranslation=NewOrganizationFullName&inactive=true")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).save(newOrg);
        String expectedJson = mapper.writeValueAsString(newOrg);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
        mockMvc.perform(get("/api/ucsborganization?id=org1"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void test_get_organization_that_exists() throws Exception {
        // arrange
        UCSBOrganization org = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("Organization 1")
                .orgTranslation("Organization 1 Full Name")
                .inactive(false)
                .build();

        when(ucsbOrganizationRepository.findById(eq("org1"))).thenReturn(Optional.of(org));

        // act
        MvcResult response = mockMvc.perform(get("/api/ucsborganization?id=org1"))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).findById("org1");
        String expectedJson = mapper.writeValueAsString(org);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void test_get_organization_that_does_not_exist() throws Exception {
        // arrange
        when(ucsbOrganizationRepository.findById(eq("fake-org"))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(get("/api/ucsborganization?id=fake-org"))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).findById("fake-org");
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("UCSBOrganization with id fake-org not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_edit_an_existing_organization() throws Exception {
        // arrange
        UCSBOrganization origOrganization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("Original ShortName")
                .orgTranslation("Original Full Name")
                .inactive(false)
                .build();

        UCSBOrganization editedOrganization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("New ShortName")
                .orgTranslation("New Full Name")
                .inactive(true)
                .build();

        String requestBody = mapper.writeValueAsString(editedOrganization);

        when(ucsbOrganizationRepository.findById(eq("org1"))).thenReturn(Optional.of(origOrganization));

        // act
        MvcResult response = mockMvc.perform(
                put("/api/ucsborganization?id=org1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).findById("org1");
        verify(ucsbOrganizationRepository, times(1)).save(origOrganization);

        String responseString = response.getResponse().getContentAsString();
        assertEquals(requestBody, responseString);
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_cannot_edit_organization_that_does_not_exist() throws Exception {
        // arrange
        UCSBOrganization editedOrganization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("New ShortName")
                .orgTranslation("New Full Name")
                .inactive(true)
                .build();

        String requestBody = mapper.writeValueAsString(editedOrganization);

        when(ucsbOrganizationRepository.findById(eq("org1"))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(
                put("/api/ucsborganization?id=org1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).findById("org1");
        Map<String, Object> json = responseToJson(response);
        assertEquals("UCSBOrganization with id org1 not found", json.get("message"));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regular_users_cannot_edit() throws Exception {
        // arrange
        UCSBOrganization editedOrganization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("New ShortName")
                .orgTranslation("New Full Name")
                .inactive(true)
                .build();

        String requestBody = mapper.writeValueAsString(editedOrganization);

        // act
        mockMvc.perform(
                put("/api/ucsborganization?id=org1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void logged_out_users_cannot_edit() throws Exception {
        // arrange
        UCSBOrganization editedOrganization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("New ShortName")
                .orgTranslation("New Full Name")
                .inactive(true)
                .build();

        String requestBody = mapper.writeValueAsString(editedOrganization);

        // act
        mockMvc.perform(
                put("/api/ucsborganization?id=org1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody))
                .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_tries_to_edit_organization_with_different_orgCode() throws Exception {
        UCSBOrganization origOrganization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("Original ShortName")
                .orgTranslation("Original Full Name")
                .inactive(false)
                .build();

        UCSBOrganization editedOrganization = UCSBOrganization.builder()
                .orgCode("org2") // different orgCode than the original
                .orgTranslationShort("New ShortName")
                .orgTranslation("New Full Name")
                .inactive(true)
                .build();

        String requestBody = mapper.writeValueAsString(editedOrganization);

        when(ucsbOrganizationRepository.findById(eq("org1"))).thenReturn(Optional.of(origOrganization));

        MvcResult response = mockMvc.perform(
                put("/api/ucsborganization?id=org1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(ucsbOrganizationRepository, times(1)).findById("org1");
        verify(ucsbOrganizationRepository, times(1)).save(origOrganization);

        String responseString = response.getResponse().getContentAsString();
        UCSBOrganization savedOrganization = mapper.readValue(responseString, UCSBOrganization.class);
        assertEquals("org1", savedOrganization.getOrgCode());

        assertEquals("New ShortName", savedOrganization.getOrgTranslationShort());
        assertEquals("New Full Name", savedOrganization.getOrgTranslation());
        assertEquals(true, savedOrganization.getInactive());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_can_delete_an_organization() throws Exception {
        // arrange
        UCSBOrganization organization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("Organization 1")
                .orgTranslation("Organization 1 Full Name")
                .inactive(false)
                .build();

        when(ucsbOrganizationRepository.findById(eq("org1"))).thenReturn(Optional.of(organization));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/ucsborganization?id=org1")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).findById("org1");
        verify(ucsbOrganizationRepository, times(1)).delete(organization);

        Map<String, Object> json = responseToJson(response);
        assertEquals("UCSBOrganization with id org1 deleted", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void admin_tries_to_delete_non_existing_organization_and_gets_right_error_message() throws Exception {
        // arrange
        when(ucsbOrganizationRepository.findById(eq("non-existing-id"))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/ucsborganization?id=non-existing-id")
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(ucsbOrganizationRepository, times(1)).findById("non-existing-id");
        Map<String, Object> json = responseToJson(response);
        assertEquals("UCSBOrganization with id non-existing-id not found", json.get("message"));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regular_users_cannot_delete() throws Exception {
        // arrange
        UCSBOrganization organization = UCSBOrganization.builder()
                .orgCode("org1")
                .orgTranslationShort("Organization 1")
                .orgTranslation("Organization 1 Full Name")
                .inactive(false)
                .build();

        when(ucsbOrganizationRepository.findById(eq("org1"))).thenReturn(Optional.of(organization));

        // act
        mockMvc.perform(
                delete("/api/ucsborganization?id=org1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    public void logged_out_users_cannot_delete() throws Exception {
        // act
        mockMvc.perform(
                delete("/api/ucsborganization?id=org1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
