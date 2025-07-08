import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FormFieldProps } from "./auth.types";

export const FormField = ({ 
  id, 
  label, 
  type, 
  placeholder, 
  register, 
  error, 
  helpText 
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base text-font-1">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register}
        className={`bg-bg-2 text-font-1 border-border-1 placeholder:text-font-2 focus:border-custom text-base py-2 ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helpText && (
        <p className="text-sm text-font-2">{helpText}</p>
      )}
    </div>
  );
}; 