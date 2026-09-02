import { WorkItemStatus } from "../../../../lib/types/work-item";

interface StatusBadgeProps {
    status: WorkItemStatus;
}

const StatusBadge = ({
    status,
}: StatusBadgeProps) => {
    return (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
            {status.replaceAll("_", " ")}
        </span>
    );
};

export default StatusBadge;