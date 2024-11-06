import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RecommendationRequestTable tests", () => {
  const queryClient = new QueryClient();
  const renderComponent = (props) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const verifyHeadersAndFields = (headers, fields, testId) => {
    headers.forEach((headerText) => expect(screen.getByText(headerText)).toBeInTheDocument());
    fields.forEach((field) => expect(screen.getByTestId(`${testId}-cell-row-0-col-${field}`)).toBeInTheDocument());
  };

  test("shows expected headers and fields for an ordinary user", () => {
    renderComponent({
      recommendationRequests: recommendationRequestFixtures.threeRequests,
      currentUser: currentUserFixtures.userOnly,
    });

    const headers = ["id", "Requester's Email", "Professor's Email", "Explanation", "Request Date", "Date Needed", "Done"];
    const fields = ["id", "requesterEmail", "professorEmail", "explanation", "dateRequested", "dateNeeded", "done"];
    const testId = "RecommendationRequestTable";

    verifyHeadersAndFields(headers, fields, testId);

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`)).not.toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`)).not.toBeInTheDocument();
  });

  test("shows expected headers, fields, and action buttons for an admin user", () => {
    renderComponent({
      recommendationRequests: recommendationRequestFixtures.threeRequests,
      currentUser: currentUserFixtures.adminUser,
    });

    const headers = ["id", "Requester's Email", "Professor's Email", "Explanation", "Request Date", "Date Needed", "Done"];
    const fields = ["id", "requesterEmail", "professorEmail", "explanation", "dateRequested", "dateNeeded", "done"];
    const testId = "RecommendationRequestTable";

    verifyHeadersAndFields(headers, fields, testId);

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");

    const editButton = screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`);
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`);
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("navigates to the edit page when Edit button is clicked by admin user", async () => {
    renderComponent({
      recommendationRequests: recommendationRequestFixtures.threeRequests,
      currentUser: currentUserFixtures.adminUser,
    });

    await waitFor(() => {
      expect(screen.getByTestId("RecommendationRequestTable-cell-row-0-col-id")).toHaveTextContent("1");
    });

    const editButton = screen.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button");
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/recommendationrequest/edit/1"),
    );
  });

  test("calls delete callback when Delete button is clicked by admin user", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onDelete("/api/recommendationrequest").reply(200, { message: "Recommendation Request deleted" });

    renderComponent({
      recommendationRequests: recommendationRequestFixtures.threeRequests,
      currentUser: currentUserFixtures.adminUser,
    });

    await waitFor(() => {
      expect(screen.getByTestId("RecommendationRequestTable-cell-row-0-col-id")).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button");
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});