interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl bg-blue-600 px-4 py-2.5 text-sm text-white">
        {content}
      </div>
    </div>
  );
}
