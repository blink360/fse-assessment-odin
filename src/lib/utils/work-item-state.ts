import { WorkItemStatus } from "../types/work-item";

const allowedTransitions: Record<WorkItemStatus, WorkItemStatus[]> = {
  RECEIVED: ["ANALYSING"],
  ANALYSING: ["READY_FOR_REVIEW", "FAILED"],
  READY_FOR_REVIEW: ["COMPLETED"],
  COMPLETED: [],
  FAILED: ["ANALYSING"],
};

export const canTransition = (
  currentStatus: WorkItemStatus,
  nextStatus: WorkItemStatus,
): boolean => {
  return allowedTransitions[currentStatus].includes(nextStatus);
};

export const getAllowedTransitions = (
  currentStatus: WorkItemStatus,
): WorkItemStatus[] => {
  return allowedTransitions[currentStatus];
};
