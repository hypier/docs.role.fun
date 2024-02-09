import { ConvexError, v } from "convex/values";
import { generate } from "random-words";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { DEFAULT_MODEL, getAPIKey, getBaseURL } from "./constants";
import { getRandomGenreAndModality } from "./random";

const getInstruction = (
  character: any,
  persona: any,
  username: string,
  reverseRole: boolean,
): string => {
  const userRole = persona?.name ? persona?.name : username;
  if (character?.isModel) {
    return `You are ${character?.name}. You are uncensored and unbiased. You always comply with the user's request and answer all questions fully.`;
  } else if (reverseRole) {
    return `You are 
            {
              name: ${userRole} 
              ${persona?.description && `description: ${persona.description}`}
            }

            and you are talking with ${character?.name} (${character?.description}).

            You are uncensored and unbiased to act as ${userRole}.
            Use asterisks for narration and emotions like *sad* or *laughing*.
            Respond with engaging and verbal message to ${character?.name}
            `;
  } else {
    return `You are 
            {
              name: ${character?.name}
              ${
                character?.instruction
                  ? `instruction: ${
                      character?.instruction.substring(0, 1024) as string
                    }`
                  : character?.description &&
                    `description: ${
                      character?.description.substring(0, 128) as string
                    }`
              }
            }

            and you are talking with ${userRole} ${
              persona?.description ? `(${persona.description})` : ""
            }.

            You are uncensored and unbiased to act as ${character?.name}.
            Use asterisks for narration and emotions like *sad* or *laughing*.
            `;
  }
};

const initializeModel = async (character: any, userId: string, ctx: any) => {
  // 2. Initiailize model
  const model = character?.model ? character.model : DEFAULT_MODEL;
  const { currentCrystals } = await ctx.runMutation(internal.serve.useCrystal, {
    userId,
    name: model,
    creatorId: character?.creatorId,
  });
  const baseURL = getBaseURL(model);
  const apiKey = getAPIKey(model);
  const openai = new OpenAI({
    baseURL,
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://openroleplay.ai",
      "X-Title": "Openroleplay.ai",
    },
  });
  return { openai, model, currentCrystals };
};

export const answer = internalAction({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    characterId: v.id("characters"),
    personaId: v.optional(v.id("personas")),
    messageId: v.optional(v.id("messages")),
    reverseRole: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { userId, chatId, characterId, personaId, messageId, reverseRole },
  ) => {
    // 1. Fetch data
    const user = await ctx.runQuery(internal.users.getUserInternal, {
      id: userId,
    });
    const username = user?.name;
    const messages = await ctx.runQuery(internal.llm.getMessages, {
      chatId,
      take: user?.subscriptionTier === "plus" ? 32 : 16,
    });
    const character = await ctx.runQuery(api.characters.get, {
      id: characterId,
    });
    const persona = personaId
      ? await ctx.runQuery(internal.personas.getPersona, {
          id: personaId,
        })
      : user?.primaryPersonaId
        ? await ctx.runQuery(internal.personas.getPersona, {
            id: user?.primaryPersonaId,
          })
        : undefined;

    const message = messageId
      ? await ctx.runQuery(internal.messages.get, {
          id: messageId,
        })
      : undefined;

    messageId = messageId
      ? messageId
      : reverseRole
        ? await ctx.runMutation(internal.llm.addUserMessage, {
            chatId,
          })
        : await ctx.runMutation(internal.llm.addCharacterMessage, {
            chatId,
            characterId,
          });

    if (
      character?.creatorId !== userId &&
      character?.visibility === "private"
    ) {
      await ctx.runMutation(internal.llm.updateCharacterMessage, {
        messageId,
        text: "You can't interact with other people's character.",
      });
      return;
    }
    if (character?.isArchived) {
      await ctx.runMutation(internal.llm.updateCharacterMessage, {
        messageId,
        text: "Sorry, the character is archived by the creator.",
      });
      return;
    }
    if (character?.isBlacklisted) {
      await ctx.runMutation(internal.llm.updateCharacterMessage, {
        messageId,
        text: "This character is automatically classified as violating our community guidelines and content policy. You can ask questions on our Discord if this classification is a false positive.",
      });
      return;
    }

    let model;
    try {
      const { openai, model, currentCrystals } = await initializeModel(
        character,
        userId,
        ctx,
      );
      const instruction = getInstruction(
        character,
        persona,
        username as string,
        reverseRole as boolean,
      );

      try {
        const lastIndice = message
          ? messages.reduce((lastIndex, msg: any, index) => {
              return msg._creationTime > message?._creationTime
                ? index
                : lastIndex;
            }, -1)
          : -1;

        const characterPrefix = `${character?.name}: `;
        const userRole =
          persona && "name" in persona ? persona?.name : username;
        const userPrefix = `${userRole}: `;
        let conversations =
          message === undefined ? messages : messages.slice(0, lastIndice);
        conversations = conversations.map((conversation: any) => {
          if (conversation.characterId) {
            return {
              ...conversation,
              text: conversation.text.includes(characterPrefix)
                ? conversation.text.replaceAll("{{user}}", userRole)
                : characterPrefix +
                  conversation.text.replaceAll("{{user}}", userRole),
            };
          } else {
            return {
              ...conversation,
              text: conversation.text.includes(userPrefix)
                ? conversation.text
                : userPrefix + conversation.text,
            };
          }
        });

        let originalQuery;
        if (
          conversations.length > 0 &&
          conversations[conversations.length - 1]?.characterId &&
          !reverseRole
        ) {
          conversations.pop();
        }
        if (
          message &&
          message?.text &&
          conversations[conversations.length - 1] &&
          conversations[conversations.length - 1]?.text &&
          typeof conversations[conversations.length - 1]?.text === "string"
        ) {
          // @ts-ignore
          originalQuery = conversations[conversations.length - 1].text;
          // @ts-ignore
          conversations[conversations.length - 1].text +=
            ` (don't answer like "${message.text})"`;
          console.log("conversations edited::", conversations);
        }

        // 4. Start streaming
        const response = await openai.chat.completions.create({
          model,
          stream: false,
          messages: [
            {
              role: "system",
              content: instruction,
            },
            ...(conversations.map(({ characterId, text }: any) => ({
              role: reverseRole
                ? characterId
                  ? "user"
                  : "assistant"
                : characterId
                  ? "assistant"
                  : "user",
              content: text,
            })) as ChatCompletionMessageParam[]),
          ],
          max_tokens: 192,
        });

        const responseMessage = (response &&
          response?.choices &&
          response.choices[0]?.message) as any;
        const content = responseMessage?.content
          .replaceAll("{{user}}", userRole as string)
          .replaceAll(characterPrefix, "")
          .replaceAll(userPrefix, "");
        await ctx.runMutation(internal.llm.updateCharacterMessage, {
          messageId,
          text: content,
        });
        if (
          message &&
          messages &&
          messages.length >= 2 &&
          message.text &&
          messages[messages.length - 2]
        ) {
          await ctx.runMutation(internal.messages.save, {
            messageId,
            query: originalQuery as string,
            rejectedMessage: message.text,
            regeneratedMessage: content,
          });
        }
        const userLanguage =
          user?.languageTag === "en"
            ? "en-US"
            : user?.languageTag === "pt"
              ? "pt-PT"
              : user?.languageTag;
        if (
          user?.languageTag &&
          user?.languageTag !== "en" &&
          user.autoTranslate !== false
        ) {
          await ctx.scheduler.runAfter(0, internal.translate.translate, {
            targetLanguage: userLanguage,
            userId: user?._id,
            messageId,
          });
        } else {
          if (!model.includes("free")) {
            await ctx.scheduler.runAfter(0, internal.llm.generateFollowups, {
              personaId,
              chatId,
              characterId,
              userId,
            });
          }
        }
      } catch (error) {
        await ctx.runMutation(internal.serve.refundCrystal, {
          userId,
          currentCrystals,
          name: model,
        });
        throw error;
      }
    } catch (error) {
      if (error instanceof ConvexError) {
        console.log("catched convex error:::", error);
        await ctx.runMutation(internal.llm.updateCharacterMessage, {
          messageId,
          text: error?.data,
        });
      } else {
        console.log("catched other error:::", error);
        await ctx.runMutation(internal.llm.updateCharacterMessage, {
          messageId,
          text: `${
            model ? model : "I"
          } cannot reply at this time. Try again later.`,
        });
      }
    }

    if (reverseRole) {
      await ctx.scheduler.runAfter(0, internal.llm.answer, {
        chatId,
        characterId,
        personaId,
        userId,
        reverseRole: false,
      });
    }
  },
});

export const generateInstruction = internalAction({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    characterId: v.id("characters"),
  },
  handler: async (ctx, { userId, name, description, characterId }) => {
    try {
      const model = DEFAULT_MODEL;
      const baseURL = getBaseURL(model);
      const apiKey = getAPIKey(model);
      const openai = new OpenAI({
        baseURL,
        apiKey,
      });
      const instruction = `Create specific and detailed character instruction (what does the character do, how does they behave, what should they avoid doing, example quotes from character.) for ${name} (description: ${description}). `;
      const { currentCrystals } = await ctx.runMutation(
        internal.serve.useCrystal,
        {
          userId,
          name: model,
        },
      );
      try {
        const stream = await openai.chat.completions.create({
          model,
          stream: true,
          messages: [
            {
              role: "system",
              content: instruction,
            },
          ],
        });

        let text = "";
        for await (const { choices } of stream) {
          const replyDelta = choices[0] && choices[0].delta.content;
          if (typeof replyDelta === "string" && replyDelta.length > 0) {
            text += replyDelta;
            await ctx.runMutation(internal.llm.updateCharacterInstruction, {
              characterId,
              text,
            });
          }
        }
      } catch (error) {
        await ctx.runMutation(internal.serve.refundCrystal, {
          userId,
          currentCrystals,
          name: model,
        });
        throw Error;
      }
    } catch (error) {
      if (error instanceof ConvexError) {
        await ctx.runMutation(internal.llm.updateCharacterInstruction, {
          characterId,
          text: error.data,
        });
      } else {
        await ctx.runMutation(internal.llm.updateCharacterInstruction, {
          characterId,
          text: "I cannot generate instruction at this time. You may have not enough crystals.",
        });
      }
      throw error;
    }
  },
});

export const generateFollowups = internalAction({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    characterId: v.id("characters"),
    personaId: v.optional(v.id("personas")),
  },
  handler: async (ctx, { userId, chatId, characterId, personaId }) => {
    const user = await ctx.runQuery(internal.users.getUserInternal, {
      id: userId,
    });
    const username = user?.name;
    const messages = await ctx.runQuery(internal.llm.getMessages, {
      chatId,
      take: 4,
    });
    const character = await ctx.runQuery(api.characters.get, {
      id: characterId,
    });
    const persona = personaId
      ? await ctx.runQuery(internal.personas.getPersona, {
          id: personaId,
        })
      : undefined;
    try {
      const model = "undi95/toppy-m-7b";
      const baseURL = getBaseURL(model);
      const apiKey = getAPIKey(model);
      const openai = new OpenAI({
        baseURL,
        apiKey,
        defaultHeaders: {
          "HTTP-Referer": "https://openroleplay.ai",
          "X-Title": "Openroleplay.ai",
        },
      });
      try {
        const followUp = await ctx.runQuery(internal.followUps.latestFollowup, {
          chatId,
        });
        const followUpId = followUp?._id as Id<"followUps">;
        const characterPrefix = `${character?.name}: `;
        const userRole =
          persona && "name" in persona ? persona?.name : username;
        const userPrefix = `${userRole}: `;
        for (let i = 1; i <= (user?.subscriptionTier === "plus" ? 3 : 2); i++) {
          const instruction = getInstruction(
            character,
            persona,
            username as string,
            true,
          );
          const response = await openai.chat.completions.create({
            model:
              i === 1
                ? model
                : i === 2
                  ? "huggingfaceh4/zephyr-7b-beta:free"
                  : "recursal/eagle-7b",
            stream: false,
            messages: [
              {
                role: "system",
                content: instruction,
              },
              ...(messages
                .map(({ characterId, text }: any, index: any) => {
                  return {
                    role: characterId ? "user" : "assistant",
                    content: text,
                  };
                })
                .flat() as ChatCompletionMessageParam[]),
            ],
            max_tokens: 64,
          });
          const responseMessage = (response &&
            response?.choices &&
            response.choices[0]?.message) as any;

          // Update followUp responses based on iteration
          if (i === 1) {
            await ctx.runMutation(internal.followUps.update, {
              followUpId,
              followUp1: responseMessage?.content
                .replaceAll("{{user}}", userRole as string)
                .replaceAll(characterPrefix, "")
                .replaceAll(userPrefix, ""),
            });
          } else if (i === 2) {
            await ctx.runMutation(internal.followUps.update, {
              followUpId,
              followUp2: responseMessage?.content
                .replaceAll("{{user}}", userRole as string)
                .replaceAll(characterPrefix, "")
                .replaceAll(userPrefix, ""),
            });
          } else if (i === 3) {
            await ctx.runMutation(internal.followUps.update, {
              followUpId,
              followUp3: responseMessage?.content
                .replaceAll("{{user}}", userRole as string)
                .replaceAll(characterPrefix, "")
                .replaceAll(userPrefix, ""),
            });
          }
        }
      } catch (error) {
        console.log("error:::", error);
        throw Error;
      }
    } catch (error) {
      console.log("error:::", error);
      throw error;
    }
  },
});

export const generateCharacter = internalAction({
  args: {
    userId: v.id("users"),
    characterId: v.id("characters"),
  },
  handler: async (ctx, { userId, characterId }) => {
    try {
      const model = "gpt-4-1106-preview";
      const baseURL = getBaseURL(model);
      const apiKey = getAPIKey(model);
      const openai = new OpenAI({
        baseURL,
        apiKey,
      });
      const { currentCrystals } = await ctx.runMutation(
        internal.serve.useCrystal,
        {
          userId,
          name: model,
        },
      );
      try {
        const instruction = `generate ${getRandomGenreAndModality()} character, respond in JSON. seed:${
          Math.random() * Date.now()
        } [${generate(5)}]
        `;

        const functions = [
          {
            name: "generate_character",
            description: "generate character.",
            parameters: {
              type: "object",
              properties: {
                instructions: {
                  type: "string",
                  description: "instruct how they behave, what they do, quotes",
                },
                description: {
                  type: "string",
                  description: "short description",
                },
                greeting: {
                  type: "string",
                  description: "first message or prologue for the character",
                },
                prompt: {
                  type: "string",
                  description:
                    "Prompt artist how this character look like, do not contain any copyright infringement and NSFW description.",
                },
                name: {
                  type: "string",
                  description: `creative and short name of the character from any language`,
                },
              },
              required: [
                "name",
                "description",
                "instructions",
                "greeting",
                "prompt",
              ],
            },
          },
        ];
        const response = await openai.chat.completions.create({
          model,
          stream: false,
          messages: [
            {
              role: "system",
              content: instruction,
            },
          ],
          function_call: "auto",
          response_format: { type: "json_object" },
          functions,
          temperature: 1,
        });
        console.log("response:::", response);
        const responseMessage = (response &&
          response?.choices &&
          response.choices[0]?.message) as any;
        console.log("responseMessage:::", responseMessage);
        if (responseMessage?.function_call) {
          const functionArgs = JSON.parse(
            responseMessage.function_call.arguments,
          );
          console.log("functionArgs:::", functionArgs);
          await ctx.runMutation(internal.characters.autofill, {
            characterId,
            name: functionArgs?.name,
            description: functionArgs?.description,
            instructions: functionArgs?.instructions,
            greeting: functionArgs?.greeting,
          });
          await ctx.scheduler.runAfter(0, internal.image.generateSafeImage, {
            userId,
            characterId,
            prompt: functionArgs?.description,
          });
        }
      } catch (error) {
        console.log("error:::", error);
        await ctx.runMutation(internal.serve.refundCrystal, {
          userId,
          currentCrystals,
          name: model,
        });
        throw Error;
      }
    } catch (error) {
      console.log("error:::", error);
      throw error;
    }
  },
});

export const generateTags = internalAction({
  args: {
    userId: v.id("users"),
    characterId: v.id("characters"),
  },
  handler: async (ctx, { userId, characterId }) => {
    try {
      const model = "gpt-3.5-turbo-1106";
      const baseURL = getBaseURL(model);
      const apiKey = getAPIKey(model);
      const openai = new OpenAI({
        baseURL,
        apiKey,
      });
      const character = await ctx.runQuery(api.characters.get, {
        id: characterId,
      });
      try {
        const instruction = `Tag the character, respond in JSON.
        Following is the detail of character.
        {
          name: ${character?.name},
          description: ${character?.description},
          greetings: ${character?.greetings},
          instruction: ${character?.instructions},
        }
        `;

        const functions = [
          {
            name: "tag_character",
            description: "generate character tags.",
            parameters: {
              type: "object",
              properties: {
                languageTag: {
                  type: "string",
                  description:
                    "ISO 639 Set 1 two-letter language code for character's detail metadata, Example: en, ko, ja, ar, zh",
                },
                genreTag: {
                  type: "string",
                  description: `Genre define the character's genre in 1 word, it can be "Anime", "Game", "LGBTQ+", "Original", "VTuber", "History", "Religion", "Language", "Animal", "Philosophy", "Politics", "Assistant", anything.`,
                },
                personalityTag: {
                  type: "string",
                  description: `This tag describe the character's personality trait in 1 word. Examples include "Introverted," "Brave," "Cunning," "Compassionate," "Sarcastic," etc.`,
                },
                genderTag: {
                  type: "string",
                  description: `Define character's gender in 1 word. Common examples are "Male", "Female", "Non-binary", etc`,
                },
                isNSFW: {
                  type: "boolean",
                  description: `True if character's detail metadata is explicitly sexual content, otherwise false.`,
                },
                isRestricted: {
                  type: "boolean",
                  description: `True if character is explicitly depicting minor, teenager, gore or real person.`,
                },
              },
              required: [
                "languageTag",
                "genreTag",
                "personalityTag",
                "genderTag",
                "isNSFW",
              ],
            },
          },
        ];
        const response = await openai.chat.completions.create({
          model,
          stream: false,
          messages: [
            {
              role: "system",
              content: instruction,
            },
          ],
          function_call: "auto",
          response_format: { type: "json_object" },
          functions,
          temperature: 1,
        });
        console.log("response:::", response);
        const responseMessage = (response &&
          response?.choices &&
          response.choices[0]?.message) as any;
        console.log("responseMessage:::", responseMessage);
        if (responseMessage?.function_call) {
          const functionArgs = JSON.parse(
            responseMessage.function_call.arguments,
          );
          console.log("functionArgs:::", functionArgs);
          await ctx.runMutation(internal.characters.tag, {
            characterId,
            languageTag: functionArgs?.languageTag,
            genreTag: functionArgs?.genreTag,
            personalityTag: functionArgs?.personalityTag,
            genderTag: functionArgs?.genderTag,
            isNSFW: functionArgs?.isNSFW,
            isBlacklisted: functionArgs?.isRestricted,
          });
        }
      } catch (error) {
        console.log("error:::", error);
        throw Error;
      }
    } catch (error) {
      console.log("error:::", error);
      throw error;
    }
  },
});

export const generateImageTags = internalAction({
  args: {
    userId: v.id("users"),
    imageId: v.id("images"),
    isPlus: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, imageId, isPlus }) => {
    try {
      const model = "gpt-3.5-turbo-1106";
      const baseURL = getBaseURL(model);
      const apiKey = getAPIKey(model);
      const openai = new OpenAI({
        baseURL,
        apiKey,
      });
      const image = await ctx.runQuery(api.images.get, {
        imageId,
      });
      try {
        const instruction = `You are a content moderator maintaining our platform a safe place for everyone.
        Tag the image, respond in JSON.
        Following is the detail of an image.
        {
          altText: ${image?.prompt},
        }
        `;

        const functions = [
          {
            name: "tag_image",
            description: "generate image tags.",
            parameters: {
              type: "object",
              properties: {
                tag: {
                  type: "string",
                  description: `Tag the image. it can be "Anime", "Game", "Characters", "Landscape", "Cyberpunk", "Space", "Paintings", "Modern", anything.`,
                },
                isNSFW: {
                  type: "boolean",
                  description: `True if altText is explicitly sexual content, otherwise false.`,
                },
                isRestricted: {
                  type: "boolean",
                  description: `True if altText is depicting minor, teenager, gore or real person.`,
                },
              },
              required: ["tag", "isNSFW"],
            },
          },
        ];
        const response = await openai.chat.completions.create({
          model,
          stream: false,
          messages: [
            {
              role: "system",
              content: instruction,
            },
          ],
          function_call: "auto",
          response_format: { type: "json_object" },
          functions,
          temperature: 1,
        });
        console.log("response:::", response);
        const responseMessage = (response &&
          response?.choices &&
          response.choices[0]?.message) as any;
        console.log("responseMessage:::", responseMessage);
        if (responseMessage?.function_call) {
          const functionArgs = JSON.parse(
            responseMessage.function_call.arguments,
          );
          console.log("functionArgs:::", functionArgs);
          await ctx.runMutation(internal.images.tag, {
            imageId,
            tag: functionArgs?.tag,
            isNSFW: functionArgs?.isNSFW,
          });
          if (functionArgs?.isRestricted) {
            throw new ConvexError("This prompt is prohibited.");
          }
          await ctx.scheduler.runAfter(0, internal.image.generateByPrompt, {
            userId,
            imageId,
            prompt: image?.prompt,
            model: image?.model,
            isPrivate: image?.isPrivate,
            isNSFW: functionArgs?.isNSFW,
            isPlus,
          });
        }
      } catch (error) {
        console.log("error:::", error);
        throw Error;
      }
    } catch (error) {
      console.log("error:::", error);
      throw error;
    }
  },
});

export const getMessages = internalQuery(
  async (
    ctx,
    { chatId, take = 16 }: { chatId: Id<"chats">; take?: number },
  ) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("byChatId", (q) => q.eq("chatId", chatId))
      .order("desc")
      .collect();
    return messages.slice(0, take).reverse();
  },
);

export const addCharacterMessage = internalMutation(
  async (
    ctx,
    {
      chatId,
      characterId,
    }: { chatId: Id<"chats">; characterId: Id<"characters"> },
  ) => {
    return await ctx.db.insert("messages", {
      text: "",
      chatId,
      characterId,
    });
  },
);

export const addUserMessage = internalMutation(
  async (ctx, { chatId }: { chatId: Id<"chats"> }) => {
    return await ctx.db.insert("messages", {
      text: "",
      chatId,
    });
  },
);

export const updateCharacterMessage = internalMutation(
  async (
    ctx,
    { messageId, text }: { messageId: Id<"messages">; text: string },
  ) => {
    await ctx.db.patch(messageId, { text });
  },
);

export const updateCharacterInstruction = internalMutation(
  async (
    ctx,
    { characterId, text }: { characterId: Id<"characters">; text: string },
  ) => {
    await ctx.db.patch(characterId, { instructions: text });
  },
);
