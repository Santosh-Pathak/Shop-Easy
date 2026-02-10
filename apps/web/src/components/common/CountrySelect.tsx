'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import countries from 'world-countries';

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

interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface CountryOption {
  name: string;
  code: string;
  flag: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select country...',
  className,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  // Transform world-countries data to our format
  const countryOptions: CountryOption[] = useMemo(() => {
    return countries
      .map((country) => ({
        name: country.name.common,
        code: country.cca2,
        flag: country.flag,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Find selected country
  const selectedCountry = useMemo(() => {
    if (!value) return null;
    return countryOptions.find(
      (country) =>
        country.name.toLowerCase() === value.toLowerCase() ||
        country.code.toLowerCase() === value.toLowerCase()
    );
  }, [value, countryOptions]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      const country = countryOptions.find((c) => c.name === selectedValue);
      if (country && onValueChange) {
        onValueChange(country.name);
      }
      setOpen(false);
    },
    [countryOptions, onValueChange]
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
            !selectedCountry && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="truncate">{selectedCountry.name}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryOptions.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={handleSelect}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selectedCountry?.name === country.name
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

export default CountrySelect;
