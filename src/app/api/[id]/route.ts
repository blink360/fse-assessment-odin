import { NextRequest } from "next/server";
import { WorkItemController } from "../../../lib/controllers/work-item-controller";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  return WorkItemController.getById(id);
}