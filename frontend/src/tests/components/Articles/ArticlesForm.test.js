import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("ArticlesForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByText(/Title/);
    await screen.findByText(/Create/);
  });

  test("renders correctly when passing in an Article", async () => {
    render(
      <Router>
        <ArticlesForm initialContents={articlesFixtures.oneArticle} />
      </Router>,
    );
    await screen.findByTestId(/ArticlesForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/ArticlesForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByTestId("ArticlesForm-title");
    const titleField = screen.getByTestId("ArticlesForm-title");
    const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
    const submitButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.change(titleField, { target: { value: "bad-input" } });
    fireEvent.change(dateAddedField, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Date must be in ISO format/);
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByTestId("ArticlesForm-submit");
    const submitButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Email is required./);
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/URL is required./)).toBeInTheDocument();
    expect(screen.getByText(/Title is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date must be in ISO format./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = jest.fn();

    render(
      <Router>
        <ArticlesForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ArticlesForm-title");
    const submitButton = screen.getByTestId("ArticlesForm-submit");

    const titleField = screen.getByTestId("ArticlesForm-title");
    const urlField = screen.getByTestId("ArticlesForm-url");
    const explanationField = screen.getByTestId("ArticlesForm-explanation");
    const emailField = screen.getByTestId("ArticlesForm-email");
    const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");

    fireEvent.change(titleField, { target: { value: "title_testing" } });
    fireEvent.change(urlField, { target: { value: "url_testing" } });
    fireEvent.change(explanationField, {
      target: { value: "explanation_testing" },
    });
    fireEvent.change(emailField, { target: { value: "email_testing" } });
    fireEvent.change(dateAddedField, {
      target: { value: "2022-01-02T12:00:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Date must be in ISO format/),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    await screen.findByTestId("ArticlesForm-cancel");
    const cancelButton = screen.getByTestId("ArticlesForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
