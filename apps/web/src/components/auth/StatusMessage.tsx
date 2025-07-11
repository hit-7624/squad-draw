import { StatusMessageProps } from "./auth.types";

export const StatusMessage = ({ message, type }: StatusMessageProps) => {
  const baseClasses = "p-3 text-base rounded-lg";
  const typeClasses = type === 'success' 
    ? "text-green-300 bg-green-900/20 border border-green-500/30"
    : "text-red-300 bg-red-900/20 border border-red-500/30";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
    </div>
  );
}; 