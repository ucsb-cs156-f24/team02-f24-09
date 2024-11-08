import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/RecommendationRequestUtils";

import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function RecommendationRequestTable({
  recommendationRequests,
  currentUser,
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/recommendationrequest/edit/${cell.row.values.id}`);
  };

  // Stryker disable all
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/recommendationrequest/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };
  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Requester's Email",
      accessor: "requesterEmail",
    },
    {
      Header: "Professor's Email",
      accessor: "professorEmail",
    },
    {
      Header: "Explanation",
      accessor: "explanation",
    },
    {
      Header: "Request Date",
      accessor: "dateRequested",
    },
    {
      Header: "Date Needed",
      accessor: "dateNeeded",
    },
    {
      Header: "Done",
      accessor: "done",
      // Stryker disable all
      Cell: ({ value }) => (value ? "True" : "False"),
      // Stryker restore all
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn(
        "Edit",
        "primary",
        editCallback,
        "RecommendationRequestTable",
      ),
    );
    columns.push(
      ButtonColumn(
        "Delete",
        "danger",
        deleteCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  return (
    <OurTable
      data={recommendationRequests}
      columns={columns}
      testid={"RecommendationRequestTable"}
    />
  );
}
