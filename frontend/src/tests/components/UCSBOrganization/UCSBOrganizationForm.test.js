import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UCSBOrganizationForm tests", () => {
  const testId = "UCSBOrganizationForm";

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={ucsbOrganizationFixtures.oneOrganization[0]}
        />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "NAPPING LEAGUE",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "Professional Napping League at UCSB",
    );
    const inactive = screen.getByTestId(`${testId}-inactive`);
    expect(inactive).toBeInTheDocument();
    expect(inactive.checked).toBe(true);
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that validation is performed", async () => {
    const mockSubmitAction = jest.fn();
    render(
      <Router>
        <UCSBOrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Code is required./);
    expect(
      screen.getByText(/Short Translation is required./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Organization Translation is required./),
    ).toBeInTheDocument();

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    const orgTranslationShortInput = screen.getByTestId(
      `${testId}-orgTranslationShort`,
    );
    const orgTranslationInput = screen.getByTestId(`${testId}-orgTranslation`);

    fireEvent.change(orgCodeInput, { target: { value: "a".repeat(11) } });
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "a".repeat(31) },
    });
    fireEvent.change(orgTranslationInput, {
      target: { value: "a".repeat(31) },
    });
    fireEvent.click(submitButton);

    await screen.findByText(/Max length 10 characters/);
    expect(screen.getAllByText(/Max length 30 characters/).length).toBe(2);
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("renders with default buttonLabel correctly", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    expect(submitButton).toHaveTextContent("Create");
  });
});
