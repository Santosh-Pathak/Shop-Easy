import { useFormContext } from 'react-hook-form';
import { Control } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldWrapperProps } from '@/constants/interface.constant';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  name,
  label,
  placeholder,
  required = false,
  fieldType,
  type = 'text',
  rows = 3,
  options = [],
}) => {
  const { control } = useFormContext();

   
  const renderField = (field: any) => {
    switch (fieldType) {
      case 'input':
        return (
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
            className="border-gray-600 "
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            rows={rows}
            {...field}
            className="border-gray-600 "
          />
        );
      case 'select':
        return (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="border-gray-600 ">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <FormField
      control={control as Control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <FormControl>{renderField(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
