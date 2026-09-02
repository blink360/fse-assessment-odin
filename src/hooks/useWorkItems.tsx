"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    analyseWorkItem,
    createWorkItem,
    fetchWorkItem,
    fetchWorkItems,
    retryWorkItem,
    updateWorkItemStatus,
} from "../lib/services/fe/work-item-service";

import {
    CreateWorkItemInput,
    WorkItemStatus,
} from "../lib/types/work-item";

export const workItemKeys = {
    all: ["work-items"] as const,

    detail: (id: string) =>
        ["work-items", id] as const,
};

export const useWorkItems = () => {
    return useQuery({
        queryKey: workItemKeys.all,
        queryFn: fetchWorkItems,
    });
};

export const useWorkItem = (id: string) => {
    return useQuery({
        queryKey: workItemKeys.detail(id),
        queryFn: () => fetchWorkItem(id),
        enabled: Boolean(id),
    });
};

export const useCreateWorkItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateWorkItemInput) =>
            createWorkItem(input),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workItemKeys.all,
            });
        },
    });
};

export const useAnalyseWorkItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            analyseWorkItem(id),

        onSuccess: (workItem) => {
            queryClient.setQueryData(
                workItemKeys.detail(workItem.id),
                workItem,
            );

            queryClient.invalidateQueries({
                queryKey: workItemKeys.all,
            });
        },
    });
};

export const useRetryWorkItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            retryWorkItem(id),

        onSuccess: (workItem) => {
            queryClient.setQueryData(
                workItemKeys.detail(workItem.id),
                workItem,
            );

            queryClient.invalidateQueries({
                queryKey: workItemKeys.all,
            });
        },
    });
};

export const useUpdateWorkItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: WorkItemStatus;
        }) => updateWorkItemStatus(id, status),

        onSuccess: (workItem) => {
            queryClient.setQueryData(
                workItemKeys.detail(workItem.id),
                workItem,
            );

            queryClient.invalidateQueries({
                queryKey: workItemKeys.all,
            });
        },
    });
};