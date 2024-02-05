import { z } from "zod";

import { ZAttributeTypeEnum, ZTeamAttributeOptionsSchema } from "@calcom/prisma/zod-utils";

export const ZCreateAttributeInputSchema = z.object({
  teamId: z.number(),
  name: z.string(),
  type: ZAttributeTypeEnum,
  options: ZTeamAttributeOptionsSchema,
  hidden: z.boolean().optional(),
  allowEdit: z.boolean().optional(),
});

export type TCreateAttributeInputSchema = z.infer<typeof ZCreateAttributeInputSchema>;
