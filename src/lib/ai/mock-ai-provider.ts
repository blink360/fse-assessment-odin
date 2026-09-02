import { Priority } from "../types/work-item";

export interface AnalysisResult {
  category: string;
  priority: Priority;
  summary: string;
  recommendedAction: string;
}

export interface AIProvider {
  analyse(input: {
    title: string;
    description: string;
  }): Promise<AnalysisResult>;
}

export class MockAIProvider implements AIProvider {
  async analyse(input: {
    title: string;
    description: string;
  }): Promise<AnalysisResult> {
    return {
      category: "DOCUMENT_REQUEST",
      priority: "HIGH",
      summary: `The applicant needs to provide the requested document regarding: ${input.title}.`,
      recommendedAction: "Request the missing document from the applicant.",
    };
  }
}
