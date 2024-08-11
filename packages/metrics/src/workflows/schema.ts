import { z } from "zod";
import { StatusCategory, TransitionStatus } from "../issues";
import { WorkflowStage } from "./types";

const transitionStatusSchema: z.Schema<TransitionStatus> = z.object({
  name: z.string(),
  category: z.enum([
    StatusCategory.ToDo,
    StatusCategory.InProgress,
    StatusCategory.Done,
  ]),
});

export const workflowStageSchema = z.object({
  name: z.string(),
  selectByDefault: z.boolean(),
  statuses: z.array(transitionStatusSchema),
}) satisfies z.Schema<WorkflowStage>;
