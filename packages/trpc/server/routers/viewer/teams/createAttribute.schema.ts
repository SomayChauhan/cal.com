import { z } from "zod";

import { ZAttributeTypeEnum, ZAttributeOptionSchema } from "@calcom/prisma/zod-utils";

export const ZCreateAttributeInputSchema = z.object({
  teamId: z.number(),
  name: z.string(),
  type: ZAttributeTypeEnum,
  options: ZAttributeOptionSchema,
  hidden: z.boolean().optional(),
  allowEdit: z.boolean().optional(),
});

export type TCreateAttributeInputSchema = z.infer<typeof ZCreateAttributeInputSchema>;
