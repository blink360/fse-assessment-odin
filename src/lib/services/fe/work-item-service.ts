import {
  CreateWorkItemInput,
  WorkItem,
  WorkItemStatus,
} from "../../types/work-item";

const API_BASE_URL = "/api/";

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};

export const fetchWorkItems = async (): Promise<WorkItem[]> => {
  const response = await fetch(API_BASE_URL);

  return handleResponse<WorkItem[]>(response);
};

export const fetchWorkItem = async (id: string): Promise<WorkItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  return handleResponse<WorkItem>(response);
};

export const createWorkItem = async (
  input: CreateWorkItemInput,
): Promise<WorkItem> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<WorkItem>(response);
};

export const analyseWorkItem = async (id: string): Promise<WorkItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}/analyze`, {
    method: "POST",
  });

  return handleResponse<WorkItem>(response);
};

export const retryWorkItem = async (id: string): Promise<WorkItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}/retry`, {
    method: "POST",
  });

  return handleResponse<WorkItem>(response);
};

export const updateWorkItemStatus = async (
  id: string,
  status: WorkItemStatus,
): Promise<WorkItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return handleResponse<WorkItem>(response);
};
