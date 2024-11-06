import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("RecommendationRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();
  const testId = "RecommendationRequestTable";

  const setupAxiosForUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAxiosForAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("Renders with Create Button for admin user", async () => {
    setupAxiosForAdminUser();
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, []);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Create Recommendation Request/)).toBeInTheDocument();
    });

    const button = screen.getByText(/Create Recommendation Request/);
    expect(button).toHaveAttribute("href", "/recommendationrequest/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three recommendation requests correctly for regular user", async () => {
    setupAxiosForUserOnly();
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, recommendationRequestFixtures.threeRequests);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent("3");
    expect(screen.queryByText(/Create Recommendation Request/)).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupAxiosForUserOnly();
    axiosMock.onGet("/api/recommendationrequest/all").timeout();

    const restoreConsole = mockConsole();
    renderComponent();

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch("Error communicating with backend via GET on /api/recommendationrequest/all");
    restoreConsole();

    expect(screen.queryByTestId(`${testId}-cell-row-0-col-id`)).not.toBeInTheDocument();
  });

  test("when clicking delete, it triggers the delete callback for admin user", async () => {
    setupAxiosForAdminUser();
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, recommendationRequestFixtures.threeRequests);
    axiosMock.onDelete("/api/recommendationrequest").reply(200, "Recommendation Request with id 1 was deleted");

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Recommendation Request with id 1 was deleted");
    });
  });
});