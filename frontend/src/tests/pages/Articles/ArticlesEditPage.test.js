import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "jest-mock-console";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
    useParams: () => ({
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Articles");
      expect(screen.queryByTestId("ArticleForm-title")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        dateAdded: "2022-02-02T00:00",
        title: "test_title_2",
        url: "test_url_2",
        email: "test_email_2",
        explanation: "test_explanation_2",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: 17,
        dateAdded: "2022-02-02T00:01",
        title: "test_title_3",
        url: "test_url_3",
        email: "test_email_3",
        explanation: "test_explanation_3",
      });
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      const id = screen.getByTestId("ArticlesForm-id");
      const title = screen.getByTestId("ArticlesForm-title");
      const url = screen.getByTestId("ArticlesForm-url");
      const explanation = screen.getByTestId("ArticlesForm-explanation");
      const email = screen.getByTestId("ArticlesForm-email");
      const dateAdded = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(id).toHaveValue("17");
      expect(title).toHaveValue("test_title_2");
      expect(url).toHaveValue("test_url_2");
      expect(explanation).toHaveValue("test_explanation_2");
      expect(email).toHaveValue("test_email_2");
      expect(dateAdded).toHaveValue("2022-02-02T00:00");
      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      const id = screen.getByTestId("ArticlesForm-id");
      const title = screen.getByTestId("ArticlesForm-title");
      const url = screen.getByTestId("ArticlesForm-url");
      const explanation = screen.getByTestId("ArticlesForm-explanation");
      const email = screen.getByTestId("ArticlesForm-email");
      const dateAdded = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(id).toHaveValue("17");
      expect(title).toHaveValue("test_title_2");
      expect(url).toHaveValue("test_url_2");
      expect(explanation).toHaveValue("test_explanation_2");
      expect(email).toHaveValue("test_email_2");
      expect(dateAdded).toHaveValue("2022-02-02T00:00");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(title, { target: { value: "test_title_3" } });
      fireEvent.change(url, { target: { value: "test_url_3" } });
      fireEvent.change(explanation, {
        target: { value: "test_explanation_3" },
      });
      fireEvent.change(email, { target: { value: "test_email_3" } });
      fireEvent.change(dateAdded, {
        target: { value: "2022-02-02T00:01" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Articles Updated - id: 17 title: test_title_3",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "test_title_3",
          url: "test_url_3",
          explanation: "test_explanation_3",
          email: "test_email_3",
          dateAdded: "2022-02-02T00:01",
        }),
      ); // posted object
    });
  });
});
