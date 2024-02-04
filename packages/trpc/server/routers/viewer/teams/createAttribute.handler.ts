import { isTeamAdmin } from "@calcom/lib/server/queries/teams";
import prisma from "@calcom/prisma";
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

  await prisma.attribute.create({
    data: {
      name: input.name,
      type: input.type,
      team: {
        connect: {
          id: teamId,
        },
      },
    },
  });
  return {};
};

export default createAttributeHandler;
