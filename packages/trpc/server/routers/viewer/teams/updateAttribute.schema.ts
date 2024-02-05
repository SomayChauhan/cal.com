import { z } from "zod";

import { ZAttributeTypeEnum, ZAttributeOptionSchema } from "@calcom/prisma/zod-utils";

export const ZUpdateAttributeInputSchema = z.object({
  teamId: z.number(),
  attributeId: z.number(),
  name: z.string(),
  type: ZAttributeTypeEnum,
  options: ZAttributeOptionSchema,
  hidden: z.boolean().optional(),
  allowEdit: z.boolean().optional(),
});

export type TUpdateAttributeInputSchema = z.infer<typeof ZUpdateAttributeInputSchema>;
