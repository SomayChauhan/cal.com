import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { AttributeType } from "@calcom/prisma/enums";
import { Button, Dialog, DialogContent, DialogFooter, Form, Label, Select, TextField } from "@calcom/ui";

type AddAttributesModalProps = {
  isOpen: boolean;
  onExit: () => void;
  onSubmit: (values: AddAttributesForm, resetFields: () => void) => void;
  isPending?: boolean;
};

export interface AddAttributesForm {
  name: string;
  type: AttributeType;
}

export default function AddAttributesModal(props: AddAttributesModalProps) {
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

  const addAttributesFormMethods = useForm<AddAttributesForm>({
    defaultValues: {
      name: "",
      type: options[0].value,
    },
  });

  const watchType = addAttributesFormMethods.watch("type");

  const resetFields = () => {
    addAttributesFormMethods.reset();
    addAttributesFormMethods.setValue("name", "");
    addAttributesFormMethods.setValue("type", options[0].value);
  };
  return (
    <Dialog
      name="attributesModal"
      open={props.isOpen}
      onOpenChange={() => {
        props.onExit();
        addAttributesFormMethods.reset();
      }}>
      <DialogContent enableOverflow type="creation" title={t("add_attributes")}>
        <Form form={addAttributesFormMethods} handleSubmit={(values) => props.onSubmit(values, resetFields)}>
          <div className="mb-10 mt-6 space-y-6">
            <Controller
              name="name"
              control={addAttributesFormMethods.control}
              render={({ field: { onChange } }) => (
                <TextField
                  label="attribute_name"
                  id="attributeName"
                  name="attributeName"
                  required
                  onChange={(e) => onChange(e.target.value.trim().toLowerCase())}
                />
              )}
            />
            <Controller
              name="type"
              control={addAttributesFormMethods.control}
              defaultValue={options[0].value}
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
          <DialogFooter showDivider>
            <Button
              type="button"
              color="minimal"
              onClick={() => {
                props.onExit();
                resetFields();
              }}>
              {t("cancel")}
            </Button>
            <Button
              loading={props.isPending}
              type="submit"
              color="primary"
              className="me-2 ms-2"
              data-testid="invite-new-member-button">
              {watchType === AttributeType.MULTI_SELECT || watchType === AttributeType.SINGLE_SELECT
                ? t("continue")
                : t("add")}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
