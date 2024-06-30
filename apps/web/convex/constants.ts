export const SIGN_UP_FREE_CRYSTALS = 15;
export const DIVIDEND_RATE = 0.25;
export const DEFAULT_MODEL = "openrouter/auto";
export const PERPLEXITY_API_URL = "https://api.perplexity.ai";
export const OPENAI_API_URL = "https://api.openai.com/v1";
export const FIREWORK_API_URL = "https://api.fireworks.ai/inference/v1";
export const STABILITY_AI_API_URL =
  "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
export const MISTRAL_AI_API_URL = "https://api.mistral.ai/v1";
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
export const MONOLYTH_API_URL = "https://api.monolyth.ai/v1";

export const getBaseURL = (modelName: string) => {
  switch (modelName) {
    case "gpt-3.5-turbo-1106":
    case "gpt-3.5-turbo":
    case "gpt-4-1106-preview":
    case "gpt-4-turbo-preview":
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
    case "soliloquy-l3":
      return MONOLYTH_API_URL;
    default:
      return OPENROUTER_API_URL;
  }
};

export const getAPIKey = (modelName: string) => {
  switch (modelName) {
    case "gpt-3.5-turbo-1106":
    case "gpt-3.5-turbo":
    case "gpt-4-1106-preview":
    case "gpt-4-turbo-preview":
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
    case "soliloquy-l3":
      return process.env.MONOLYTH_API_KEY;
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
  return model ? model.crystalPrice : modelName === "auto" ? 10 : 5;
};

export const getImageModelCrystalPrice = (modelName: string) => {
  const model = imageModelData.find((m) => m.value === modelName);
  return model ? model.crystalPrice : 4;
};

// Model metadata is hard-coded due to frequent updates in open-source LLM.
export const modelData = [
  {
    value: "soliloquy-l3",
    description: "Soliloquy L3 by Lynn",
    crystalPrice: 0,
    isNSFW: false,
  },
  {
    value: "anthropic/claude-3-haiku",
    description: "Anthropic Haiku",
    crystalPrice: 1,
    isNSFW: false,
  },
  {
    value: "anthropic/claude-3-sonnet",
    description: "Anthropic Sonnet",
    crystalPrice: 5,
    isNSFW: false,
  },
  {
    value: "anthropic/claude-3-opus",
    description: "Anthropic Opus",
    crystalPrice: 10,
    isNSFW: false,
  },
  {
    value: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    description: "Nous Hermes 2 Mixtral 8x7B DPO",
    crystalPrice: 1,
    isNSFW: false,
  },
  {
    value: "gpt-3.5-turbo",
    description: "GPT-3.5 Turbo by OpenAI",
    src: "/models/openai.png",
    alt: "Company logo of Open AI",
    crystalPrice: 1,
  },
  {
    value: "gpt-4-turbo-preview",
    description: "GPT-4 Turbo by OpenAI",
    src: "/models/openai.png",
    alt: "Company logo of Open AI",
    crystalPrice: 10,
  },
  {
    value: "openrouter/auto",
    description: "Auto (GPT-4 and Mistral-Medium)",
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
    value: "gryphe/mythomax-l2-13b",
    description: "Uncensored, Mythomax L2 13B by Gryphe",
    crystalPrice: 1,
    isNSFW: true,
  },
  {
    value: "undi95/remm-slerp-l2-13b",
    description: "Uncensored, Re:MythoMax (ReMM) L2 13B",
    isNSFW: true,
    crystalPrice: 2,
  },
  {
    value: "gryphe/mythomax-l2-13b-8k",
    description: "Uncensored, Mythomax L2 13B 8K by Gryphe",
    crystalPrice: 2,
    isNSFW: true,
  },
  {
    value: "jondurbin/airoboros-l2-70b",
    description: "Uncensored, Airobos L2 70B by Jon Durbin",
    crystalPrice: 2,
    isNSFW: true,
  },
  {
    value: "undi95/toppy-m-7b",
    description: "Uncensored, Toppy M 7B by undi95",
    isNSFW: true,
    crystalPrice: 1,
  },
  {
    value: "undi95/toppy-m-7b:free",
    description: "Uncensored, Toppy M 7B by undi95 with Rate Limit",
    isNSFW: true,
    crystalPrice: 0.05,
  },
  {
    value: "pygmalionai/mythalion-13b",
    description: "Uncensored, Mythalion 13B by PygmalionAI",
    isNSFW: true,
    crystalPrice: 2,
  },
  {
    value: "lizpreciatior/lzlv-70b-fp16-hf",
    description: "Uncensored, lzlv 70B by lizpreciatior",
    isNSFW: true,
    crystalPrice: 2,
  },
  {
    value: "neversleep/noromaid-20b",
    description: "Uncensored, Noromaid 20B by Never Sleep",
    isNSFW: true,
    crystalPrice: 4,
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
    crystalPrice: 4,
  },
  {
    value: "nousresearch/nous-capybara-7b:free",
    description: "Copybara 7B by Nous Research",
    crystalPrice: 0.05,
  },
  {
    value: "mistralai/mistral-7b-instruct:free",
    description: "Mistral 7B by Mistral AI",
    crystalPrice: 0.05,
  },
  {
    value: "huggingfaceh4/zephyr-7b-beta:free",
    description: "Zephyr 7B by Hugging Face",
    crystalPrice: 0.05,
  },
  {
    value: "openchat/openchat-7b:free",
    description: "Openchat 7B by Open Chat",
    crystalPrice: 0.05,
  },
  {
    value: "gryphe/mythomist-7b:free",
    description: "Mythomist 7B by Gryphe",
    crystalPrice: 0.05,
  },
  {
    value: "openrouter/cinematika-7b",
    description: "Cinematika 7B by Open Router",
    crystalPrice: 0.05,
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
    value: "lucataco/sdxl-lightning-4step",
    description: "SDXL Lightning - Cost efficient, High quality images.",
    license: "openrail++",
    crystalPrice: 1,
  },
  {
    value: "daun-io/openroleplay.ai-animagine-v3",
    description: "Animagine XL 3.0 - High-resolution, detailed anime images.",
    license: "Fair AI Public License 1.0-SD",
    crystalPrice: 6,
  },
  {
    value: "asiryan/blue-pencil-xl-v2",
    description: "Blue Pencil XL V2 - High-resolution, detailed anime images.",
    license: "creativeml-openrail-ml",
    crystalPrice: 6,
  },
  {
    value: "asiryan/meina-mix-v11",
    description: "MeinaMix V11 - High-resolution, detailed anime images.",
    license: "creativeml-openrail-ml",
    crystalPrice: 6,
  },
  {
    value: "pagebrain/dreamshaper-v8",
    description: "Dream Shaper V8 - 'A better Stable Diffusion'",
    license: "creativeml-openrail-ml",
    crystalPrice: 7,
  },
  {
    value: "asiryan/juggernaut-xl-v7",
    description:
      "Juggernaut XL v7 Model - Photorealistic, high quality images.",
    license: "creativeml-openrail-ml",
    crystalPrice: 8,
  },
  {
    value: "dall-e-3",
    description: "Dall-E 3 by Open AI",
    crystalPrice: 75,
  },
];

export const voiceData = [
  {
    value: "4JVOFy4SLQs9my0OLhEw",
    description: "Luca",
    crystalPrice: 15,
    sampleUrl:
      "https://p.role.fun/voice%2Fmale_luca_4JVOFy4SLQs9my0OLhEw.mp3",
  },
  {
    value: "2zRM7PkgwBPiau2jvVXc",
    description: "Monika Sogam",
    crystalPrice: 15,
    sampleUrl:
      "https://p.role.fun/voice%2Ffemale_monika_2zRM7PkgwBPiau2jvVXc.mp3",
  },
];

export const TranslationModelData = [
  {
    value: "deepl",
    description: "DeepL - Machine Translation API",
    crystalPrice: 2,
  },
];

export const crystalDollarPrice = {
  150: "99",
  1650: "499",
  5450: "1499",
  11200: "2999",
  19400: "4999",
  90000: "9999",
};
