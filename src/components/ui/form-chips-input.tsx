"use client";

import * as React from "react";
import { useController, useFormContext } from "react-hook-form";
import { ChipsInput } from "@/components/ui/chips-input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

interface FormChipsInputProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormChipsInput({
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
}: FormChipsInputProps) {
  const { control } = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <ChipsInput
          value={field.value || []}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          placeholder={placeholder}
          disabled={disabled}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error.message}</FormMessage>}
    </FormItem>
  );
}
