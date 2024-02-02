"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { AttributeType } from "@calcom/prisma/enums";
import { Button, Meta, Form, TextField, SettingsToggle, Label, Select } from "@calcom/ui";

import { getLayout } from "../../../settings/layouts/SettingsLayout";

const teamProfileFormSchema = z.object({
  name: z.string(),
  type: z.union([
    z.literal(AttributeType.MULTI_SELECT),
    z.literal(AttributeType.RELATIONSHIP_PEOPLE),
    z.literal(AttributeType.RELATIONSHIP_TEAM),
    z.literal(AttributeType.SINGLE_SELECT),
    z.literal(AttributeType.TEXT),
  ]),

  allowEdit: z.boolean(),
});
type FormValues = z.infer<typeof teamProfileFormSchema>;

const AttributeDetailView = () => {
  const { t } = useLocale();

  const options = useMemo(
    () => [
      { value: AttributeType.TEXT, label: t("text") },
      { value: AttributeType.SINGLE_SELECT, label: t("single-select") },
      { value: AttributeType.MULTI_SELECT, label: t("multi-select") },
      { value: AttributeType.RELATIONSHIP_PEOPLE, label: t("relationship-people") },
      { value: AttributeType.RELATIONSHIP_TEAM, label: t("relationship-teams") },
    ],
    [t]
  );
  const defaultValues: FormValues = {
    name: "",
    type: options[0].value,
    allowEdit: false,
  };

  const form = useForm({
    defaultValues,
    resolver: zodResolver(teamProfileFormSchema),
  });

  return (
    <>
      <Meta
        title={t(`attributes/${"Skills"}`)}
        backButton
        description={t("edit_attribute")}
        borderInShellHeader
        CTA={
          <Button
            type="button"
            color="primary"
            className="ml-auto"
            // onClick={() => setShowAddAttributesModal(true)}
            data-testid="new-member-button">
            {t("save")}
          </Button>
        }
      />
      <Form
        form={form}
        handleSubmit={(values) => {
          console.log("values: ", values);
        }}>
        <div className="border-subtle border-x px-4 py-8 sm:px-6">
          <Controller
            control={form.control}
            name="name"
            render={({ field: { value } }) => (
              <div className="mt-8">
                <TextField
                  name="name"
                  label={t("name")}
                  value={value}
                  onChange={(e) => {
                    form.setValue("name", e?.target.value, { shouldDirty: true });
                  }}
                />
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="type"
            render={({ field: { onChange } }) => (
              <div>
                <Label className="text-emphasis font-medium" htmlFor="role">
                  {t("type")}
                </Label>
                <Select
                  id="type"
                  defaultValue={options[0]}
                  options={options}
                  onChange={(val) => {
                    if (val) onChange(val.value);
                  }}
                />
              </div>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="allowEdit"
          render={({ field: { value } }) => (
            <div className="mt-8">
              <SettingsToggle
                title={t("allow_members_to_edit")}
                description={t("allow_members_to_edit_description")}
                checked={value}
                onCheckedChange={(active) => {
                  form.setValue("allowEdit", active);
                }}
                toggleSwitchAtTheEnd
              />
            </div>
          )}
        />
      </Form>
    </>
  );
};

AttributeDetailView.getLayout = getLayout;

export default AttributeDetailView;
