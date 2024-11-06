import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("UCSBOrganizationTable tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["OrgCode", "Short Translation", "Full Translation", "Inactive"];
    const expectedFields = ["orgCode", "orgTranslationShort", "orgTranslation", "inactive"];
    const testId = "UCSBOrganizationTable";

    test("renders empty table correctly", () => {
        const currentUser = currentUserFixtures.adminUser;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <UCSBOrganizationTable organizations={[]} currentUser={currentUser} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach((field) => {
            const fieldElement = screen.queryByTestId(`${testId}-cell-row-0-col-${field}`);
            expect(fieldElement).not.toBeInTheDocument();
        });
    });

    test("Has the expected column headers, content and buttons for admin user", () => {
        const currentUser = currentUserFixtures.adminUser;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <UCSBOrganizationTable
                        organizations={ucsbOrganizationFixtures.threeOrganizations}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach((field) => {
            const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
            expect(header).toBeInTheDocument();
        });

        expect(screen.getByTestId(`${testId}-cell-row-0-col-orgCode`)).toHaveTextContent("2");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`)).toHaveTextContent("PIZZA HUNTERS");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`)).toHaveTextContent("Pizza Hunting Society @ UCSB");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-inactive`)).toHaveTextContent("false");

        expect(screen.getByTestId(`${testId}-cell-row-1-col-orgCode`)).toHaveTextContent("3");
        expect(screen.getByTestId(`${testId}-cell-row-1-col-orgTranslationShort`)).toHaveTextContent("UFO WATCHERS");

        const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
        expect(editButton).toBeInTheDocument();
        expect(editButton).toHaveClass("btn-primary");

        const deleteButton = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveClass("btn-danger");
    });

    test("Has the expected column headers, content for ordinary user", () => {
        const currentUser = currentUserFixtures.userOnly;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <UCSBOrganizationTable
                        organizations={ucsbOrganizationFixtures.threeOrganizations}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach((field) => {
            const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
            expect(header).toBeInTheDocument();
        });

        expect(screen.getByTestId(`${testId}-cell-row-0-col-orgCode`)).toHaveTextContent("2");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`)).toHaveTextContent("PIZZA HUNTERS");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-inactive`)).toHaveTextContent("false");

        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    test("Edit button navigates to the edit page", async () => {
        const currentUser = currentUserFixtures.adminUser;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <UCSBOrganizationTable
                        organizations={ucsbOrganizationFixtures.threeOrganizations}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId(`${testId}-cell-row-0-col-orgCode`)).toHaveTextContent("2");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`)).toHaveTextContent("PIZZA HUNTERS");

        const editButton = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
        expect(editButton).toBeInTheDocument();

        fireEvent.click(editButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('/ucsborganization/edit/2'));
    });

    test("Delete button calls delete callback", async () => {
        const currentUser = currentUserFixtures.adminUser;

        const axiosMock = new AxiosMockAdapter(axios);
        axiosMock.onDelete("/api/ucsborganization").reply(200, {
            message: "UCSBOrganization deleted"
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <UCSBOrganizationTable
                        organizations={ucsbOrganizationFixtures.threeOrganizations}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByTestId(`${testId}-cell-row-0-col-orgCode`)).toHaveTextContent("2");
        expect(screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`)).toHaveTextContent("PIZZA HUNTERS");

        const deleteButton = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
        expect(deleteButton).toBeInTheDocument();

        fireEvent.click(deleteButton);

        await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
        expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "2" });
    });
});