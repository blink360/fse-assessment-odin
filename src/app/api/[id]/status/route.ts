import { NextRequest } from "next/server";
import { WorkItemController } from "../../../../lib/controllers/work-item-controller";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return WorkItemController.updateStatus(request, id);
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  return WorkItemController.getStatus(id);
}
