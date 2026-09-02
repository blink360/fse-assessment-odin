"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkItems } from "../../../hooks/useWorkItems";
import { WorkItemStatus } from "../../../lib/types/work-item";
import ItemCard from "../ItemCard";
import Pagination from "../common/Pagination";

interface ItemListProps {
    status?: WorkItemStatus | "ALL";
}

const ITEMS_PER_PAGE = 5;

const ItemList = ({ status = "ALL" }: ItemListProps) => {
    const { data: workItems = [], isLoading, isError } = useWorkItems();

    const [currentPage, setCurrentPage] = useState(1);

    const filteredItems = useMemo(() => {
        if (status === "ALL") {
            return workItems;
        }

        return workItems.filter((item) => item.status === status);
    }, [workItems, status]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [status]);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (isLoading) {
        return (
            <div className="py-10 text-center text-gray-500">
                Loading work items...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-10 text-center text-red-600">
                Failed to load work items.
            </div>
        );
    }

    if (filteredItems.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
                No work items found.
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-4">
                {paginatedItems.map((workItem) => (
                    <ItemCard key={workItem.id} workItem={workItem} />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default ItemList;