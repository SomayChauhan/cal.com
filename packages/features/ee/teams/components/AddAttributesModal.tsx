import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { AttributeType } from "@calcom/prisma/enums";
import type { RouterOutputs } from "@calcom/trpc";
import { trpc } from "@calcom/trpc";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  Form,
  Label,
  showToast,
  Select,
  TextField,
} from "@calcom/ui";

import type { PendingMember } from "../lib/types";

type AddAttributesModalProps = {
  isOpen: boolean;
  justEmailInvites?: boolean;
  onExit: () => void;
  orgMembers?: RouterOutputs["viewer"]["organizations"]["getMembers"];
  onSubmit: (values: AddAttributesForm, resetFields: () => void) => void;
  onSettingsOpen?: () => void;
  teamId: number;
  members?: PendingMember[];
  token?: string;
  isPending?: boolean;
  disableCopyLink?: boolean;
  isOrg?: boolean;
};

export interface AddAttributesForm {
  name: string;
  type: AttributeType;
}

export default function AddAttributesModal(props: AddAttributesModalProps) {
  const { t } = useLocale();
  const trpcContext = trpc.useContext();

  const createInviteMutation = trpc.viewer.teams.createInvite.useMutation({
    async onSuccess({ inviteLink }) {
      trpcContext.viewer.teams.get.invalidate();
      trpcContext.viewer.teams.list.invalidate();
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

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

  const addAttributesFormMethods = useForm<AddAttributesForm>();

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
              loading={props.isPending || createInviteMutation.isPending}
              type="submit"
              color="primary"
              className="me-2 ms-2"
              data-testid="invite-new-member-button">
              {t("confirm")}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
