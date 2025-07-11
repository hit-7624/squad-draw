interface StatusMessagesProps {
  error: string | null;
  success: string | null;
}

export const StatusMessages = ({ error, success }: StatusMessagesProps) => {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">✕</span>
            </div>
            <span className="text-base">{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-300">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className="text-base">{success}</span>
          </div>
        </div>
      )}
    </>
  );
}; 