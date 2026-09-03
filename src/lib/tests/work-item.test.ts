import { beforeEach, describe, expect, it } from "vitest";

import db from "../db";

import {
  createWorkItem,
  getWorkItemById,
  getWorkItems,
  updateWorkItemStatus,
  saveAnalysis,
} from "../services/api/work-item-service";

import {
  analyseWorkItem,
  retryAnalyseWorkItem,
} from "../services/api/work-item-analysis-service";

import { MockAIProvider } from "../ai/mock-ai-provider";

import { canTransition } from "../utils/work-item-state";

describe("Work Item System", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM work_items").run();
  });

  // =====================================================
  // BASIC WORK ITEM TESTS
  // =====================================================

  describe("Work Item CRUD", () => {
    it("should create a work item with RECEIVED status", () => {
      const workItem = createWorkItem({
        externalId: "CRM-12345",
        title: "Missing income document",
        description: "The applicant has not provided their latest payslip.",
      });

      expect(workItem).toBeDefined();
      expect(workItem.id).toBeDefined();

      expect(workItem.externalId).toBe("CRM-12345");
      expect(workItem.title).toBe("Missing income document");

      expect(workItem.status).toBe("RECEIVED");

      expect(workItem.category).toBeNull();
      expect(workItem.priority).toBeNull();
      expect(workItem.summary).toBeNull();
      expect(workItem.recommendedAction).toBeNull();
    });

    it("should retrieve all work items", () => {
      createWorkItem({
        externalId: "CRM-001",
        title: "First item",
        description: "First description",
      });

      createWorkItem({
        externalId: "CRM-002",
        title: "Second item",
        description: "Second description",
      });

      const workItems = getWorkItems();

      expect(workItems).toHaveLength(2);
    });

    it("should retrieve a work item by id", () => {
      const created = createWorkItem({
        externalId: "CRM-003",
        title: "Test item",
        description: "Test description",
      });

      const found = getWorkItemById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.externalId).toBe("CRM-003");
    });
  });

  // =====================================================
  // DUPLICATE TEST
  // =====================================================

  describe("Duplicate handling", () => {
    it("should reject duplicate externalId values", () => {
      createWorkItem({
        externalId: "CRM-DUPLICATE",
        title: "First item",
        description: "First description",
      });

      expect(() => {
        createWorkItem({
          externalId: "CRM-DUPLICATE",
          title: "Second item",
          description: "Second description",
        });
      }).toThrow();

      const workItems = getWorkItems();

      expect(workItems).toHaveLength(1);
    });
  });

  // =====================================================
  // STATE MACHINE TESTS
  // =====================================================

  describe("State machine", () => {
    it("should allow RECEIVED → ANALYSING", () => {
      expect(canTransition("RECEIVED", "ANALYSING")).toBe(true);
    });

    it("should allow ANALYSING → READY_FOR_REVIEW", () => {
      expect(canTransition("ANALYSING", "READY_FOR_REVIEW")).toBe(true);
    });

    it("should allow ANALYSING → FAILED", () => {
      expect(canTransition("ANALYSING", "FAILED")).toBe(true);
    });

    it("should allow READY_FOR_REVIEW → COMPLETED", () => {
      expect(canTransition("READY_FOR_REVIEW", "COMPLETED")).toBe(true);
    });

    it("should allow FAILED → ANALYSING", () => {
      expect(canTransition("FAILED", "ANALYSING")).toBe(true);
    });

    it("should reject RECEIVED → COMPLETED", () => {
      expect(canTransition("RECEIVED", "COMPLETED")).toBe(false);
    });

    it("should reject COMPLETED → ANALYSING", () => {
      expect(canTransition("COMPLETED", "ANALYSING")).toBe(false);
    });

    it("should reject READY_FOR_REVIEW → ANALYSING", () => {
      expect(canTransition("READY_FOR_REVIEW", "ANALYSING")).toBe(false);
    });
  });

  // =====================================================
  // STATUS TESTS
  // =====================================================

  describe("Status updates", () => {
    it("should allow a valid status transition", () => {
      const workItem = createWorkItem({
        externalId: "CRM-STATUS-001",
        title: "Test item",
        description: "Test description",
      });

      const updated = updateWorkItemStatus(workItem.id, "ANALYSING");

      expect(updated.status).toBe("ANALYSING");
    });

    it("should reject an invalid status transition", () => {
      const workItem = createWorkItem({
        externalId: "CRM-STATUS-002",
        title: "Test item",
        description: "Test description",
      });

      expect(() => {
        updateWorkItemStatus(workItem.id, "COMPLETED");
      }).toThrow("Invalid status transition: RECEIVED → COMPLETED");

      const unchanged = getWorkItemById(workItem.id);

      expect(unchanged?.status).toBe("RECEIVED");
    });
  });

  // =====================================================
  // AI ANALYSIS TESTS
  // =====================================================

  describe("AI Analysis", () => {
    it("should successfully analyse a work item", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-AI-001",
        title: "Missing income document",
        description: "The applicant has not provided their latest payslip.",
      });

      const result = await analyseWorkItem(workItem.id, new MockAIProvider());

      expect(result.status).toBe("READY_FOR_REVIEW");

      expect(result.category).toBe("DOCUMENT_REQUEST");

      expect(result.priority).toBe("HIGH");

      expect(result.summary).toContain("Missing income document");

      expect(result.recommendedAction).toBe(
        "Request the missing document from the applicant.",
      );
    });

    it("should persist AI analysis in the database", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-AI-002",
        title: "Missing payslip",
        description: "Payslip is missing.",
      });

      await analyseWorkItem(workItem.id, new MockAIProvider());

      const saved = getWorkItemById(workItem.id);

      expect(saved).not.toBeNull();

      expect(saved?.category).toBe("DOCUMENT_REQUEST");

      expect(saved?.priority).toBe("HIGH");

      expect(saved?.summary).toContain("Missing payslip");

      expect(saved?.recommendedAction).toBe(
        "Request the missing document from the applicant.",
      );

      expect(saved?.status).toBe("READY_FOR_REVIEW");
    });

    it("should not allow analysis of an already analysed work item", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-AI-003",
        title: "Test item",
        description: "Test description.",
      });

      await analyseWorkItem(workItem.id, new MockAIProvider());

      await expect(
        analyseWorkItem(workItem.id, new MockAIProvider()),
      ).rejects.toThrow(
        "Work item cannot be analysed from status: READY_FOR_REVIEW",
      );
    });

    it("should mark the work item as FAILED when the AI provider fails", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-AI-004",
        title: "AI failure test",
        description: "This should fail.",
      });

      const failingProvider = {
        analyse: async () => {
          throw new Error("AI provider timeout");
        },
      };

      await expect(
        analyseWorkItem(workItem.id, failingProvider),
      ).rejects.toThrow("AI provider timeout");

      const failed = getWorkItemById(workItem.id);

      expect(failed?.status).toBe("FAILED");

      expect(failed?.category).toBeNull();
      expect(failed?.priority).toBeNull();
      expect(failed?.summary).toBeNull();
      expect(failed?.recommendedAction).toBeNull();
    });

    it("should mark the work item as FAILED when the AI response is invalid", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-AI-005",
        title: "Invalid AI response test",
        description: "Testing malformed AI output.",
      });

      const invalidProvider = {
        analyse: async () => {
          return {
            category: "DOCUMENT_REQUEST",
            priority: "SUPER_HIGH",
            summary: "",
            recommendedAction: 123,
          };
        },
      };

      await expect(
        analyseWorkItem(workItem.id, invalidProvider as any),
      ).rejects.toThrow("Invalid AI response");

      const failed = getWorkItemById(workItem.id);

      expect(failed?.status).toBe("FAILED");

      // Invalid AI data must NOT be persisted.
      expect(failed?.category).toBeNull();
      expect(failed?.priority).toBeNull();
      expect(failed?.summary).toBeNull();
      expect(failed?.recommendedAction).toBeNull();
    });
  });

  // =====================================================
  // RETRY TESTS
  // =====================================================

  describe("AI Retry", () => {
    it("should allow a FAILED work item to be retried", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-RETRY-001",
        title: "Retry test",
        description: "Testing retry.",
      });

      const failingProvider = {
        analyse: async () => {
          throw new Error("AI timeout");
        },
      };

      // First analysis fails.
      await expect(
        analyseWorkItem(workItem.id, failingProvider),
      ).rejects.toThrow("AI timeout");

      expect(getWorkItemById(workItem.id)?.status).toBe("FAILED");

      // Retry with a successful provider.
      const retryResult = await retryAnalyseWorkItem(
        workItem.id,
        new MockAIProvider(),
      );

      expect(retryResult.status).toBe("READY_FOR_REVIEW");

      expect(retryResult.category).toBe("DOCUMENT_REQUEST");

      expect(retryResult.priority).toBe("HIGH");
    });

    it("should reject retry when the work item is not FAILED", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-RETRY-002",
        title: "Not failed",
        description: "This item has not failed.",
      });

      await expect(
        retryAnalyseWorkItem(workItem.id, new MockAIProvider()),
      ).rejects.toThrow("Work item cannot be retried from status: RECEIVED");
    });

    it("should mark the work item as FAILED if the retry AI call fails", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-RETRY-003",
        title: "Retry failure",
        description: "Retry should fail.",
      });

      const failingProvider = {
        analyse: async () => {
          throw new Error("Retry AI failure");
        },
      };

      // First attempt fails.
      await expect(
        analyseWorkItem(workItem.id, failingProvider),
      ).rejects.toThrow("Retry AI failure");

      expect(getWorkItemById(workItem.id)?.status).toBe("FAILED");

      // Retry also fails.
      await expect(
        retryAnalyseWorkItem(workItem.id, failingProvider),
      ).rejects.toThrow("Retry AI failure");

      expect(getWorkItemById(workItem.id)?.status).toBe("FAILED");
    });
  });

  // =====================================================
  // COMPLETION TESTS
  // =====================================================

  describe("Completion", () => {
    it("should allow READY_FOR_REVIEW → COMPLETED", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-COMPLETE-001",
        title: "Missing income document",
        description: "Missing payslip.",
      });

      await analyseWorkItem(workItem.id, new MockAIProvider());

      const completed = updateWorkItemStatus(workItem.id, "COMPLETED");

      expect(completed.status).toBe("COMPLETED");
    });

    it("should not allow RECEIVED → COMPLETED", () => {
      const workItem = createWorkItem({
        externalId: "CRM-COMPLETE-002",
        title: "Not analysed",
        description: "Not analysed yet.",
      });

      expect(() => {
        updateWorkItemStatus(workItem.id, "COMPLETED");
      }).toThrow("Invalid status transition: RECEIVED → COMPLETED");
    });

    it("should not allow FAILED → COMPLETED", async () => {
      const workItem = createWorkItem({
        externalId: "CRM-COMPLETE-003",
        title: "Failed item",
        description: "AI failure.",
      });

      const failingProvider = {
        analyse: async () => {
          throw new Error("AI failure");
        },
      };

      await expect(
        analyseWorkItem(workItem.id, failingProvider),
      ).rejects.toThrow("AI failure");

      expect(getWorkItemById(workItem.id)?.status).toBe("FAILED");

      expect(() => {
        updateWorkItemStatus(workItem.id, "COMPLETED");
      }).toThrow("Invalid status transition: FAILED → COMPLETED");
    });
  });
});
