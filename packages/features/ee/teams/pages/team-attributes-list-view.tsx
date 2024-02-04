"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { useParamsWithFallback } from "@calcom/lib/hooks/useParamsWithFallback";
import { MembershipRole } from "@calcom/prisma/enums";
import { ZTeamAttributeOptionsSchema } from "@calcom/prisma/zod-utils";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import {
  Badge,
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyScreen,
  Meta,
  Switch,
  Tooltip,
  showToast,
} from "@calcom/ui";
import { Plus, Loader, UserX, Edit2, MoreHorizontal } from "@calcom/ui/components/icon";

import { getLayout } from "../../../settings/layouts/SettingsLayout";
import AddAttributesModal from "../components/AddAttributesModal";

type Team = RouterOutputs["viewer"]["teams"]["get"];
type Attribute = RouterOutputs["viewer"]["teams"]["get"]["attributes"][number];

interface AttributesListProps {
  team: Team | undefined;
  setShowAddAttributesModal: (value: boolean) => void;
}

function AttributesListItem({ attribute }: { attribute: Attribute }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  console.log("pathnamepathnamepathname: ", pathname);
  const attributeOptions = ZTeamAttributeOptionsSchema.parse(attribute.options || []) || [];
  return (
    <li className="divide-subtle divide-y px-5">
      <div className="my-4 flex justify-between">
        <div className="flex w-full flex-col justify-between overflow-hidden sm:flex-row">
          <div className="flex">
            <div className="ms-3 inline-block overflow-hidden">
              <div className="mb-1 flex">
                <span className="text-default mr-1 text-sm font-bold leading-4">{attribute.name}</span>
              </div>
              <div className="text-default flex items-center">
                <span className=" block text-sm" data-testid="member-email">
                  {attribute.type}
                </span>
                {attributeOptions.length > 0 && (
                  <>
                    <span className="text-default mx-2 block">•</span>
                    <span className=" block text-sm" data-testid="member-email">
                      {attributeOptions}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          {attribute.hidden && <Badge variant="gray">{t("hidden")}</Badge>}
          <Tooltip content={true ? t("show_eventtype_on_profile") : t("hide_from_profile")}>
            <div className="self-center rounded-md p-2">
              <Switch
                name="Hidden"
                checked={!attribute.hidden}
                onCheckedChange={() => {
                  // setHiddenMutation.mutate({ id: type.id, hidden: !type.hidden });
                }}
              />
            </div>
          </Tooltip>
          <ButtonGroup combined containerProps={{ className: "border-default" }}>
            <Dropdown>
              <DropdownMenuTrigger asChild>
                <Button
                  className="radix-state-open:rounded-r-md"
                  color="secondary"
                  variant="icon"
                  StartIcon={MoreHorizontal}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <DropdownItem
                    type="button"
                    onClick={() => router.push(`${pathname}/${attribute.id}`)}
                    StartIcon={Edit2}>
                    {t("edit")}
                  </DropdownItem>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DropdownItem
                    type="button"
                    // onClick={() => setShowDeleteModal(true)}
                    color="destructive"
                    StartIcon={UserX}>
                    {t("remove")}
                  </DropdownItem>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </Dropdown>
          </ButtonGroup>
        </div>
      </div>
    </li>
  );
}

function AttributesList(props: AttributesListProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-y-3">
      {props?.team?.attributes && props?.team?.attributes?.length > 0 ? (
        <ul className="divide-subtle border-subtle divide-y rounded-md border ">
          {props.team.attributes.map((attribute, index) => {
            return <AttributesListItem attribute={attribute} key={`${attribute.name}-${index}`} />;
          })}
        </ul>
      ) : (
        <EmptyScreen
          Icon={Loader}
          headline={t("add_attributes")}
          description={t("add_attributes_description")}
          buttonRaw={
            <Button
              type="button"
              color="primary"
              StartIcon={Plus}
              className="ml-auto"
              onClick={() => props.setShowAddAttributesModal(true)}
              data-testid="new-member-button">
              {t("new_attribute")}
            </Button>
          }
        />
      )}
    </div>
  );
}

const AttributesListView = () => {
  const searchParams = useCompatSearchParams();
  const { t } = useLocale();

  const utils = trpc.useContext();
  const params = useParamsWithFallback();

  const teamId = Number(params.id);

  const showDialog = searchParams?.get("inviteModal") === "true";
  const [showAddAttributesModal, setShowAddAttributesModal] = useState(showDialog);

  const {
    data: team,
    isPending: isTeamsLoading,
    error: teamError,
  } = trpc.viewer.teams.get.useQuery(
    { teamId },
    {
      enabled: !!teamId,
    }
  );

  console.log("tteamteamteameam: ", team);
  const isPending = isTeamsLoading;

  const createAttributeMutation = trpc.viewer.teams.createAttribute.useMutation();

  const isAdmin =
    team && (team.membership.role === MembershipRole.OWNER || team.membership.role === MembershipRole.ADMIN);

  return (
    <>
      <Meta
        title={t("attributes")}
        description={t("add_attributes_description")}
        CTA={
          isAdmin ? (
            <Button
              type="button"
              color="primary"
              StartIcon={Plus}
              className="ml-auto"
              onClick={() => setShowAddAttributesModal(true)}
              data-testid="new-member-button">
              {t("add")}
            </Button>
          ) : (
            <></>
          )
        }
      />
      {!isPending && (
        <>
          <div>
            {((team?.isPrivate && isAdmin) || !team?.isPrivate) && (
              <>
                <AttributesList team={team} setShowAddAttributesModal={setShowAddAttributesModal} />
              </>
            )}
          </div>
          {showAddAttributesModal && team && (
            <AddAttributesModal
              isPending={createAttributeMutation.isPending}
              isOpen={showAddAttributesModal}
              onExit={() => setShowAddAttributesModal(false)}
              onSubmit={(values, resetFields) => {
                createAttributeMutation.mutate(
                  {
                    teamId,
                    name: values.name,
                    type: values.type,
                  },
                  {
                    onSuccess: async (data) => {
                      await utils.viewer.teams.get.invalidate();
                      setShowAddAttributesModal(false);
                      resetFields();
                      showToast(t("attribute_added_successfully"), "success");
                    },
                    onError: (error) => {
                      showToast(error.message, "error");
                    },
                  }
                );
              }}
            />
          )}
        </>
      )}
    </>
  );
};

AttributesListView.getLayout = getLayout;

export default AttributesListView;
