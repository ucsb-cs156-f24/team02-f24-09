import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import ArticlesForm from "main/components/Articles/ArticlesForm";

export default function ArticlesEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: articles,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/articles?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/articles`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (article) => ({
    url: "/api/articles",
    method: "PUT",
    params: {
      id: article.id,
    },
    data: {
      title: article.title,
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      dateAdded: article.dateAdded,
    },
  });

  const onSuccess = (article) => {
    toast(`Articles Updated - id: ${article.id} title: ${article.title}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/article?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/articles" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Articles</h1>
        {articles && (
          <ArticlesForm
            initialContents={articles}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
