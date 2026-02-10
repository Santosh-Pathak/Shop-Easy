'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface OptionType {
  id: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  options: OptionType[];
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select...',
  className,
  disabled = false,
  options,
}) => {
  const [open, setOpen] = useState(false);

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => a.label.localeCompare(b.label));
  }, [options]);

  const selectedOption = useMemo(() => {
    return sortedOptions.find(
      (option) =>
        option.id.toLowerCase() === value?.toLowerCase() ||
        option.label.toLowerCase() === value?.toLowerCase()
    );
  }, [value, sortedOptions]);

  const handleSelect = useCallback(
    (selectedLabel: string) => {
      const selected = sortedOptions.find((opt) => opt.label === selectedLabel);
      if (selected && onValueChange) {
        onValueChange(selected.id);
      }
      setOpen(false);
    },
    [onValueChange, sortedOptions]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !selectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No result found.</CommandEmpty>
            <CommandGroup>
              {sortedOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  onSelect={handleSelect}
                  className="flex items-center gap-2"
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selectedOption?.id === option.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CustomSelect;
