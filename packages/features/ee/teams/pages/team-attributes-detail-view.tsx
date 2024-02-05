"use client";

import { useMemo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import SkeletonLoaderTeamList from "@calcom/ee/teams/components/SkeletonloaderTeamList";
import { Options } from "@calcom/features/form-builder/FormBuilder";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { useParamsWithFallback } from "@calcom/lib/hooks/useParamsWithFallback";
import { AttributeType } from "@calcom/prisma/enums";
import { ZAttributeTypeEnum, ZAttributeOptionSchema } from "@calcom/prisma/zod-utils";
import { trpc } from "@calcom/trpc/react";
import { Button, Meta, TextField, SettingsToggle, Label, Select, showToast, Form } from "@calcom/ui";

import { getLayout } from "../../../settings/layouts/SettingsLayout";

const teamProfileFormSchema = z.object({
  name: z.string(),
  type: ZAttributeTypeEnum,
  allowEdit: z.boolean(),
  options: ZAttributeOptionSchema,
});

type FormValues = z.infer<typeof teamProfileFormSchema>;

const AttributeDetailView = () => {
  const { t } = useLocale();
  const utils = trpc.useContext();

  const params = useParamsWithFallback();

  const teamId = Number(params.id);
  const attributeId = Number(params.attributeId);

  const {
    data: team,
    isPending: isTeamsLoading,
    error: teamError,
  } = trpc.viewer.teams.get.useQuery({ teamId });

  const attribute = team?.attributes.find((attribute) => attribute.id === attributeId);

  const typeOptions = useMemo(
    () => [
      { value: AttributeType.TEXT, label: t("text") },
      { value: AttributeType.SINGLE_SELECT, label: t("single-select") },
      { value: AttributeType.MULTI_SELECT, label: t("multi-select") },
      { value: AttributeType.RELATIONSHIP_PEOPLE, label: t("relationship-people") },
      { value: AttributeType.RELATIONSHIP_TEAM, label: t("relationship-teams") },
    ],
    [t]
  );
  const updateAttributeMutation = trpc.viewer.teams.updateAttribute.useMutation();

  const defaultValues: FormValues = useMemo(() => {
    return {
      name: attribute?.name || "",
      type: attribute?.type || typeOptions[0].value,
      allowEdit: attribute?.allowEdit || false,
      options: ZAttributeOptionSchema.parse(attribute?.options),
    };
  }, [attribute, typeOptions]);

  const formMethods = useForm({
    defaultValues,
  });
  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset,
    watch,
  } = formMethods;

  const watchType = watch("type");
  const isDisabled = isSubmitting || !isDirty;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  if (isTeamsLoading) {
    return <SkeletonLoaderTeamList />;
  }
  return (
    <>
      <Meta
        title={t(`Attributes / ${attribute?.name}`)}
        backButton
        description={t("edit_attribute")}
        borderInShellHeader
        CTA={
          <Button
            type="button"
            disabled={isDisabled}
            color="primary"
            className="ml-auto"
            onClick={handleSubmit((values) =>
              updateAttributeMutation.mutate(
                {
                  teamId,
                  attributeId,
                  ...values,
                },
                {
                  onSuccess: async (_data) => {
                    await utils.viewer.teams.get.invalidate();
                    showToast(t("attribute_updated_successfully"), "success");
                  },
                  onError: (error) => {
                    showToast(error.message, "error");
                  },
                }
              )
            )}
            data-testid="update-attribute-button">
            {t("save")}
          </Button>
        }
      />
      <Form form={formMethods}>
        <div className="border-subtle border-x px-4 py-8 sm:px-6">
          <Controller
            control={formMethods.control}
            name="name"
            render={({ field }) => {
              return (
                <div className="mt-8">
                  <TextField
                    name="name"
                    label={t("name")}
                    value={field.value}
                    onChange={(e) => {
                      formMethods.setValue("name", e?.target.value, { shouldDirty: true });
                    }}
                  />
                </div>
              );
            }}
          />
          <Controller
            control={formMethods.control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <div>
                <Label className="text-emphasis font-medium" htmlFor="role">
                  {t("type")}
                </Label>
                <Select
                  id="type"
                  defaultValue={typeOptions[0]}
                  options={typeOptions}
                  value={typeOptions.find((opt) => opt.value === value)}
                  onChange={(val) => {
                    if (val) onChange(val.value);
                  }}
                />
              </div>
            )}
          />
        </div>
        <Controller
          control={formMethods.control}
          name="allowEdit"
          render={({ field: { value } }) => (
            <div className="mt-8">
              <SettingsToggle
                title={t("allow_members_to_edit")}
                description={t("allow_members_to_edit_description")}
                checked={value}
                onCheckedChange={(active) => {
                  formMethods.setValue("allowEdit", active, { shouldDirty: true });
                }}
                toggleSwitchAtTheEnd
              />
            </div>
          )}
        />

        {watchType === AttributeType.MULTI_SELECT || watchType === AttributeType.SINGLE_SELECT ? (
          <Controller
            name="options"
            render={({ field: { value, onChange } }) => {
              return <Options onChange={onChange} value={value} className="mt-6" />;
            }}
          />
        ) : null}
      </Form>
    </>
  );
};

AttributeDetailView.getLayout = getLayout;

export default AttributeDetailView;
