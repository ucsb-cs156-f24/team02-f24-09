import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 17,
      title: "test_title",
      email: "test_email",
      explanation: "test_explanation",
      url: "test_url",
      dateAdded: "2024-11-05T10:10:10",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    const title = screen.getByTestId("ArticlesForm-title");
    const url = screen.getByTestId("ArticlesForm-url");
    const explanation = screen.getByTestId("ArticlesForm-explanation");
    const email = screen.getByTestId("ArticlesForm-email");
    const dateAdded = screen.getByTestId("ArticlesForm-dateAdded");
    const submitButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.change(title, { target: { value: "test_title_2" } });
    fireEvent.change(url, { target: { value: "test_url_2" } });
    fireEvent.change(explanation, { target: { value: "test_explanation_2" } });
    fireEvent.change(email, { target: { value: "test_email_2" } });
    fireEvent.change(dateAdded, {
      target: { value: "2022-02-02T00:00" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      dateAdded: "2022-02-02T00:00",
      title: "test_title_2",
      url: "test_url_2",
      email: "test_email_2",
      explanation: "test_explanation_2",
    });

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 17 title: test_title",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});
