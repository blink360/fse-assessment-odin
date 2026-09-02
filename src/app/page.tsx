"use client";

import { useState } from "react";
import ItemList from "../components/_index/ItemList";
import {
    WORK_ITEM_STATUSES,
    WorkItemStatus,
} from "../lib/types/work-item";
import Modal from "../components/_index/common/Modal";
import { WorkItemForm } from "../components/_index/WorkItemForm";

const HomePage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [status, setStatus] =
        useState<WorkItemStatus | "ALL">("ALL");

    return (
        <main className="mx-auto max-w-4xl px-6 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Work Intake System
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Review and process incoming work items.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                   Create New Item
                </button>
            </div>
            <div className="mb-6">
                <label
                    htmlFor="status"
                    className="mr-3 text-sm font-medium"
                >
                    Filter by status:
                </label>

                <select
                    id="status"
                    value={status}
                    onChange={(event) =>
                        setStatus(
                            event.target.value as
                            | WorkItemStatus
                            | "ALL",
                        )
                    }
                    className="rounded-lg border px-3 py-2"
                >
                    <option value="ALL">All</option>

                    {WORK_ITEM_STATUSES.map(
                        (workItemStatus) => (
                            <option
                                key={workItemStatus}
                                value={workItemStatus}
                            >
                                {workItemStatus.replaceAll("_", " ")}
                            </option>
                        ),
                    )}
                </select>
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Work Item"
            >
                <WorkItemForm
                    onSuccess={() => setIsCreateModalOpen(false)}
                />
            </Modal>
            <ItemList
                status={
                    status === "ALL" ? undefined : status
                }
            />
        </main>
    );
}

export default HomePage;