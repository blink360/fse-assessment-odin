export const WORK_ITEM_STATUSES = [
  "RECEIVED",
  "ANALYSING",
  "READY_FOR_REVIEW",
  "COMPLETED",
  "FAILED",
] as const;

export type WorkItemStatus = (typeof WORK_ITEM_STATUSES)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type Priority = (typeof PRIORITIES)[number];

export interface WorkItem {
  id: string;
  externalId: string;
  title: string;
  description: string;
  status: WorkItemStatus;
  category: string | null;
  priority: Priority | null;
  summary: string | null;
  recommendedAction: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkItemInput {
  externalId: string;
  title: string;
  description: string;
}

export interface UpdateWorkItemStatusInput {
  status: WorkItemStatus;
}