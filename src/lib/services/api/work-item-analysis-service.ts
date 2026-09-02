import { AIProvider } from "../../ai/mock-ai-provider";
import { AnalysisSchema } from "../../types/work-item-validation";
import {
  getWorkItemById,
  saveAnalysis,
  updateWorkItemStatus,
} from "./work-item-service";

export const analyseWorkItem = async (id: string, aiProvider: AIProvider) => {
  const workItem = getWorkItemById(id);
  if (!workItem) {
    throw new Error("Work item not found");
  }

  if (workItem.status !== "RECEIVED") {
    throw new Error(
      `Work item cannot be analysed from status: ${workItem.status}`,
    );
  }

  updateWorkItemStatus(id, "ANALYSING");
  
  try {
    const aiResponse = await aiProvider.analyse({
      title: workItem.title,
      description: workItem.description,
    });
    const validationResult = AnalysisSchema.safeParse(aiResponse);
    if (!validationResult.success) {
      throw new Error("Invalid AI response");
    }
    saveAnalysis(id, validationResult.data);

    return updateWorkItemStatus(id, "READY_FOR_REVIEW");
  } catch (error) {
    updateWorkItemStatus(id, "FAILED");
    throw error;
  }
};
