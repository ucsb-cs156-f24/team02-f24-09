package edu.ucsb.cs156.example.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.testconfig.TestConfig;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

@SpringBootTest
@ActiveProfiles("test")
@WebAppConfiguration
@AutoConfigureMockMvc
@Import(TestConfig.class)
public class UCSBOrganizationIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UCSBOrganizationRepository organizationRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private CurrentUserService currentUserService;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        
        organizationRepository.deleteAll();
    }

    private UCSBOrganization createTestOrganization(String orgCode) {
        return UCSBOrganization.builder()
                .orgCode(orgCode)
                .orgTranslationShort("Test Short")
                .orgTranslation("Test Organization")
                .inactive(false)
                .build();
    }

    @Test
    @WithMockUser(roles = { "USER" })
    public void getOrganization_whenExists_returnsOrganization() throws Exception {
        // Arrange
        UCSBOrganization org = createTestOrganization("TEST123");
        organizationRepository.save(org);

        // Act & Assert
        MvcResult response = mockMvc.perform(get("/api/ucsborganization?id=TEST123"))
                .andExpect(status().isOk())
                .andReturn();

        String expectedJson = objectMapper.writeValueAsString(org);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @Test
    @WithMockUser(roles = { "USER" })
    public void getOrganization_whenNotExists_returns404() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/ucsborganization?id=NOTFOUND"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = { "ADMIN" })
    public void admin_createOrganization_savesOrganization() throws Exception {
        // Arrange
        UCSBOrganization orgToCreate = createTestOrganization("NEW123");
        String jsonString = objectMapper.writeValueAsString(orgToCreate);

        // Act & Assert
        MvcResult response = mockMvc.perform(
                post("/api/ucsborganization/post")
                        .contentType("application/json")
                        .content(jsonString)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String expectedJson = objectMapper.writeValueAsString(orgToCreate);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);

        UCSBOrganization savedOrg = organizationRepository.findById("NEW123").orElseThrow();
        assertEquals(orgToCreate.getOrgTranslation(), savedOrg.getOrgTranslation());
    }

    @Test
    @WithMockUser(roles = { "ADMIN" })
    public void admin_updateOrganization_updatesOrganization() throws Exception {
        // Arrange
        UCSBOrganization originalOrg = createTestOrganization("UPDATE123");
        organizationRepository.save(originalOrg);

        UCSBOrganization updatedOrg = createTestOrganization("UPDATE123");
        updatedOrg.setOrgTranslation("Updated Organization");
        String jsonString = objectMapper.writeValueAsString(updatedOrg);

        // Act & Assert
        MvcResult response = mockMvc.perform(
                put("/api/ucsborganization")
                        .contentType("application/json")
                        .content(jsonString)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String expectedJson = objectMapper.writeValueAsString(updatedOrg);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);

        UCSBOrganization savedOrg = organizationRepository.findById("UPDATE123").orElseThrow();
        assertEquals(updatedOrg.getOrgTranslation(), savedOrg.getOrgTranslation());
    }

    @Test
    @WithMockUser(roles = { "ADMIN" })
    public void admin_deleteOrganization_deletesOrganization() throws Exception {
        // Arrange
        UCSBOrganization orgToDelete = createTestOrganization("DELETE123");
        organizationRepository.save(orgToDelete);

        // Act & Assert
        MvcResult response = mockMvc.perform(
                delete("/api/ucsborganization")
                        .param("id", "DELETE123")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String expectedMessage = String.format("{\"message\":\"UCSBOrganization with id %s deleted\"}", "DELETE123");
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedMessage, responseString);

        assertEquals(false, organizationRepository.findById("DELETE123").isPresent());
    }

    @Test
    @WithMockUser(roles = { "USER" })
    public void user_deleteOrganization_forbidden() throws Exception {
        // Arrange
        UCSBOrganization org = createTestOrganization("DELETE123");
        organizationRepository.save(org);

        // Act & Assert
        mockMvc.perform(
                delete("/api/ucsborganization")
                        .param("id", "DELETE123")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}