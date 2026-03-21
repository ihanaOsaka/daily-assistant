type Status = "pending" | "processing" | "completed" | "failed";

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  pending: {
    label: "待機中",
    className: "bg-gray-700 text-gray-300",
  },
  processing: {
    label: "処理中",
    className: "bg-blue-900 text-blue-300",
  },
  completed: {
    label: "完了",
    className: "bg-green-900 text-green-300",
  },
  failed: {
    label: "失敗",
    className: "bg-red-900 text-red-300",
  },
};

interface StatusBadgeProps {
  status: Status | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as Status] ?? {
    label: status,
    className: "bg-gray-700 text-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
