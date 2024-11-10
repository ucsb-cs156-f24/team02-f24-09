import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({ storybook = false }) {
  // Extract the organization ID from the route params
  let { orgCode } = useParams();

  // Fetch organization data by ID
  const {
    data: ucsbOrganization,
    _error,
    _status,
  } = useBackend(
    [`/api/ucsborganization?id=${orgCode}`], // Cache key
    {
      method: "GET",
      url: `/api/ucsborganization`,
      params: {id: orgCode }, // Send the 'id' as a query parameter
    }
  );

  // Define the PUT request for updating an organization
  const objectToAxiosPutParams = (organization) => ({
    url: "/api/ucsborganization",
    method: "PUT",
    params: {
      id: organization.id, // Pass the organization ID
    },
    data: {
      orgCode: organization.orgCode,
      orgTranslationShort: organization.orgTranslationShort,
      orgTranslation: organization.orgTranslation,
      inactive: organization.inactive,
    },
  });

  // Handle success after updating the organization
  const onSuccess = (updatedOrganization) => {
    toast(
      `Organization Updated - id: ${updatedOrganization.orgaCode}}`
    );
  };

  // Set up mutation for updating the organization
  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    [`/api/ucsborganization?id=${orgCode}`] // Cache invalidation key
  );

  const { isSuccess } = mutation;

  // Submit handler for the form
  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  // Redirect to the main organizations page after successful update
  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />;
  }

  // Render the edit page
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSB Organization</h1>
        {ucsbOrganization && (
          <UCSBOrganizationForm
            submitAction={onSubmit}
            buttonLabel="Update"
            initialContents={ucsbOrganization}
          />
        )}
      </div>
    </BasicLayout>
  );
}

