import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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

describe("RecommendationRequestCreatePage tests", () => {
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
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend, done = false", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 17,
      requesterEmail: "some@email.com",
      professorEmail: "some@email.com",
      explanation: "some explanation",
      dateRequeted: "2022-02-02T00:00",
      dateNeeded: "2022-02-02T00:00",
      done: false,
    };

    axiosMock
      .onPost("/api/recommendationrequest/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    const requesterEmailField = screen.getByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    const professorEmailField = screen.getByTestId(
      "RecommendationRequestForm-professorEmail",
    );
    const explanationField = screen.getByTestId(
      "RecommendationRequestForm-explanation",
    );
    const dateRequestedField = screen.getByTestId(
      "RecommendationRequestForm-dateRequested",
    );
    const dateNeededField = screen.getByTestId(
      "RecommendationRequestForm-dateNeeded",
    );
    const doneField = screen.getByTestId("RecommendationRequestForm-done");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmailField, {
      target: { value: "some@email.com" },
    });
    fireEvent.change(professorEmailField, {
      target: { value: "some@email.com" },
    });
    fireEvent.change(explanationField, {
      target: { value: "some explanation" },
    });
    fireEvent.change(dateRequestedField, {
      target: { value: "2022-02-02T00:00" },
    });
    fireEvent.change(dateNeededField, {
      target: { value: "2022-02-02T00:00" },
    });
    fireEvent.change(doneField, {
      target: { value: "false" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "some@email.com",
      professorEmail: "some@email.com",
      explanation: "some explanation",
      dateRequested: "2022-02-02T00:00",
      dateNeeded: "2022-02-02T00:00",
      done: false,
    });

    expect(mockToast).toHaveBeenCalledWith(
      "New Recommendation Request Created - id: 17",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/recommendationrequest" });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend, done = true", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 17,
      requesterEmail: "some@email.com",
      professorEmail: "some@email.com",
      explanation: "some explanation",
      dateRequeted: "2022-02-02T00:00",
      dateNeeded: "2022-02-02T00:00",
      done: true,
    };

    axiosMock
      .onPost("/api/recommendationrequest/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    const requesterEmailField = screen.getByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    const professorEmailField = screen.getByTestId(
      "RecommendationRequestForm-professorEmail",
    );
    const explanationField = screen.getByTestId(
      "RecommendationRequestForm-explanation",
    );
    const dateRequestedField = screen.getByTestId(
      "RecommendationRequestForm-dateRequested",
    );
    const dateNeededField = screen.getByTestId(
      "RecommendationRequestForm-dateNeeded",
    );
    const doneField = screen.getByTestId("RecommendationRequestForm-done");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmailField, {
      target: { value: "some@email.com" },
    });
    fireEvent.change(professorEmailField, {
      target: { value: "some@email.com" },
    });
    fireEvent.change(explanationField, {
      target: { value: "some explanation" },
    });
    fireEvent.change(dateRequestedField, {
      target: { value: "2022-02-02T00:00" },
    });
    fireEvent.change(dateNeededField, {
      target: { value: "2022-02-02T00:00" },
    });
    fireEvent.change(doneField, {
      target: { value: "true" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "some@email.com",
      professorEmail: "some@email.com",
      explanation: "some explanation",
      dateRequested: "2022-02-02T00:00",
      dateNeeded: "2022-02-02T00:00",
      done: true,
    });

    expect(mockToast).toHaveBeenCalledWith(
      "New Recommendation Request Created - id: 17",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/recommendationrequest" });
  });
});
