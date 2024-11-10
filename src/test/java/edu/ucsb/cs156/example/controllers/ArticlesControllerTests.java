package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.entities.UCSBDate;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;

import java.util.*;
import java.util.Optional;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(controllers = ArticlesController.class)
@Import(TestConfig.class)
public class ArticlesControllerTests extends ControllerTestCase {

    @MockBean
    ArticlesRepository articleRepository;

    @MockBean
    UserRepository userRepository;

    @Test
    public void loggedOutUsersCannotGetAll() throws Exception {
        mockMvc.perform(get("/api/articles/all"))
               .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void loggedInUsersCanGetAll() throws Exception {
        mockMvc.perform(get("/api/articles/all"))
               .andExpect(status().isOk());
    }

    @Test
    public void loggedOutUsersCannotPost() throws Exception {
        mockMvc.perform(post("/api/articles/post"))
               .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void loggedInRegularUsersCannotPost() throws Exception {
        mockMvc.perform(post("/api/articles/post"))
               .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void loggedInUserCanGetAllArticles() throws Exception {
        LocalDateTime date1 = LocalDateTime.parse("2024-10-23T00:00:00");
        LocalDateTime date2 = LocalDateTime.parse("2024-10-24T00:00:00");

        Articles article1 = Articles.builder()
                                    .title("First Article")
                                    .url("https://first.com")
                                    .explanation("This is the first article.")
                                    .email("first@example.com")
                                    .dateAdded(date1)
                                    .build();

        Articles article2 = Articles.builder()
                                    .title("Second Article")
                                    .url("https://second.com")
                                    .explanation("This is the second article.")
                                    .email("second@example.com")
                                    .dateAdded(date2)
                                    .build();

        List<Articles> expectedArticles = Arrays.asList(article1, article2);
        when(articleRepository.findAll()).thenReturn(expectedArticles);

        MvcResult response = mockMvc.perform(get("/api/articles/all"))
                                    .andExpect(status().isOk())
                                    .andReturn();

        verify(articleRepository, times(1)).findAll();

        String expectedJson = mapper.writeValueAsString(expectedArticles);
        String responseString = response.getResponse().getContentAsString();

        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void adminUserCanPostANewArticle() throws Exception {
        LocalDateTime dateAdded = LocalDateTime.parse("2024-10-23T00:00:00");

        Articles article = Articles.builder()
                                   .title("First Article")
                                   .url("https://first.com")
                                   .explanation("This is the first article.")
                                   .email("first@example.com")
                                   .dateAdded(dateAdded)
                                   .build();

        when(articleRepository.save(eq(article))).thenReturn(article);

        MvcResult response = mockMvc.perform(post("/api/articles/post")
                                .param("title", "First Article")
                                .param("url", "https://first.com")
                                .param("explanation", "This is the first article.")
                                .param("email", "first@example.com")
                                .param("dateAdded", "2024-10-23T00:00:00")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();

        verify(articleRepository, times(1)).save(article);

        String expectedJson = mapper.writeValueAsString(article);
        String responseString = response.getResponse().getContentAsString();

        assertEquals(expectedJson, responseString);
    }

    @Test
    public void loggedOutUsersCannotGetArticleById() throws Exception {
        mockMvc.perform(get("/api/articles?id=7"))
               .andExpect(status().isForbidden());
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void testLoggedInUserCanGetArticleByIdWhenItExists() throws Exception {
        LocalDateTime dateAdded = LocalDateTime.parse("2022-01-01T00:00:00");

        Articles article = Articles.builder()
                                   .title("First Article")
                                   .url("https://first.com")
                                   .explanation("This is the first article.")
                                   .email("first@example.com")
                                   .dateAdded(dateAdded)
                                   .build();

        when(articleRepository.findById(eq(7L))).thenReturn(Optional.of(article));

        MvcResult response = mockMvc.perform(get("/api/articles?id=7"))
                                    .andExpect(status().isOk())
                                    .andReturn();

        verify(articleRepository, times(1)).findById(eq(7L));

        String expectedJson = mapper.writeValueAsString(article);
        String responseString = response.getResponse().getContentAsString();

        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void testLoggedInUserCannotGetArticleWhenIdDoesNotExist() throws Exception {
        when(articleRepository.findById(eq(7L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(get("/api/articles?id=7"))
                                    .andExpect(status().isNotFound())
                                    .andReturn();

        verify(articleRepository, times(1)).findById(eq(7L));

        Map<String, Object> json = responseToJson(response);

        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("Articles with id 7 not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCanEditAnExistingArticle() throws Exception {
        LocalDateTime dateAdded1 = LocalDateTime.parse("2022-01-01T00:00:00");
        LocalDateTime newDateAdded = LocalDateTime.parse("2022-12-31T00:00:00");

        Articles originalArticle = Articles.builder()
                                           .title("Original Article")
                                           .url("https://original.com")
                                           .explanation("This is the original content.")
                                           .email("original@example.com")
                                           .dateAdded(dateAdded1)
                                           .build();

        Articles editedArticle = Articles.builder()
                                         .title("Edited Article")
                                         .url("https://edited.com")
                                         .explanation("This is the edited content.")
                                         .email("edited@example.com")
                                         .dateAdded(newDateAdded)
                                         .build();

        String requestBody = mapper.writeValueAsString(editedArticle);

        when(articleRepository.findById(eq(67L))).thenReturn(Optional.of(originalArticle));

        MvcResult response = mockMvc.perform(put("/api/articles?id=67")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();

        verify(articleRepository, times(1)).findById(eq(67L));
        verify(articleRepository, times(1)).save(editedArticle);

        String responseString = response.getResponse().getContentAsString();

        assertEquals(requestBody, responseString);
        assertEquals(newDateAdded, editedArticle.getDateAdded());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCannotEditArticleThatDoesNotExist() throws Exception {
        LocalDateTime dateAdded = LocalDateTime.parse("2022-01-01T00:00:00");

        Articles editedArticle = Articles.builder()
                                         .title("Edited Article")
                                         .url("https://edited.com")
                                         .explanation("This is the edited content.")
                                         .email("edited@example.com")
                                         .dateAdded(dateAdded)
                                         .build();

        String requestBody = mapper.writeValueAsString(editedArticle);

        when(articleRepository.findById(eq(67L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(put("/api/articles?id=67")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                                .andExpect(status().isNotFound())
                                .andReturn();

        verify(articleRepository, times(1)).findById(eq(67L));

        Map<String, Object> json = responseToJson(response);

        assertEquals("Articles with id 67 not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminCanDeleteAnArticle() throws Exception {
        LocalDateTime dateAdded = LocalDateTime.parse("2022-01-03T00:00:00");

        Articles article = Articles.builder()
                                   .title("First Article")
                                   .url("https://first.com")
                                   .explanation("This is the first article.")
                                   .email("first@example.com")
                                   .dateAdded(dateAdded)
                                   .build();

        when(articleRepository.findById(eq(15L))).thenReturn(Optional.of(article));

        MvcResult response = mockMvc.perform(delete("/api/articles?id=15")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();

        verify(articleRepository, times(1)).findById(eq(15L));
        verify(articleRepository, times(1)).delete(any());

        Map<String, Object> json = responseToJson(response);

        assertEquals("Article with id 15 deleted", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void adminTriesToDeleteNonExistentArticleAndGetsErrorMessage() throws Exception {
        when(articleRepository.findById(eq(15L))).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(delete("/api/articles?id=15")
                                .with(csrf()))
                                .andExpect(status().isNotFound())
                                .andReturn();

        verify(articleRepository, times(1)).findById(eq(15L));

        Map<String, Object> json = responseToJson(response);

        assertEquals("Articles with id 15 not found", json.get("message"));
    }
}
