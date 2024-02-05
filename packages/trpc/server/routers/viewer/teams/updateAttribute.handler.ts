import { isTeamAdmin } from "@calcom/lib/server/queries/teams";
import prisma from "@calcom/prisma";
import { TRPCError } from "@calcom/trpc/server";
import type { TrpcSessionUser } from "@calcom/trpc/server/trpc";

import type { TUpdateAttributeInputSchema } from "./updateAttribute.schema";

type UpdateAttributeOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TUpdateAttributeInputSchema;
};

export const udpateAttributeHandler = async ({ ctx, input }: UpdateAttributeOptions) => {
  const { teamId } = input;
  const isOrgAdmin = ctx.user?.organization?.isOrgAdmin;

  if (!isOrgAdmin) {
    if (!(await isTeamAdmin(ctx.user?.id, teamId))) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }

  const attribute = await prisma.attribute.update({
    where: {
      id: input.attributeId,
      teamId: input.teamId,
    },
    data: {
      name: input.name,
      type: input.type,
      options: input.options,
      hidden: input.hidden,
      allowEdit: input.allowEdit,
    },
  });
  return {
    ...attribute,
  };
};

export default udpateAttributeHandler;
