"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { useParamsWithFallback } from "@calcom/lib/hooks/useParamsWithFallback";
import { MembershipRole } from "@calcom/prisma/enums";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { Button, EmptyScreen, Meta } from "@calcom/ui";
import { Plus, Loader } from "@calcom/ui/components/icon";

import { getLayout } from "../../../settings/layouts/SettingsLayout";
import AddAttributesModal from "../components/AddAttributesModal";
import MemberListItem from "../components/MemberListItem";

type Team = RouterOutputs["viewer"]["teams"]["get"];

interface AttributesListProps {
  team: Team | undefined;
  isOrgAdminOrOwner: boolean | undefined;
  setShowAddAttributesModal: (value: boolean) => void;
}

const checkIfExist = (comp: string, query: string) =>
  comp.toLowerCase().replace(/\s+/g, "").includes(query.toLowerCase().replace(/\s+/g, ""));

function AttributesList(props: AttributesListProps) {
  const { team, isOrgAdminOrOwner } = props;
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
            return (
              <MemberListItem
                key={member.id}
                team={team}
                member={member}
                isOrgAdminOrOwner={isOrgAdminOrOwner}
              />
            );
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
  const { t, i18n } = useLocale();

  const router = useRouter();
  const session = useSession();

  const utils = trpc.useContext();
  const params = useParamsWithFallback();

  const teamId = Number(params.id);

  const showDialog = searchParams?.get("inviteModal") === "true";
  const [showAddAttributesModal, setShowAddAttributesModal] = useState(showDialog);

  const { data: currentOrg } = trpc.viewer.organizations.listCurrent.useQuery(undefined, {
    enabled: !!session.data?.user?.org,
  });

  const { data: orgMembersNotInThisTeam, isPending: isOrgListLoading } =
    trpc.viewer.organizations.getMembers.useQuery(
      {
        teamIdToExclude: teamId,
        distinctUser: true,
      },
      {
        enabled: searchParams !== null && !!teamId,
      }
    );

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
  useEffect(
    function refactorMeWithoutEffect() {
      if (teamError) {
        router.push("/settings");
      }
    },
    [teamError]
  );

  const isPending = isOrgListLoading || isTeamsLoading;

  const inviteMemberMutation = trpc.viewer.teams.inviteMember.useMutation();

  const isAdmin =
    team && (team.membership.role === MembershipRole.OWNER || team.membership.role === MembershipRole.ADMIN);

  const isOrgAdminOrOwner =
    currentOrg &&
    (currentOrg.user.role === MembershipRole.OWNER || currentOrg.user.role === MembershipRole.ADMIN);

  return (
    <>
      <Meta
        title={t("attributes")}
        description={t("add_attributes_description")}
        CTA={
          isAdmin || isOrgAdminOrOwner ? (
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
            {((team?.isPrivate && isAdmin) || !team?.isPrivate || isOrgAdminOrOwner) && (
              <>
                <AttributesList
                  team={team}
                  isOrgAdminOrOwner={isOrgAdminOrOwner}
                  setShowAddAttributesModal={setShowAddAttributesModal}
                />
              </>
            )}
          </div>
          {showAddAttributesModal && team && (
            <AddAttributesModal
              isPending={inviteMemberMutation.isPending}
              isOpen={showAddAttributesModal}
              orgMembers={orgMembersNotInThisTeam}
              members={team.members}
              teamId={team.id}
              token={team.inviteToken?.token}
              onExit={() => setShowAddAttributesModal(false)}
              onSubmit={(values, resetFields) => {
                // inviteMemberMutation.mutate(
                //   {
                //     teamId,
                //     language: i18n.language,
                //     role: values.role,
                //     usernameOrEmail: values.emailOrUsername,
                //   },
                //   {
                //     onSuccess: async (data) => {
                //       await utils.viewer.teams.get.invalidate();
                //       await utils.viewer.organizations.getMembers.invalidate();
                //       setShowAddAttributesModal(false);
                //       if (Array.isArray(data.usernameOrEmail)) {
                //         showToast(
                //           t("email_invite_team_bulk", {
                //             userCount: data.usernameOrEmail.length,
                //           }),
                //           "success"
                //         );
                //         resetFields();
                //       } else {
                //         showToast(
                //           t("email_invite_team", {
                //             email: data.usernameOrEmail,
                //           }),
                //           "success"
                //         );
                //       }
                //     },
                //     onError: (error) => {
                //       showToast(error.message, "error");
                //     },
                //   }
                // );
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
