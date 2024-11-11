import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/UCSBOrganizationUtils"; // Updated import path
import mockConsole from "jest-mock-console";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: jest.fn(),
  };
});

describe("UCSBOrganizationUtils", () => {
  describe("onDeleteSuccess", () => {
    test("Logs message to console and displays in a toast", () => {
      // Arrange
      const restoreConsole = mockConsole();

      // Act
      onDeleteSuccess("Organization deleted successfully");

      // Assert
      expect(toast).toHaveBeenCalledWith("Organization deleted successfully");
      expect(console.log).toHaveBeenCalledWith(
        "Organization deleted successfully",
      );

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("Returns the correct params for axios", () => {
      // Arrange
      const cell = { row: { values: { orgCode: "42" } } }; // Updated to match UCSBOrganizationUtils

      // Act
      const result = cellToAxiosParamsDelete(cell);

      // Assert
      expect(result).toEqual({
        url: "/api/ucsborganization",
        method: "DELETE",
        params: { id: "42" }, // Updated to match orgCode parameter mapping
      });
    });
  });
});
