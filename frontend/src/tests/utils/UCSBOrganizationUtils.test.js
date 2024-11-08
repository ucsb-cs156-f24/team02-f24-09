import {
    onDeleteSuccess,
    cellToAxiosParamsDelete,
  } from "main/utils/UCSBOrganizationUtils";
  import mockConsole from "jest-mock-console";
  import { toast } from "react-toastify";
  
  jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: jest.fn(),
  }));
  
  describe("UCSBOrganizationUtils", () => {
    describe("onDeleteSuccess", () => {
      test("It logs message to console and displays toast", () => {
        // Arrange
        const restoreConsole = mockConsole();
  
        // Act
        onDeleteSuccess("Organization with orgCode XYZ was deleted");
  
        // Assert
        expect(toast).toHaveBeenCalledWith("Organization with orgCode XYZ was deleted");
        expect(console.log).toHaveBeenCalledWith("Organization with orgCode XYZ was deleted");
  
        restoreConsole();
      });
    });
  
    describe("cellToAxiosParamsDelete", () => {
      test("Returns the correct params for axios delete", () => {
        // Arrange
        const cell = {
          row: {
            values: {
              orgCode: "ZPR"
            }
          }
        };
  
        // Act
        const result = cellToAxiosParamsDelete(cell);
  
        // Assert
        expect(result).toEqual({
          url: "/api/ucsborganization",
          method: "DELETE",
          params: { id: "ZPR" }  // Changed from orgCode to id to match implementation
        });
      });
    });
  });