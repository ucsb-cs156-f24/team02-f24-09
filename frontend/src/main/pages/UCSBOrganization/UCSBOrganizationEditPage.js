import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm"; // Fixed typo in import
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({ storybook = false }) {
  let { orgCode } = useParams(); // Changed from id to orgCode to match your router

  const {
    data: organization,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/ucsborganization?id=${orgCode}`], // Changed to match backend endpoint
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: "/api/ucsborganization",
      params: {
        id: orgCode, // Changed to use id as the parameter name
      },
    },
  );

  const objectToAxiosPutParams = (organization) => ({
    url: "/api/ucsborganization",
    method: "PUT",
    params: {
      orgCode: organization.orgCode,
    },
    data: {
      orgCode: organization.orgCode,
      orgTranslationShort: organization.orgTranslationShort,
      orgTranslation: organization.orgTranslation,
      inactive: organization.inactive,
    },
  });

  const onSuccess = (organization) => {
    toast(
      `Organization Updated - orgCode: ${organization.orgCode} orgTranslationShort: ${organization.orgTranslationShort}`
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/ucsborganization?id=${orgCode}`]
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />; // Fixed navigation path
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Organization</h1>
        {organization && (
          <UCSBOrganizationForm  // Fixed component name
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={organization}
          />
        )}
      </div>
    </BasicLayout>
  );
}