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
import Link from "next/link";
import { useTranslation } from "react-i18next";

const modelData = [
  {
    value: "gpt-3.5-turbo-1106",
    description: "GPT-3.5 Turbo by OpenAI",
  },
  {
    value: "gpt-4-1106-preview",
    description: "GPT-4 Turbo by OpenAI",
  },
  {
    value: "mistral-small",
    description: "Mistral Small by Mistral AI",
  },
  {
    value: "mistral-medium",
    description: "Mistral Medium by Mistral AI",
  },
  {
    value: "pplx-70b-online",
    description: "Perplexity 70B Online by Perplexity AI",
  },
  {
    value: "pplx-70b-chat",
    description: "Perplexity 70B Chat by Perplexity AI",
  },
  {
    value: "google/gemini-pro",
    description: "Gemini Pro by Google",
  },
  {
    value: "anthropic/claude-instant-v1",
    description: "Claude Instant by Anthropic",
  },
  {
    value: "anthropic/claude-2",
    description: "Claude 2 by Anthropic",
  },
  {
    value: "neversleep/noromaid-mixtral-8x7b-instruct",
    description: "Uncensored, Noromaid 8x7B by Never Sleep",
  },
  {
    value: "neversleep/noromaid-20b",
    description: "Uncensored, Noromaid 20B by Never Sleep",
  },
  {
    value: "cognitivecomputations/dolphin-mixtral-8x7b",
    description: "Uncensored, Dolphin Mixtral 8x7B by Eric Hartford",
  },
  {
    value: "nousresearch/nous-capybara-7b",
    description: "Copybara 7B by Nous Research",
  },
  {
    value: "mistralai/mistral-7b-instruct",
    description: "Mistral 7B by Mistral AI",
  },
  {
    value: "huggingfaceh4/zephyr-7b-beta",
    description: "Zephyr 7B by Hugging Face",
  },
  {
    value: "openchat/openchat-7b",
    description: "Openchat 7B by Open Chat",
  },
  {
    value: "gryphe/mythomist-7b",
    description: "Mythomist 7B by Gryphe",
  },
  {
    value: "openrouter/cinematika-7b",
    description: "Cinematika 7B by Open Router",
  },
  {
    value: "nousresearch/nous-hermes-llama2-13b",
    description: "LLama2 13B by Nous Research",
  },
  {
    value: "austism/chronos-hermes-13b",
    description: "Chronos Hermes by Austism",
  },
  {
    value: "jebcarter/psyfighter-13b",
    description: "Psyfighter 13B by Jeb Carter",
  },
  {
    value: "koboldai/psyfighter-13b-2",
    description: "Psyfighter 13B 2 by Kobold AI",
  },
  {
    value: "meta-llama/codellama-34b-instruct",
    description: "CodeLlama2 34B by Meta Llama",
  },
  {
    value: "phind/phind-codellama-34b",
    description: "Phind CodeLlama2 34B by Phind",
  },
  {
    value: "intel/neural-chat-7b",
    description: "Neural Chat 7B by Intel",
  },
  {
    value: "mistralai/mixtral-8x7b-instruct",
    description: "Mixtral 8x7B by Mistral AI",
  },
  {
    value: "meta-llama/llama-2-13b-chat",
    description: "Llama 2 13B by Meta Llama",
  },
  {
    value: "meta-llama/llama-2-70b-chat",
    description: "Llama 2 70B by Meta Llama",
  },
  {
    value: "nousresearch/nous-hermes-llama2-70b",
    description: "Llama 2 70B by Nous Research",
  },
  {
    value: "nousresearch/nous-capybara-34b",
    description: "Copybara 34B by Nous Research",
  },
  {
    value: "gryphe/mythomax-l2-13b-8k",
    description: "Mythomax L2 13B by Gryphe",
  },
  {
    value: "jondurbin/airoboros-l2-70b",
    description: "Airobos L2 70B by Jon Durbin",
  },
  {
    value: "teknium/openhermes-2-mistral-7b",
    description: "Openhermes 2 7B by Teknium",
  },
  {
    value: "migtissera/synthia-70b",
    description: "Synthia 70B by Migtissera",
  },
  {
    value: "haotian-liu/llava-13b",
    description: "Llava 13B by Haotian Liu",
  },
  {
    value: "nousresearch/nous-hermes-2-vision-7b",
    description: "Hermes 2 Vision 7B by Nous Research",
  },
];

export const ModelSelect = ({ form, model }: { form: any; model: string }) => {
  const { t } = useTranslation();
  return (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("AI Model")}</FormLabel>
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
              {modelData.map((model) => (
                <SelectItem value={model.value}>{model.description}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Customize the AI model for your characters. Each model has unique
            characteristics, response speeds, and conversation domains.{" "}
            <Link
              href="/models"
              className="underline duration-200 hover:opacity-50"
            >
              Test your model here.
            </Link>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
