import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import OrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("OrganizationForm tests", () => {
  const testId = "OrganizationForm";

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <OrganizationForm
          initialContents={ucsbOrganizationFixtures.oneOrganization[0]}
        />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}orgCode`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}orgCode`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-OrgTranslationShort`)).toHaveValue(
      "NAPPING LEAGUE",
    );
    expect(screen.getByTestId(`${testId}-OrgTranslation`)).toHaveValue(
      "Professional Napping League at UCSB",
    );
    const inactive = screen.getByTestId(`${testId}-inactive`);
    expect(inactive).toBeInTheDocument();
    expect(inactive.checked).toBe(true);
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <OrganizationForm />
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
        <OrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/orgCode is required./);
    expect(
      screen.getByText(/OrgTranslationShort is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/OrgTranslation is required./)).toBeInTheDocument();

    const orgCodeInput = screen.getByTestId(`${testId}orgCode`);
    const orgTranslationShortInput = screen.getByTestId(
      `${testId}-OrgTranslationShort`,
    );
    const orgTranslationInput = screen.getByTestId(`${testId}-OrgTranslation`);

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
        <OrganizationForm />
      </Router>,
    );

    const submitButton = await screen.findByTestId("OrganizationForm-submit");
    expect(submitButton).toHaveTextContent("Create");
  });
});
