'use client';

import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: { startDate: Date; endDate: Date }) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangePickerProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const presets = [
    {
      label: 'Last 7 days',
      getValue: () => ({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 90 days',
      getValue: () => ({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }),
    },
  ];

  return (
    <div className={cn('flex gap-2', className)}>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => onChange(preset.getValue())}
        >
          {preset.label}
        </Button>
      ))}
      <div className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md">
        <span className="text-muted-foreground">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
      </div>
    </div>
  );
}
