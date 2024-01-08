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
import {
  DEFAULT_MODEL,
  getAPIKey,
  getBaseURL,
  getRemindInstructionInterval,
} from "./constants";
import { getRandomGenreAndModality } from "./random";

export const answer = internalAction({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    characterId: v.id("characters"),
    personaId: v.optional(v.id("personas")),
    messageId: v.optional(v.id("messages")),
  },
  handler: async (
    ctx,
    { userId, chatId, characterId, personaId, messageId },
  ) => {
    const messages = await ctx.runQuery(internal.llm.getMessages, {
      chatId,
    });
    const character = await ctx.runQuery(api.characters.get, {
      id: characterId,
    });
    const persona = personaId
      ? await ctx.runQuery(internal.personas.getPersona, {
          id: personaId,
        })
      : undefined;

    const message = messageId
      ? await ctx.runQuery(internal.messages.get, {
          id: messageId,
        })
      : undefined;

    messageId = messageId
      ? messageId
      : await ctx.runMutation(internal.llm.addCharacterMessage, {
          chatId,
          characterId,
        });

    if (character?.isArchived) {
      await ctx.runMutation(internal.llm.updateCharacterMessage, {
        messageId,
        text: "Sorry, the character is archived by the creator.",
      });
      return;
    }
    try {
      const model = character?.model ? character.model : DEFAULT_MODEL;
      const { currentCrystals } = await ctx.runMutation(
        internal.serve.useCrystal,
        {
          userId,
          name: model,
        },
      );
      const baseURL = getBaseURL(model);
      const apiKey = getAPIKey(model);
      const openai = new OpenAI({
        baseURL,
        apiKey,
      });
      const remindInstructionInterval = getRemindInstructionInterval(model);
      const instruction = `You are 
            {
              name: ${character?.name}
              ${
                character?.description &&
                `description: ${character.description}`
              }
              ${
                character?.instructions &&
                `instruction: ${character.instructions}`
              }
            }

            ${
              persona
                ? `
              and you are talking with ${persona?.name} (${persona?.description})
              `
                : ""
            }

            (You can use parentheses to indicate different types of things the Character might say,
            narrator type descriptions of actions, muttering asides or emotional reactions.)

            You can indicate italics by putting a single asterisk * on each side of a phrase,
            like *sad*, *laughing*. This can be used to indicate action or emotion in a definition.

            Answer shortly.
            `;

      try {
        const lastIndice = message
          ? messages.reduce((lastIndex, msg: any, index) => {
              return msg._creationTime < message?._creationTime
                ? index
                : lastIndex;
            }, -1)
          : -1;
        const conversations =
          message === undefined ? messages : messages.slice(0, lastIndice);
        if (
          conversations.length > 0 &&
          conversations[conversations.length - 1]?.characterId
        ) {
          conversations.pop();
        }

        const stream = await openai.chat.completions.create({
          model,
          stream: true,
          messages: [
            {
              role: "system",
              content: instruction,
            },
            ...(conversations
              .map(({ characterId, text }: any, index: any) => {
                const message = {
                  role: characterId ? "assistant" : "user",
                  content: text,
                };
                if ((index + 1) % remindInstructionInterval === 0) {
                  return [
                    {
                      role: "system",
                      content: instruction,
                    },
                    message,
                  ];
                } else {
                  return message;
                }
              })
              .flat() as ChatCompletionMessageParam[]),
          ],
        });

        let text = "";
        let mutationCounter = 0;
        for await (const { choices } of stream) {
          const replyDelta = choices[0] && choices[0].delta.content;
          if (typeof replyDelta === "string" && replyDelta.length > 0) {
            text += replyDelta;
            mutationCounter++;
            if (mutationCounter % 2 === 0) {
              await ctx.runMutation(internal.llm.updateCharacterMessage, {
                messageId,
                text,
              });
            }
          }
        }
        // Ensure the last mutation is run if the text was updated an odd number of times
        if (mutationCounter % 2 !== 0) {
          await ctx.runMutation(internal.llm.updateCharacterMessage, {
            messageId,
            text,
          });
        }
        if (
          message &&
          messages &&
          messages.length >= 2 &&
          message.text &&
          messages[messages.length - 2]
        ) {
          await ctx.runMutation(internal.messages.save, {
            messageId,
            query: messages[messages.length - 2]?.text as string,
            rejectedMessage: message.text,
            regeneratedMessage: text,
          });
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
          text: "I cannot reply at this time.",
        });
      }
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
    const messages = await ctx.runQuery(internal.llm.getMessages, {
      chatId,
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
      const model = "gpt-3.5-turbo-1106";
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
        const instruction = `You are ${
          persona ? `${persona?.name} (${persona?.description}). You are ` : ""
        } talking with character.
        {
          name: ${character?.name}
          ${character?.description && `description: ${character.description}`}
        }
        respond in JSON as this will be used for function arguments.
        `;

        const functions = [
          {
            name: "generate_answers",
            description:
              "This function is always triggered. Always answer in short (maximum: 15 words.) sentence.",
            parameters: {
              type: "object",
              properties: {
                answer1: {
                  type: "string",
                  description:
                    "Provide a natural follow-up to the previous message, maintaining the flow of the conversation.",
                },
                answer2: {
                  type: "string",
                  description:
                    "Craft an engaging and intriguing follow-up to the previous message, designed to captivate the user's interest aware of character's background.",
                },
                answer3: {
                  type: "string",
                  description:
                    "Introduce an entirely new idea or pose a question to prevent the conversation from reaching a dead-end.",
                },
              },
              required: ["answer1", "answer2", "answer3"],
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
            ...(messages
              .map(({ characterId, text }: any, index: any) => {
                return {
                  role: characterId ? "user" : "assistant",
                  content: text,
                };
              })
              .flat() as ChatCompletionMessageParam[]),
          ],
          function_call: "auto",
          response_format: { type: "json_object" },
          functions,
        });
        const responseMessage = (response &&
          response?.choices &&
          response.choices[0]?.message) as any;
        if (responseMessage?.function_call) {
          const functionArgs = JSON.parse(
            responseMessage.function_call.arguments,
          );
          await ctx.runMutation(internal.followUps.create, {
            chatId,
            followUp1: functionArgs?.answer1,
            followUp2: functionArgs?.answer2,
            followUp3: functionArgs?.answer3,
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
      const model = "gpt-4-1106-preview";
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
                    "ISO 639 Set 1 two-letter language code for character, Example: en, ko, ja, ar",
                },
                genreTag: {
                  type: "string",
                  description: `Genre define the character's genre, it can be "Anime", "Game", "VTuber", "History", "Religion", "Language", "Animal", "Philosophy", "Assistant", anything.`,
                },
                personalityTag: {
                  type: "string",
                  description: `This tag describe the character's personality trait. Examples include "Introverted," "Brave," "Cunning," "Compassionate," "Sarcastic," etc.`,
                },
                roleTag: {
                  type: "string",
                  description: `Role define the character's role or function in the story. Common examples are "Teacher", "Protagonist", "Antagonist", "Sidekick", "Mentor", "Comic relief", etc.`,
                },
              },
              required: [
                "languageTag",
                "genreTag",
                "personalityTag",
                "roleTag",
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
            roleTag: functionArgs?.roleTag,
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
  async (ctx, { chatId }: { chatId: Id<"chats"> }) => {
    return await ctx.db
      .query("messages")
      .withIndex("byChatId", (q) => q.eq("chatId", chatId))
      .take(256);
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
