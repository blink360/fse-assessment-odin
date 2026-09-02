import { WorkItem } from "../../../../lib/types/work-item";

interface AnalysisResultProps {
    workItem: WorkItem;
}

const AnalysisResult = ({
    workItem,
}: AnalysisResultProps) => {
    if (!workItem.summary) {
        return null;
    }

    return (
        <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
            <div>
                <p className="text-sm font-medium text-gray-500">
                    Category
                </p>

                <p>{workItem.category}</p>
            </div>

            <div>
                <p className="text-sm font-medium text-gray-500">
                    Priority
                </p>

                <p>{workItem.priority}</p>
            </div>

            <div>
                <p className="text-sm font-medium text-gray-500">
                    Summary
                </p>

                <p>{workItem.summary}</p>
            </div>

            <div>
                <p className="text-sm font-medium text-gray-500">
                    Recommended Action
                </p>

                <p>{workItem.recommendedAction}</p>
            </div>
        </div>
    );
};

export default AnalysisResult;