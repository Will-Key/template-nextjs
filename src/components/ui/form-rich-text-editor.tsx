"use client";

import * as React from "react";
import { useController, useFormContext } from "react-hook-form";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

interface FormRichTextEditorProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
}

export function FormRichTextEditor({
  name,
  label,
  description,
  placeholder = "Write something...",
  className,
}: FormRichTextEditorProps) {
  const { control } = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: "",
  });

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <RichTextEditor
          value={field.value || ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error.message}</FormMessage>}
    </FormItem>
  );
}
