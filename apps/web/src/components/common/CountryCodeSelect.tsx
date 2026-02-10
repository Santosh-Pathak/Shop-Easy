'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState } from 'react';
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

// Create a list of country calling codes with country names
const countryOptions = countries
  .filter((country) => country.idd?.root && country.idd?.suffixes?.length > 0)
  .flatMap((country) =>
    country.idd.suffixes!.map((suffix) => ({
      code: `${country.idd.root}${suffix}`,
      name: country.name.common,
      flag: country.flag,
      cca2: country.cca2,
    }))
  )
  .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

interface CountryCodeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select country code',
  className,
}) => {
  const [open, setOpen] = useState(false);

  const selectedCountry = countryOptions.find(
    (country) => country.code === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between border-blue-200 focus:border-blue-400 focus:ring-blue-200',
            className
          )}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="font-mono">{selectedCountry.code}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] border border-blue-200 bg-white p-0 shadow-xl">
        <Command>
          <CommandInput
            placeholder="Search country..."
            className="border-0 focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryOptions.map((country) => (
                <CommandItem
                  key={`${country.cca2}-${country.code}`}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => {
                    onValueChange(country.code);
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-blue-50"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="flex flex-1 items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="font-mono text-sm text-gray-500">
                      {country.code}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryCodeSelect;
