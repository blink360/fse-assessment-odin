"use client";

import { WorkItem } from "../../../lib/types/work-item";
import {
    useAnalyseWorkItem,
    useRetryWorkItem,
    useUpdateWorkItemStatus,
} from "../../../hooks/useWorkItems";

import AnalysisResult from "./AnalysisResult";
import StatusBadge from "../common/StatusBadge";

interface ItemCardProps {
    workItem: WorkItem;
}

const ItemCard = ({
    workItem,
}: ItemCardProps) => {
    const analyseMutation = useAnalyseWorkItem();
    const retryMutation = useRetryWorkItem();
    const statusMutation = useUpdateWorkItemStatus();

    const isLoading =
        analyseMutation.isPending ||
        retryMutation.isPending ||
        statusMutation.isPending;

    const handleAnalyse = () => {
        analyseMutation.mutate(workItem.id);
    };

    const handleRetry = () => {
        retryMutation.mutate(workItem.id);
    };

    const handleComplete = () => {
        statusMutation.mutate({
            id: workItem.id,
            status: "COMPLETED",
        });
    };

    return (
        <article className="rounded-xl border p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">
                        {workItem.title}
                    </h2>

                    <p className="text-sm text-gray-500">
                        {workItem.externalId}
                    </p>
                </div>

                <StatusBadge status={workItem.status} />
            </div>

            <p className="mt-4 text-gray-700">
                {workItem.description}
            </p>

            <AnalysisResult workItem={workItem} />

            {workItem.status === "RECEIVED" && (
                <button
                    type="button"
                    onClick={handleAnalyse}
                    disabled={isLoading}
                    className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {analyseMutation.isPending
                        ? "Analysing..."
                        : "Analyse"}
                </button>
            )}

            {workItem.status === "FAILED" && (
                <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {retryMutation.isPending
                        ? "Retrying..."
                        : "Retry"}
                </button>
            )}

            {workItem.status === "READY_FOR_REVIEW" && (
                <button
                    type="button"
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {statusMutation.isPending
                        ? "Completing..."
                        : "Complete"}
                </button>
            )}

            {analyseMutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                    {analyseMutation.error.message}
                </p>
            )}

            {retryMutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                    {retryMutation.error.message}
                </p>
            )}

            {statusMutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                    {statusMutation.error.message}
                </p>
            )}
        </article>
    );
};

export default ItemCard;