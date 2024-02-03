import { isTeamAdmin } from "@calcom/lib/server/queries/teams";
import prisma from "@calcom/prisma";
import { teamAttributesSchema } from "@calcom/prisma/zod-utils";
import { TRPCError } from "@calcom/trpc/server";
import type { TrpcSessionUser } from "@calcom/trpc/server/trpc";

import type { TCreateAttributeInputSchema } from "./createAttribute.schema";

type CreateInviteOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TCreateAttributeInputSchema;
};

export const createAttributeHandler = async ({ ctx, input }: CreateInviteOptions) => {
  const { teamId } = input;
  const isOrgAdmin = ctx.user?.organization?.isOrgAdmin;

  if (!isOrgAdmin) {
    if (!(await isTeamAdmin(ctx.user?.id, teamId))) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      attributes: true,
    },
  });

  const teamAttributes = teamAttributesSchema.parse(team?.attributes || []);
  teamAttributes.push({
    name: input.name,
    type: input.type,
    allowEdit: false,
  });

  await prisma.team.update({
    where: { id: teamId },
    data: {
      attributes: teamAttributes,
    },
  });
  return {};
};

export default createAttributeHandler;
