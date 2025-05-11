import { z } from "zod";
import { NewsFormProps } from "./models";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const newsSchema = z.object({
  label: z.string().min(3, {
    message: "Le libellé doit être au moins 3 caractères",
  }),
  type: z
    .string()
    .min(3, {
      message: "Le type doit être au moins 3 caractères",
    })
    .max(10, {
      message: "Le type ne peut pas excéder 30 caractères",
    }),
  eventDate: z.coerce.date(),
  description: z
    .string()
    .min(10, {
      message: "La description doit être au moins 10 caractères",
    })
    .max(150, {
      message: "La description ne peut pas excéder 150 caractères",
    }),
  content: z.string().min(100, {
    message: "Le contenu doit être au moins 100 caractères",
  }),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export default function NewsForm({
  news,
  mode = "new",
  onClose,
  onSuccess,
}: NewsFormProps) {
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      label: "",
      type: "",
      eventDate: new Date(),
      description: "",
      content: "",
    },
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (news) {
      form.reset({
        label: news.label,
        type: news.type,
        eventDate: news.eventDate,
        description: news.description,
        content: news.content,
      });
    }
  }, [news, form]);

  const onSubmit = (): void => {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Entrer le titre"
                  disabled={mode === "view"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
