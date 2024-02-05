import { z } from "zod";

import { ZAttributeTypeEnum, ZTeamAttributeOptionsSchema } from "@calcom/prisma/zod-utils";

export const ZUpdateAttributeInputSchema = z.object({
  teamId: z.number(),
  attributeId: z.number(),
  name: z.string(),
  type: ZAttributeTypeEnum,
  options: ZTeamAttributeOptionsSchema,
  hidden: z.boolean().optional(),
  allowEdit: z.boolean().optional(),
});

export type TUpdateAttributeInputSchema = z.infer<typeof ZUpdateAttributeInputSchema>;
