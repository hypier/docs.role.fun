import { internalAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const convertTextToSpeech = internalAction(
  async (
    ctx,
    {
      userId,
      voiceId = "MjxppkSa4IoDSRGySayZ",
      speechId,
      messageId,
      text,
    }: {
      userId: Id<"users">;
      voiceId: string;
      speechId: Id<"speeches">;
      messageId: Id<"messages">;
      text: string;
    },
  ) => {
    const apiKey = process.env.ELEVEN_LABS_API_KEY;

    const headers = new Headers();
    headers.append("Accept", "audio/mpeg");
    headers.append("Content-Type", "application/json");
    headers.append("xi-api-key", apiKey as string);

    const { currentCrystals } = await ctx.runMutation(
      internal.serve.useCrystal,
      {
        userId,
        name: voiceId,
      },
    );

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
          }),
        },
      );

      if (
        !response.ok ||
        response.headers.get("Content-Type") !== "audio/mpeg"
      ) {
        throw new Error("Invalid audio file response");
      }

      const audioData = await response.arrayBuffer();
      const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
      const speechStorageId = await ctx.storage.store(audioBlob as Blob);
      await ctx.runMutation(internal.speeches.uploadSpeech, {
        speechId,
        messageId,
        speechStorageId,
      });
    } catch (error) {
      console.log("error:::", error);
      await ctx.runMutation(internal.serve.refundCrystal, {
        userId,
        currentCrystals,
        name: voiceId,
      });
      throw Error;
    }
  },
);
