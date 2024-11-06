import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function OrganizationForm({
    initialContents,
    submitAction,
    buttonLabel = "Create",
}) {
    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({ defaultValues: initialContents || {} });
    // Stryker restore all

    const navigate = useNavigate();

    const testIdPrefix = "OrganizationForm";

    return (
        <Form onSubmit={handleSubmit(submitAction)}>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="orgCode">orgCode</Form.Label>
                <Form.Control
                    data-testid={testIdPrefix + "orgCode"}
                    id="orgCode"
                    type="text"
                    {...register("orgCode", {
                        required: "orgCode is required.",
                        maxLength: {
                            value: 10,
                            message: "Max length 10 characters",
                        },
                    })}
                    isInvalid={Boolean(errors.orgCode)}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.orgCode?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="OrgTranslationShort">OrgTranslationShort</Form.Label>
                <Form.Control
                    data-testid={testIdPrefix + "-OrgTranslationShort"}
                    id="OrgTranslationShort"
                    type="text"
                    isInvalid={Boolean(errors.orgTranslationShort)}
                    {...register("orgTranslationShort", {
                        required: "OrgTranslationShort is required.",
                        maxLength: {
                            value: 30,
                            message: "Max length 30 characters",
                        },
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.orgTranslationShort?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="OrgTranslation">OrgTranslation</Form.Label>
                <Form.Control
                    data-testid={testIdPrefix + "-OrgTranslation"}
                    id="OrgTranslation"
                    type="text"
                    isInvalid={Boolean(errors.orgTranslation)}
                    {...register("orgTranslation", {
                        required: "OrgTranslation is required.",
                        maxLength: {
                            value: 30,
                            message: "Max length 30 characters",
                        },
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.orgTranslation?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Inactive"
                    id="inactive"
                    {...register("inactive")}
                    data-testid={testIdPrefix + "-inactive"}
                />
            </Form.Group>

            <Button type="submit" data-testid={testIdPrefix + "-submit"}>
                {buttonLabel}
            </Button>
            <Button
                variant="Secondary"
                onClick={() => navigate(-1)}
                data-testid={testIdPrefix + "-cancel"}
            >
                Cancel
            </Button>
        </Form>
    );
}

export default OrganizationForm;