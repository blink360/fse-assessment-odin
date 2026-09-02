import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

const dataDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dataDirectory, "work-items.db");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new DatabaseSync(dbPath);

const workItems = [
  {
    externalId: "EXT-1001",
    title: "Missing proof of address",
    description:
      "The applicant has not provided a valid proof of address for the application.",
    status: "RECEIVED",
  },
  {
    externalId: "EXT-1002",
    title: "Income verification required",
    description:
      "Additional income documents are required before the application can be processed.",
    status: "RECEIVED",
  },
  {
    externalId: "EXT-1003",
    title: "Incorrect identity document",
    description:
      "The submitted identity document appears to be expired and needs to be replaced.",
    status: "RECEIVED",
  },
  {
    externalId: "EXT-1004",
    title: "Bank statement review",
    description:
      "Recent bank statements need to be reviewed to verify the applicant's financial information.",
    status: "ANALYSING",
  },
  {
    externalId: "EXT-1005",
    title: "Employment information mismatch",
    description:
      "The employment information submitted by the applicant does not match the information in the external system.",
    status: "ANALYSING",
  },
  {
    externalId: "EXT-1006",
    title: "Tax document verification",
    description:
      "The latest tax document requires verification against the applicant's submitted information.",
    status: "READY_FOR_REVIEW",
    category: "DOCUMENT_VERIFICATION",
    priority: "HIGH",
    summary:
      "The submitted tax document requires manual verification before the application can proceed.",
    recommendedAction:
      "Review the tax document and compare the reported information with the application.",
  },
  {
    externalId: "EXT-1007",
    title: "Address change request",
    description:
      "The applicant has requested an address change and submitted supporting documentation.",
    status: "READY_FOR_REVIEW",
    category: "ADDRESS_UPDATE",
    priority: "MEDIUM",
    summary:
      "The applicant has requested an address update with supporting documentation.",
    recommendedAction:
      "Verify the supporting document and approve the address change if valid.",
  },
  {
    externalId: "EXT-1008",
    title: "Duplicate application detected",
    description:
      "A potential duplicate application was detected for the same applicant.",
    status: "READY_FOR_REVIEW",
    category: "DUPLICATE_APPLICATION",
    priority: "HIGH",
    summary: "A potential duplicate application requires manual investigation.",
    recommendedAction:
      "Compare the applications and determine whether one should be rejected as a duplicate.",
  },
  {
    externalId: "EXT-1009",
    title: "Contact information update",
    description:
      "The applicant has requested an update to their phone number and email address.",
    status: "COMPLETED",
    category: "PROFILE_UPDATE",
    priority: "LOW",
    summary: "The applicant requested an update to their contact information.",
    recommendedAction: "Verify the request and update the applicant profile.",
  },
  {
    externalId: "EXT-1010",
    title: "Completed document request",
    description:
      "The applicant has successfully submitted the previously requested document.",
    status: "COMPLETED",
    category: "DOCUMENT_REQUEST",
    priority: "MEDIUM",
    summary: "The previously missing document has been successfully submitted.",
    recommendedAction:
      "Verify the document and continue processing the application.",
  },
  {
    externalId: "EXT-1011",
    title: "Application information correction",
    description:
      "The applicant requested correction of incorrect personal information.",
    status: "COMPLETED",
    category: "DATA_CORRECTION",
    priority: "MEDIUM",
    summary:
      "The applicant requested a correction to their personal information.",
    recommendedAction:
      "Verify the corrected information and update the application.",
  },
  {
    externalId: "EXT-1012",
    title: "Unreadable uploaded document",
    description:
      "The uploaded document could not be processed because the file was unreadable.",
    status: "FAILED",
  },
  {
    externalId: "EXT-1013",
    title: "Unsupported document format",
    description:
      "The submitted document uses a file format that could not be processed.",
    status: "FAILED",
  },
  {
    externalId: "EXT-1014",
    title: "AI analysis timeout",
    description:
      "The work item could not be analysed because the AI analysis request timed out.",
    status: "FAILED",
  },
  {
    externalId: "EXT-1015",
    title: "Missing applicant information",
    description:
      "The work item contains insufficient information to determine the appropriate action.",
    status: "RECEIVED",
  },
];

const insert = db.prepare(`
  INSERT INTO work_items (
    id,
    external_id,
    title,
    description,
    status,
    category,
    priority,
    summary,
    recommended_action,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const item of workItems) {
  const now = new Date().toISOString();

  insert.run(
    randomUUID(),
    item.externalId,
    item.title,
    item.description,
    item.status,
    item.category ?? null,
    item.priority ?? null,
    item.summary ?? null,
    item.recommendedAction ?? null,
    now,
    now,
  );
}

console.log(`Seeded ${workItems.length} work items.`);

db.close();
