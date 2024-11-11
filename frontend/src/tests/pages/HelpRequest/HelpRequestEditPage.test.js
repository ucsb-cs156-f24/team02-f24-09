import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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

describe("HelpRequestEditPage tests", () => {
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
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Help Request");
      expect(
        screen.queryByTestId("HelpRequestForm-requesterEmail"),
      ).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: 1,
        requesterEmail: "tester1@hotmail.com",
        teamId: "01",
        tableOrBreakoutRoom: "table",
        requestTime: "2024-11-06T22:22",
        explanation: "Dokku issue",
        solved: false,
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: 1,
        requesterEmail: "tester1@hotmail.com",
        teamId: "01",
        tableOrBreakoutRoom: "table",
        requestTime: "2024-11-06T22:22",
        explanation: "Git issue",
        solved: true,
      });
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      const emailField = screen.getByTestId("HelpRequestForm-requesterEmail");
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const roomField = screen.getByTestId(
        "HelpRequestForm-tableOrBreakoutRoom",
      );
      const requestTimeField = screen.getByTestId(
        "HelpRequestForm-requestTime",
      );
      const explanationField = screen.getByTestId(
        "HelpRequestForm-explanation",
      );
      const solvedCheckbox = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(emailField).toHaveValue("tester1@hotmail.com");
      expect(teamIdField).toHaveValue("01");
      expect(roomField).toHaveValue("table");
      expect(requestTimeField).toHaveValue("2024-11-06T22:22");
      expect(explanationField).toHaveValue("Dokku issue");
      expect(solvedCheckbox).not.toBeChecked();
      expect(submitButton).toHaveTextContent("Update");
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByTestId("HelpRequestForm-requesterEmail");

      const explanationField = screen.getByTestId(
        "HelpRequestForm-explanation",
      );
      const solvedCheckbox = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      fireEvent.change(explanationField, {
        target: { value: "Git issue" },
      });
      fireEvent.click(solvedCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Help Request Updated - id: 1 Team ID: 01",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "tester1@hotmail.com",
          teamId: "01",
          tableOrBreakoutRoom: "table",
          requestTime: "2024-11-06T22:22",
          explanation: "Git issue",
          solved: true,
        }),
      ); // posted object
    });
  });
});
