"use node";
import Replicate from "replicate";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { STABILITY_AI_API_URL, getAPIKey, getBaseURL } from "./constants";
import { Buffer } from "buffer";
import { OpenAI } from "openai";

export const generate = internalAction(
  async (
    ctx,
    {
      userId,
      characterId,
      name,
      description,
    }: {
      userId: Id<"users">;
      characterId: Id<"characters">;
      name: string;
      description: string;
    },
  ) => {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      "Content-Type": "application/json",
    };

    const body = {
      steps: 40,
      width: 768,
      height: 1344,
      seed: 0,
      cfg_scale: 5,
      samples: 1,
      text_prompts: [
        {
          text: `${name}, ${description}`,
          weight: 1,
        },
      ],
    };

    const { currentCrystals } = await ctx.runMutation(
      internal.serve.useCrystal,
      {
        userId,
        name: "stable-diffusion-xl-1024-v1-0",
      },
    );

    const response = await fetch(STABILITY_AI_API_URL, {
      headers,
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await ctx.runMutation(internal.serve.refundCrystal, {
        userId,
        currentCrystals,
        name: "stable-diffusion-xl-1024-v1-0",
      });
      throw new Error(`Non-200 response: ${await response.text()}`);
    }

    // Store the image to Convex storage.
    const responseJSON = await response.json();

    const base64Data = responseJSON.artifacts[0].base64;
    const binaryData = Buffer.from(base64Data, "base64");
    const image = new Blob([binaryData], { type: "image/png" });

    // Update storage.store to accept whatever kind of Blob is returned from node-fetch
    const cardImageStorageId = await ctx.storage.store(image as Blob);

    // Write storageId as the body of the message to the Convex database.
    await ctx.runMutation(internal.characterCard.uploadImage, {
      characterId,
      cardImageStorageId,
    });
  },
);

export const generateWithDalle3 = internalAction(
  async (
    ctx,
    {
      userId,
      characterId,
      name,
      description,
    }: {
      userId: Id<"users">;
      characterId: Id<"characters">;
      name: string;
      description: string;
    },
  ) => {
    const { currentCrystals } = await ctx.runMutation(
      internal.serve.useCrystal,
      {
        userId,
        name: "dall-e-3",
      },
    );
    const baseURL = getBaseURL("dall-e-3");
    const apiKey = getAPIKey("dall-e-3");
    const openai = new OpenAI({
      baseURL,
      apiKey,
    });
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `stunning image of ${name}. high quality, 8k, 4k, HD, ${description}, anime style`,
      n: 1,
      quality: "standard",
      size: "1024x1792",
      response_format: "b64_json",
    });
    const base64Data =
      response && response.data && response.data[0]
        ? (response.data[0].b64_json as string)
        : "";
    const binaryData = Buffer.from(base64Data, "base64");
    const image = new Blob([binaryData], { type: "image/png" });

    try {
      // Update storage.store to accept whatever kind of Blob is returned from node-fetch
      const cardImageStorageId = await ctx.storage.store(image as Blob);
      // Write storageId as the body of the message to the Convex database.
      await ctx.runMutation(internal.characterCard.uploadImage, {
        characterId,
        cardImageStorageId,
      });
    } catch (error) {
      await ctx.runMutation(internal.serve.refundCrystal, {
        userId,
        name: "dall-e-3",
        currentCrystals,
      });
    }
  },
);

export const generateSafeImage = internalAction(
  async (
    ctx,
    {
      userId,
      characterId,
      prompt,
    }: {
      userId: Id<"users">;
      characterId: Id<"characters">;
      prompt: string;
    },
  ) => {
    const { currentCrystals } = await ctx.runMutation(
      internal.serve.useCrystal,
      {
        userId,
        name: "dall-e-3",
      },
    );
    const baseURL = getBaseURL("dall-e-3");
    const apiKey = getAPIKey("dall-e-3");
    const openai = new OpenAI({
      baseURL,
      apiKey,
    });
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}`,
      n: 1,
      quality: "standard",
      size: "1024x1792",
      response_format: "b64_json",
    });
    const base64Data =
      response && response.data && response.data[0]
        ? (response.data[0].b64_json as string)
        : "";
    const binaryData = Buffer.from(base64Data, "base64");
    const image = new Blob([binaryData], { type: "image/png" });

    try {
      // Update storage.store to accept whatever kind of Blob is returned from node-fetch
      const cardImageStorageId = await ctx.storage.store(image as Blob);
      // Write storageId as the body of the message to the Convex database.
      await ctx.runMutation(internal.characterCard.uploadImage, {
        characterId,
        cardImageStorageId,
      });
    } catch (error) {
      await ctx.runMutation(internal.serve.refundCrystal, {
        userId,
        name: "dall-e-3",
        currentCrystals,
      });
    }
  },
);
export const generateByPrompt = internalAction(
  async (
    ctx,
    {
      userId,
      imageId,
      prompt,
      model,
    }: {
      userId: Id<"users">;
      imageId: Id<"images">;
      prompt: string;
      model: string;
    },
  ) => {
    const { currentCrystals } = await ctx.runMutation(
      internal.serve.useCrystal,
      {
        userId,
        name: model,
      },
    );

    const generateDalle3 = async () => {
      const baseURL = getBaseURL(model);
      const apiKey = getAPIKey(model);
      const openai = new OpenAI({
        baseURL,
        apiKey,
      });
      const response = await openai.images.generate({
        model: model,
        prompt: prompt,
        n: 1,
        quality: "standard",
        size: "1024x1792",
        response_format: "b64_json",
      });
      console.log("!!!openai response:::", response);
      return response && response.data && response.data[0]
        ? (response.data[0].b64_json as string)
        : "";
    };

    const generateStableDiffusion = async () => {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        "Content-Type": "application/json",
      };

      const body = {
        steps: 40,
        width: 768,
        height: 1344,
        seed: 0,
        cfg_scale: 5,
        samples: 1,
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
      };

      const response = await fetch(STABILITY_AI_API_URL, {
        headers,
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }

      // Store the image to Convex storage.
      const responseJSON = await response.json();

      return responseJSON.artifacts[0].base64;
    };

    async function generateReplicate() {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const output: any = await replicate.run(
        "charlesmccarthy/animagine-xl:db29f76d40ecf86335295ca5b24ed95e6b1eca4e29239c47cfefa68f408cbf5e",
        {
          input: {
            prompt,
            width: 768,
            height: 1344,
            disable_safety_checker: true,
          },
        },
      );
      const response = await fetch(output[0]);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString("base64");
    }

    let base64Data = "";
    if (model === "dall-e-3") {
      base64Data = await generateDalle3();
    } else if (model === "stable-diffusion-xl-1024-v1-0") {
      base64Data = await generateStableDiffusion();
    } else {
      base64Data = await generateReplicate();
    }

    const binaryData = Buffer.from(base64Data, "base64");
    const image = new Blob([binaryData], { type: "image/png" });

    try {
      // Update storage.store to accept whatever kind of Blob is returned from node-fetch
      const imageStorageId = await ctx.storage.store(image as Blob);
      // Write storageId as the body of the message to the Convex database.
      await ctx.runMutation(internal.images.uploadImage, {
        imageId,
        imageStorageId,
      });
    } catch (error) {
      await ctx.runMutation(internal.serve.refundCrystal, {
        userId,
        name: model,
        currentCrystals,
      });
    }
  },
);
