const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待機中', className: 'bg-zinc-700 text-zinc-300' },
  processing: { label: '実行中', className: 'bg-blue-900 text-blue-300' },
  completed: { label: '完了', className: 'bg-green-900 text-green-300' },
  failed: { label: '失敗', className: 'bg-red-900 text-red-300' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
