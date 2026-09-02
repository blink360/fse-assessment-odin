import { randomUUID } from "crypto";
import db from "../../db";
import {
  CreateWorkItemInput,
  WorkItem,
  WorkItemStatus,
} from "../../types/work-item";
import { canTransition } from "../../utils/work-item-state";

interface WorkItemRow {
  id: string;
  external_id: string;
  title: string;
  description: string;
  status: WorkItemStatus;
  category: string | null;
  priority: WorkItem["priority"];
  summary: string | null;
  recommended_action: string | null;
  created_at: string;
  updated_at: string;
}

const mapWorkItem = (row: WorkItemRow): WorkItem => {
  return {
    id: row.id,
    externalId: row.external_id,
    title: row.title,
    description: row.description,
    status: row.status,
    category: row.category,
    priority: row.priority,
    summary: row.summary,
    recommendedAction: row.recommended_action,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapDatabaseRow = (row: Record<string, unknown>): WorkItemRow => {
  return {
    id: row.id as string,
    external_id: row.external_id as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as WorkItemStatus,
    category: row.category as string | null,
    priority: row.priority as WorkItem["priority"],
    summary: row.summary as string | null,
    recommended_action: row.recommended_action as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
};

export const createWorkItem = (input: CreateWorkItemInput): WorkItem => {
  const id = randomUUID();
  const now = new Date().toISOString();

  const statement = db.prepare(`
    INSERT INTO work_items (
      id,
      external_id,
      title,
      description,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, 'RECEIVED', ?, ?)
  `);

  statement.run(id, input.externalId, input.title, input.description, now, now);

  return getWorkItemById(id)!;
};

export const getWorkItems = (): WorkItem[] => {
  const rows = db
    .prepare(
      `
      SELECT *
      FROM work_items
      ORDER BY created_at DESC
    `,
    )
    .all();

  return rows.map((row) =>
    mapWorkItem(mapDatabaseRow(row as Record<string, unknown>)),
  );
};

export const getWorkItemById = (id: string): WorkItem | null => {
  const row = db
    .prepare(
      `
      SELECT *
      FROM work_items
      WHERE id = ?
    `,
    )
    .get(id);

  if (!row) {
    return null;
  }

  return mapWorkItem(mapDatabaseRow(row as Record<string, unknown>));
};

export const updateWorkItemStatus = (
  id: string,
  nextStatus: WorkItemStatus,
): WorkItem => {
  const workItem = getWorkItemById(id);

  if (!workItem) {
    throw new Error("Work item not found");
  }

  if (!canTransition(workItem.status, nextStatus)) {
    throw new Error(
      `Invalid status transition: ${workItem.status} → ${nextStatus}`,
    );
  }

  const now = new Date().toISOString();

  const statement = db.prepare(`
    UPDATE work_items
    SET
      status = ?,
      updated_at = ?
    WHERE id = ?
  `);

  statement.run(nextStatus, now, id);

  return getWorkItemById(id)!;
};

export const saveAnalysis = (
  id: string,
  analysis: {
    category: string;
    priority: WorkItem["priority"];
    summary: string;
    recommendedAction: string;
  },
): WorkItem => {
  const workItem = getWorkItemById(id);

  if (!workItem) {
    throw new Error("Work item not found");
  }

  const now = new Date().toISOString();

  const statement = db.prepare(`
    UPDATE work_items
    SET
      category = ?,
      priority = ?,
      summary = ?,
      recommended_action = ?,
      updated_at = ?
    WHERE id = ?
  `);

  statement.run(
    analysis.category,
    analysis.priority,
    analysis.summary,
    analysis.recommendedAction,
    now,
    id,
  );

  return getWorkItemById(id)!;
};
