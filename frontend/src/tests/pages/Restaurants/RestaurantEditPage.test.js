import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

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
      orgCode: "TEST", // Changed from id: 17 to orgCode: "TEST"
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("UCSBOrganizationEditPage tests", () => {
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
      axiosMock.onGet("/api/ucsborganization", { params: { orgCode: "TEST" } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Organization");
      expect(screen.queryByTestId("UCSBOrganizationForm-orgCode")).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/ucsborganization", { params: { orgCode: "TEST" } }).reply(200, {
        orgCode: "TEST",
        orgTranslationShort: "TESTING",
        orgTranslation: "Testing Organization",
        inactive: false
      });
      axiosMock.onPut("/api/ucsborganization").reply(200, {
        orgCode: "TEST",
        orgTranslationShort: "TESTING UPDATED",
        orgTranslation: "Testing Organization Updated",
        inactive: true
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const shortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
      const translationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toBeInTheDocument();
      expect(orgCodeField).toHaveValue("TEST");
      expect(shortField).toBeInTheDocument();
      expect(shortField).toHaveValue("TESTING");
      expect(translationField).toBeInTheDocument();
      expect(translationField).toHaveValue("Testing Organization");
      expect(inactiveField).toBeInTheDocument();
      expect(inactiveField).not.toBeChecked();

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(shortField, { target: { value: "TESTING UPDATED" } });
      fireEvent.change(translationField, { target: { value: "Testing Organization Updated" } });
      fireEvent.click(inactiveField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Organization Updated - orgCode: TEST name: TESTING UPDATED"
      );

      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "TEST" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgTranslationShort: "TESTING UPDATED",
          orgTranslation: "Testing Organization Updated",
          inactive: true
        })
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const shortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
      const translationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toHaveValue("TEST");
      expect(shortField).toHaveValue("TESTING");
      expect(translationField).toHaveValue("Testing Organization");
      expect(inactiveField).not.toBeChecked();

      fireEvent.change(shortField, { target: { value: "TESTING UPDATED" } });
      fireEvent.change(translationField, { target: { value: "Testing Organization Updated" } });
      fireEvent.click(inactiveField);

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Organization Updated - orgCode: TEST name: TESTING UPDATED"
      );
      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
    });
  });
});