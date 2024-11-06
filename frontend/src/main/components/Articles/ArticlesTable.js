import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/ArticlesUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function ArticlesTable({ sbarticles, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/articles/edit/${cell.row.values.id}`);
  };

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/articles/all"],
  );

  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Title",
      accessor: "title",
    },
    {
      Header: "Url",
      accessor: "url",
    },
    {
      Header: "Explanation",
      accessor: "explanation",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "DateAdded",
      accessor: "dateAdded",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "ArticlesTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "ArticlesTable"),
    );
  }

  return (
    <OurTable data={sbarticles} columns={columns} testid={"ArticlesTable"} />
  );
}
