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
import { useTranslation } from "react-i18next";
import useVoiceData from "../../app/lib/hooks/use-voice-data";

export const VoiceSelect = ({
  form,
  voiceId,
}: {
  form: any;
  voiceId: string;
}) => {
  const { t } = useTranslation();
  const voiceData = useVoiceData();
  return (
    <FormField
      control={form.control}
      name="voiceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("AI Voice")}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value ? field.value : voiceId}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an AI voice for character." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {voiceData && voiceData?.length > 0 ? (
                voiceData.map(
                  (voice: {
                    value: string;
                    description: string;
                    crystalPrice: number;
                  }) => (
                    <SelectItem value={voice.value}>
                      {voice.description} ({voice.crystalPrice}x Crystals per
                      message)
                    </SelectItem>
                  ),
                )
              ) : (
                <SelectItem value="openrouter/auto">Loading...</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
