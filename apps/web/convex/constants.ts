export const SIGN_UP_FREE_CRYSTALS = 50;
export const DIVIDEND_RATE = 0.25;
export const DEFAULT_MODEL = "openrouter/auto";
export const PERPLEXITY_API_URL = "https://api.perplexity.ai";
export const OPENAI_API_URL = "https://api.openai.com/v1";
export const FIREWORK_API_URL = "https://api.fireworks.ai/inference/v1";
export const STABILITY_AI_API_URL =
  "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
export const MISTRAL_AI_API_URL = "https://api.mistral.ai/v1";
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

export const getBaseURL = (modelName: string) => {
  switch (modelName) {
    case "gpt-3.5-turbo-1106":
    case "gpt-4-1106-preview":
    case "dall-e-3":
      return OPENAI_API_URL;
    case "mistral-tiny":
    case "mistral-small":
    case "mistral-medium":
      return MISTRAL_AI_API_URL;
    case "pplx-7b-online":
    case "pplx-7b-chat":
    case "pplx-70b-online":
    case "pplx-70b-chat":
      return PERPLEXITY_API_URL;
    default:
      return OPENROUTER_API_URL;
  }
};

export const getAPIKey = (modelName: string) => {
  switch (modelName) {
    case "gpt-3.5-turbo-1106":
    case "gpt-4-1106-preview":
    case "dall-e-3":
      return process.env.OPENAI_API_KEY;
    case "pplx-7b-online":
    case "pplx-7b-chat":
    case "pplx-70b-online":
    case "pplx-70b-chat":
      return process.env.PERPLEXITY_API_KEY;
    case "mistral-tiny":
    case "mistral-small":
    case "mistral-medium":
      return process.env.MISTRAL_API_KEY;
    default:
      return process.env.OPENROUTER_API_KEY;
  }
};

export const getCrystalPrice = (modelName: string) => {
  const allModels = [
    ...modelData,
    ...imageModelData,
    ...voiceData,
    ...TranslationModelData,
  ];
  const model = allModels.find((m) => m.value === modelName);
  console.log("modelName", modelName, model);
  return model ? model.crystalPrice : modelName === "auto" ? 10 : 5;
};

export const getImageModelCrystalPrice = (modelName: string) => {
  const model = imageModelData.find((m) => m.value === modelName);
  return model ? model.crystalPrice : 25;
};

// Model metadata is hard-coded due to frequent updates in open-source LLM.
export const modelData = [
  {
    value: "openrouter/auto",
    description: "Auto",
    crystalPrice: 10,
  },
  {
    value: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    description: "Nous Hermes 2 Mixtral 8x7B DPO",
    crystalPrice: 1,
  },
  {
    value: "gpt-3.5-turbo-1106",
    description: "GPT-3.5 Turbo by OpenAI",
    src: "/models/openai.png",
    alt: "Company logo of Open AI",
    crystalPrice: 1,
  },
  {
    value: "gpt-4-1106-preview",
    description: "GPT-4 Turbo by OpenAI",
    src: "/models/openai.png",
    alt: "Company logo of Open AI",
    crystalPrice: 10,
  },
  {
    value: "mistral-small",
    description: "Mistral Small by Mistral AI",
    src: "/models/mistral.png",
    alt: "Company logo of Mistral AI",
    crystalPrice: 1,
  },
  {
    value: "mistral-medium",
    description: "Mistral Medium by Mistral AI",
    src: "/models/mistral.png",
    alt: "Company logo of Mistral AI",
    crystalPrice: 5,
  },
  {
    value: "pplx-70b-online",
    description: "Perplexity 70B Online by Perplexity AI",
    src: "/models/perplexity.png",
    alt: "Company logo of Perplexity AI",
    crystalPrice: 1,
  },
  {
    value: "pplx-70b-chat",
    description: "Perplexity 70B Chat by Perplexity AI",
    src: "/models/perplexity.png",
    alt: "Company logo of Perplexity AI",
    crystalPrice: 1,
  },
  {
    value: "google/gemini-pro",
    description: "Gemini Pro by Google",
    crystalPrice: 1,
    src: "/models/google.png",
    alt: "Company logo of Google",
  },
  // {
  //   value: "01-ai/yi-34b-200k",
  //   description: "Yi 34B by 01.AI",
  //   crystalPrice: 1,
  // },
  {
    value: "anthropic/claude-instant-v1",
    description: "Claude Instant by Anthropic",
    crystalPrice: 1,
    src: "/models/claude.png",
    alt: "Company logo of Anthropic AI",
  },
  {
    value: "anthropic/claude-2",
    description: "Claude 2 by Anthropic",
    crystalPrice: 10,
    src: "/models/claude.png",
    alt: "Company logo of Anthropic AI",
  },
  {
    value: "gryphe/mythomax-l2-13b-8k",
    description: "Uncensored, Mythomax L2 13B by Gryphe",
    crystalPrice: 0.5,
    isNSFW: true,
  },
  {
    value: "undi95/toppy-m-7b",
    description: "Uncensored, Toppy M 7B by undi95",
    isNSFW: true,
    crystalPrice: 0.1,
  },
  {
    value: "undi95/toppy-m-7b:free",
    description: "Uncensored, Toppy M 7B by undi95 with Rate Limit",
    isNSFW: true,
    crystalPrice: 0,
  },
  {
    value: "pygmalionai/mythalion-13b",
    description: "Uncensored, Mythalion 13B by PygmalionAI",
    isNSFW: true,
    crystalPrice: 1,
  },
  {
    value: "lizpreciatior/lzlv-70b-fp16-hf",
    description: "Uncensored, lzlv 70B by lizpreciatior",
    isNSFW: true,
    crystalPrice: 1,
  },
  {
    value: "neversleep/noromaid-20b",
    description: "Uncensored, Noromaid 20B by Never Sleep",
    isNSFW: true,
    crystalPrice: 3,
  },
  {
    value: "cognitivecomputations/dolphin-mixtral-8x7b",
    description: "Uncensored, Dolphin Mixtral 8x7B by Eric Hartford",
    isNSFW: true,
    crystalPrice: 1,
  },
  {
    value: "neversleep/noromaid-mixtral-8x7b-instruct",
    description: "Uncensored, Noromaid 8x7B by Never Sleep",
    isNSFW: true,
    crystalPrice: 3,
  },
  {
    value: "nousresearch/nous-capybara-7b:free",
    description: "Copybara 7B by Nous Research",
    crystalPrice: 0,
  },
  {
    value: "mistralai/mistral-7b-instruct:free",
    description: "Mistral 7B by Mistral AI",
    crystalPrice: 0,
  },
  {
    value: "huggingfaceh4/zephyr-7b-beta:free",
    description: "Zephyr 7B by Hugging Face",
    crystalPrice: 0,
  },
  {
    value: "openchat/openchat-7b:free",
    description: "Openchat 7B by Open Chat",
    crystalPrice: 0,
  },
  {
    value: "gryphe/mythomist-7b:free",
    description: "Mythomist 7B by Gryphe",
    crystalPrice: 0,
  },
  {
    value: "openrouter/cinematika-7b",
    description: "Cinematika 7B by Open Router",
    crystalPrice: 0,
  },
  {
    value: "nousresearch/nous-hermes-llama2-13b",
    description: "LLama2 13B by Nous Research",
    crystalPrice: 1,
  },
  {
    value: "austism/chronos-hermes-13b",
    description: "Chronos Hermes by Austism",
    crystalPrice: 1,
  },
  {
    value: "jebcarter/psyfighter-13b",
    description: "Psyfighter 13B by Jeb Carter",
    crystalPrice: 1,
  },
  {
    value: "koboldai/psyfighter-13b-2",
    description: "Psyfighter 13B 2 by Kobold AI",
    crystalPrice: 1,
  },
  {
    value: "meta-llama/codellama-34b-instruct",
    description: "CodeLlama2 34B by Meta Llama",
    crystalPrice: 1,
    src: "/models/meta.png",
    alt: "Company logo of Meta",
  },
  {
    value: "phind/phind-codellama-34b",
    description: "Phind CodeLlama2 34B by Phind",
    crystalPrice: 1,
  },
  {
    value: "intel/neural-chat-7b",
    description: "Neural Chat 7B by Intel",
    crystalPrice: 1,
  },
  {
    value: "mistralai/mixtral-8x7b-instruct",
    description: "Mixtral 8x7B by Mistral AI",
    crystalPrice: 1,
  },
  {
    value: "meta-llama/llama-2-13b-chat",
    description: "Llama 2 13B by Meta Llama",
    crystalPrice: 1,
    src: "/models/meta.png",
    alt: "Company logo of Meta",
  },
  {
    value: "meta-llama/llama-2-70b-chat",
    description: "Llama 2 70B by Meta Llama",
    crystalPrice: 1,
    src: "/models/meta.png",
    alt: "Company logo of Meta",
  },
  {
    value: "nousresearch/nous-hermes-llama2-70b",
    description: "Llama 2 70B by Nous Research",
    crystalPrice: 1,
  },
  {
    value: "nousresearch/nous-capybara-34b",
    description: "Capybara 34B by Nous Research",
    crystalPrice: 1,
  },
  {
    value: "jondurbin/airoboros-l2-70b",
    description: "Airobos L2 70B by Jon Durbin",
    crystalPrice: 1,
  },
  {
    value: "teknium/openhermes-2-mistral-7b",
    description: "Openhermes 2 7B by Teknium",
    crystalPrice: 1,
  },
  {
    value: "migtissera/synthia-70b",
    description: "Synthia 70B by Migtissera",
    crystalPrice: 3,
  },
  {
    value: "haotian-liu/llava-13b",
    description: "Llava 13B by Haotian Liu",
    crystalPrice: 5,
  },
  {
    value: "nousresearch/nous-hermes-2-vision-7b",
    description: "Hermes 2 Vision 7B by Nous Research",
    crystalPrice: 5,
  },
];

export const imageModelData = [
  {
    value: "daun-io/openroleplay.ai-animagine-v3",
    description:
      "Animagine XL 3.0 - Advanced model to create high-resolution, detailed anime images.",
    license: "Fair AI Public License 1.0-SD",
    crystalPrice: 14,
  },
  {
    value: "charlesmccarthy/animagine-xl",
    description:
      "Animagine XL 2.0 - Advanced model to create high-resolution, detailed anime images.",
    license: "Fair AI Public License 1.0-SD",
    crystalPrice: 14,
  },
  {
    value: "dall-e-3",
    description: "Dall-E 3 by Open AI",
    crystalPrice: 75,
  },
  {
    value: "pagebrain/dreamshaper-v8",
    description:
      "Dream Shaper V8 - 'A better Stable Diffusion', a model capable of doing everything on its own, to weave dreams.",
    license: "creativeml-openrail-ml",
    crystalPrice: 14,
  },
  {
    value: "asiryan/juggernaut-xl-v7",
    description:
      "Juggernaut XL v7 Model - Advanced model for photorealistic, high quality images.",
    license: "creativeml-openrail-ml",
    crystalPrice: 28,
  },
];

export const voiceData = [
  {
    value: "MjxppkSa4IoDSRGySayZ",
    description: "Sally - Relaxed, Conversational",
    crystalPrice: 10,
  },
  {
    value: "Rs8KSvytt4yKbvZosLTw",
    description: "Bria - Soft, Narration",
    crystalPrice: 10,
  },
  {
    value: "piTKgcLEGmPE4e6mEKli",
    description: "Nicole - Whisper, Audiobook",
    crystalPrice: 10,
  },
  {
    value: "YzIAMwXBjRJLLSZR1E4O",
    description: "Alex - Intense, Narration",
    crystalPrice: 10,
  },
  {
    value: "TX3LPaxmHKxFdv7VOQHJ",
    description: "Liam - Neutral, Narration",
    crystalPrice: 10,
  },
  {
    value: "SOYHLrjzK2X1ezoPC6cr",
    description: "Harry - Anxious, Video Games",
    crystalPrice: 10,
  },
];

export const TranslationModelData = [
  {
    value: "deepl",
    description: "DeepL - Machine Translation API",
    crystalPrice: 1,
  },
];

export const crystalDollarPrice = {
  300: "99",
  1650: "499",
  5450: "1499",
  11200: "2999",
  19400: "4999",
  90000: "9999",
};
