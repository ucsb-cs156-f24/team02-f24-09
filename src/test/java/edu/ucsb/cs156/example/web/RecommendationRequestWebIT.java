package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {
    @Test
    public void admin_user_can_create_edit_delete_req() throws Exception {
        setupUser(true);

        page.getByText("Recommendation Request").click();

        page.getByText("Create Recommendation Request").click();
        assertThat(page.getByText("Create New Recommendation Request")).isVisible();
        page.getByTestId("RecommendationRequestForm-requesterEmail").fill("Tester@test.ci");
        page.getByTestId("RecommendationRequestForm-professorEmail").fill("TestProfessor@test.ci");
        page.getByTestId("RecommendationRequestForm-explanation").fill("EXTREME");

        page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2024-10-10T00:00");
        page.getByTestId("RecommendationRequestForm-dateRequested").fill("2024-10-10T00:00");

        page.getByTestId("RecommendationRequestForm-submit").click();

        assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
                .hasText("EXTREME");

        page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
        assertThat(page.getByText("Edit Recommendation Request")).isVisible();
        page.getByTestId("RecommendationRequestForm-explanation").fill("INSANE");
        page.getByTestId("RecommendationRequestForm-submit").click();

        assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation")).hasText("INSANE");

        page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation")).not().isVisible();
    }
    
}