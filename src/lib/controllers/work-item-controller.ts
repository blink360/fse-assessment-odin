import { NextRequest, NextResponse } from "next/server";

import {
  CreateWorkItemSchema,
  UpdateStatusSchema,
} from "../types/work-item-validation";

import {
  createWorkItem,
  getWorkItems,
  getWorkItemById,
  updateWorkItemStatus,
} from "../services/api/work-item-service";

import { MockAIProvider } from "../ai/mock-ai-provider";
import {
  analyseWorkItem,
  retryAnalyseWorkItem,
} from "../services/api/work-item-analysis-service";

export class WorkItemController {
  static async create(request: NextRequest) {
    try {
      const body = await request.json();

      const result = CreateWorkItemSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: result.error.flatten(),
          },
          { status: 400 },
        );
      }

      const workItem = createWorkItem(result.data);

      return NextResponse.json(workItem, {
        status: 201,
      });
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }

  static async getAll() {
    try {
      const workItems = getWorkItems();

      return NextResponse.json(workItems);
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }

  static async getById(id: string) {
    try {
      const workItem = getWorkItemById(id);

      if (!workItem) {
        return NextResponse.json(
          { error: "Work item not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(workItem);
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }

  static async updateStatus(request: NextRequest, id: string) {
    try {
      const body = await request.json();

      const result = UpdateStatusSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: result.error.flatten(),
          },
          { status: 400 },
        );
      }

      const workItem = updateWorkItemStatus(id, result.data.status);

      return NextResponse.json(workItem);
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message === "Work item not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (
        error instanceof Error &&
        error.message.startsWith("Invalid status transition")
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }

  static async analyse(id: string) {
    try {
      const workItem = await analyseWorkItem(id, new MockAIProvider());

      return NextResponse.json(workItem);
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message === "Work item not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (
        error instanceof Error &&
        error.message.startsWith("Work item cannot be analysed")
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (error instanceof Error && error.message === "Invalid AI response") {
        return NextResponse.json({ error: error.message }, { status: 502 });
      }

      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 502 },
      );
    }
  }

  static async retry(id: string) {
    try {
      const workItem = await retryAnalyseWorkItem(id, new MockAIProvider());

      return NextResponse.json(workItem);
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message === "Work item not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (
        error instanceof Error &&
        error.message.startsWith("Work item cannot be retried")
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      if (error instanceof Error && error.message === "Invalid AI response") {
        return NextResponse.json({ error: error.message }, { status: 502 });
      }

      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 502 },
      );
    }
  }

  static async getStatus(id: string) {
    try {
      const workItem = getWorkItemById(id);

      if (!workItem) {
        return NextResponse.json(
          { error: "Work item not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        id: workItem.id,
        status: workItem.status,
      });
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }
}
