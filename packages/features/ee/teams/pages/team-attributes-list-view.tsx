"use client";

import { useState } from "react";

import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { useParamsWithFallback } from "@calcom/lib/hooks/useParamsWithFallback";
import { MembershipRole } from "@calcom/prisma/enums";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { Button, EmptyScreen, Meta, showToast } from "@calcom/ui";
import { Plus, Loader } from "@calcom/ui/components/icon";

import { getLayout } from "../../../settings/layouts/SettingsLayout";
import AddAttributesModal from "../components/AddAttributesModal";

type Team = RouterOutputs["viewer"]["teams"]["get"];

interface AttributesListProps {
  team: Team | undefined;
  setShowAddAttributesModal: (value: boolean) => void;
}

const checkIfExist = (comp: string, query: string) =>
  comp.toLowerCase().replace(/\s+/g, "").includes(query.toLowerCase().replace(/\s+/g, ""));

function AttributesList(props: AttributesListProps) {
  const { team } = props;
  const { t } = useLocale();
  const [query, setQuery] = useState<string>("");

  const members = team?.members;
  const membersList = members
    ? members && query === ""
      ? members
      : members.filter((member) => {
          const email = member.email ? checkIfExist(member.email, query) : false;
          const username = member.username ? checkIfExist(member.username, query) : false;
          const name = member.name ? checkIfExist(member.name, query) : false;

          return email || username || name;
        })
    : undefined;
  return (
    <div className="flex flex-col gap-y-3">
      {false && membersList?.length && team ? (
        <ul className="divide-subtle border-subtle divide-y rounded-md border ">
          {membersList.map((member) => {
            return <></>;
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
