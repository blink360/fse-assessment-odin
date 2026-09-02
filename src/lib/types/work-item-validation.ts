import { z } from "zod";

export const CreateWorkItemSchema = z.object({
  externalId: z.string().min(1, "externalId is required"),
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
});

export const UpdateStatusSchema = z.object({
  status: z.enum([
    "RECEIVED",
    "ANALYSING",
    "READY_FOR_REVIEW",
    "COMPLETED",
    "FAILED",
  ]),
});

export const AnalysisSchema = z.object({
  category: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  summary: z.string().min(1),
  recommendedAction: z.string().min(1),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;
