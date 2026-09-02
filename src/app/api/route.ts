import { NextRequest } from "next/server";
import { WorkItemController } from "../../lib/controllers/work-item-controller";

export async function POST(request: NextRequest) {
  return WorkItemController.create(request);
}

export async function GET() {
  return WorkItemController.getAll();
}