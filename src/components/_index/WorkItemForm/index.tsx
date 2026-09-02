"use client";

import { useForm } from "react-hook-form";
import { useCreateWorkItem } from "../../../hooks/useWorkItems";
import { CreateWorkItemInput } from "../../../lib/types/work-item";

interface WorkItemFormProps {
    onSuccess: () => void;
}

export const WorkItemForm = ({ onSuccess }: WorkItemFormProps) => {
    const createMutation = useCreateWorkItem();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateWorkItemInput>({
        defaultValues: {
            externalId: "",
            title: "",
            description: "",
        },
    });

    const onSubmit = async (data: CreateWorkItemInput) => {
        try {
            await createMutation.mutateAsync(data);

            reset();
            onSuccess();
        } catch {
            // Error is displayed below using mutation state.
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label
                    htmlFor="externalId"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                    External ID
                </label>

                <input
                    id="externalId"
                    type="text"
                    placeholder="e.g. EXT-1020"
                    {...register("externalId", {
                        required: "External ID is required",
                    })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                />

                {errors.externalId && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.externalId.message}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="title"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                    Title
                </label>

                <input
                    id="title"
                    type="text"
                    placeholder="Enter work item title"
                    {...register("title", {
                        required: "Title is required",
                    })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                />

                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="description"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the work item..."
                    {...register("description", {
                        required: "Description is required",
                    })}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                />

                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                    </p>
                )}
            </div>

            {createMutation.isError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createMutation.error instanceof Error
                        ? createMutation.error.message
                        : "Failed to create work item."}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                    {createMutation.isPending ? "Creating..." : "Create Work Item"}
                </button>
            </div>
        </form>
    );
};