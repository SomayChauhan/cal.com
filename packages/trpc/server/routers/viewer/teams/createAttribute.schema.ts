import { z } from "zod";

import { ZAttributeTypeEnum } from "@calcom/prisma/zod-utils";

export const ZCreateAttributeInputSchema = z.object({
  teamId: z.number(),
  name: z.string(),
  type: ZAttributeTypeEnum,
});

export type TCreateAttributeInputSchema = z.infer<typeof ZCreateAttributeInputSchema>;
