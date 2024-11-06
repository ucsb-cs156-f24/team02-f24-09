import { onDeleteSuccess, cellToAxiosParamsDelete } from "main/utils/RecommendationRequestUtils";
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

describe("RecommendationRequestUtils", () => {
  describe("onDeleteSuccess", () => {
    test("Logs message to console and displays in a toast", () => {
      // Arrange
      const restoreConsole = mockConsole();

      // Act
      onDeleteSuccess("abc");

      // Assert
      expect(toast).toHaveBeenCalledWith("abc");
      expect(console.log).toHaveBeenCalledWith("abc");

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("Returns the correct params for axios", () => {
      // Arrange
      const cell = { row: { values: { id: 17 } } };

      // Act
      const result = cellToAxiosParamsDelete(cell);

      // Assert
      expect(result).toEqual({
        url: "/api/recommendationrequest",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });
});