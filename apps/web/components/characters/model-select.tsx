import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/src/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";

export const ModelSelect = ({ form, model }: { form: any; model: string }) => {
  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>AI Model</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value ? field.value : model}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an AI model for character." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="mistral-small">
                Mistral Small - Faster response, provided by Mistral AI
              </SelectItem>
              <SelectItem value="mistral-medium">
                Mistral Medium - Accurate response, provided by Mistral AI
              </SelectItem>
              <SelectItem value="gpt-3.5-turbo-1106">
                GPT-3.5 Turbo - Capable of generating realistic text, 16,384
                Context Length, provided by OpenAI
              </SelectItem>
              <SelectItem value="gpt-4-1106-preview">
                GPT-4 Turbo - Capable of generating realistic text, 32,768
                Context Length, provided by OpenAI
              </SelectItem>
              <SelectItem value="pplx-7b-online">
                Perplexity 7B Online - Latest Internet Knowledge, Faster
                response, 4096 Context Length, provided by Perplexity AI
              </SelectItem>
              <SelectItem value="pplx-70b-online">
                Perplexity 70B Online - Latest Internet Knowledge, Faster
                response, 4096 Context Length, provided by Perplexity AI
              </SelectItem>
              <SelectItem value="pplx-7b-chat">
                Perplexity 7B Chat - Optimized for Knowledge, Faster response,
                8192 Context Length, provided by Perplexity AI
              </SelectItem>
              <SelectItem value="pplx-70b-chat">
                Perplexity 70B Chat - Optimized for Knowledge, Faster response,
                4096 Context Length, provided by Perplexity AI
              </SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Customize the AI model for your characters. Each model has unique
            performance characteristics, response speeds, and conversation
            domains.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
