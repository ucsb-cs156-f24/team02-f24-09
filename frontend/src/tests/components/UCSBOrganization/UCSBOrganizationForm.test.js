import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Organization Code", "Short Translation", "Organization Translation"];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm initialContents={ucsbOrganizationFixtures.oneOrganization[0]} />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-orgCode`)).toBeDisabled();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Code is required./);
    expect(screen.getByText(/Short Translation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Organization Translation is required./)).toBeInTheDocument();

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    const orgTranslationShortInput = screen.getByTestId(`${testId}-orgTranslationShort`);
    const orgTranslationInput = screen.getByTestId(`${testId}-orgTranslation`);

    fireEvent.change(orgCodeInput, { target: { value: "a".repeat(11) } });
    fireEvent.change(orgTranslationShortInput, { target: { value: "a".repeat(31) } });
    fireEvent.change(orgTranslationInput, { target: { value: "a".repeat(31) } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 10 characters/)).toBeInTheDocument();
      expect(screen.getAllByText(/Max length 30 characters/).length).toBe(2);
    });
  });
  test("that orgCode is disabled when initialContents is present and enabled when not", async () => {
    // First render with null initialContents
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm initialContents={null} />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId(`${testId}-orgCode`)).not.toBeDisabled();

    // Then render with undefined initialContents
    rerender(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm initialContents={undefined} />
        </Router>
      </QueryClientProvider>
    );

    expect(screen.getByTestId(`${testId}-orgCode`)).not.toBeDisabled();

    // Finally render with actual initialContents
    rerender(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm initialContents={ucsbOrganizationFixtures.oneOrganization[0]} />
        </Router>
      </QueryClientProvider>
    );

    expect(screen.getByTestId(`${testId}-orgCode`)).toBeDisabled();
});
});