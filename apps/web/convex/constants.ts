export const SIGN_UP_FREE_CRYSTALS = 50;
export const DIVIDEND_RATE = 0.05;
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
      return OPENAI_API_URL;
    case "mixtral-8x7b-instruct":
    case "mistral-7b-instruct":
    case "pplx-7b-online":
    case "pplx-7b-chat":
    case "pplx-70b-online":
    case "pplx-70b-chat":
      return PERPLEXITY_API_URL;
    case "accounts/fireworks/models/qwen-14b-chat":
      return FIREWORK_API_URL;
    case "mistral-tiny":
    case "mistral-small":
    case "mistral-medium":
      return MISTRAL_AI_API_URL;
    // free models
    case "nousresearch/nous-capybara-7b":
    case "mistralai/mistral-7b-instruct":
    case "huggingfaceh4/zephyr-7b-beta":
    case "openchat/openchat-7b":
    case "gryphe/mythomist-7b":
    case "openrouter/cinematika-7b":
    // 1 crystal models
    case "nousresearch/nous-hermes-llama2-13b":
    case "austism/chronos-hermes-13b":
    case "jebcarter/psyfighter-13b":
    case "koboldai/psyfighter-13b-2":
    case "meta-llama/codellama-34b-instruct":
    case "phind/phind-codellama-34b":
    case "intel/neural-chat-7b":
    case "mistralai/mixtral-8x7b-instruct":
    case "meta-llama/llama-2-13b-chat":
    case "meta-llama/llama-2-70b-chat":
    case "nousresearch/nous-hermes-llama2-70b":
    case "nousresearch/nous-capybara-34b":
    case "gryphe/mythomax-l2-13b-8k":
    case "jondurbin/airoboros-l2-70b":
    case "google/gemini-pro":
    case "teknium/openhermes-2-mistral-7b":
    case "anthropic/claude-instant-v1":
    case "cognitivecomputations/dolphin-mixtral-8x7b":
    case "lizpreciatior/lzlv-70b-fp16-hf":
    // 3 crystal models
    case "neversleep/noromaid-mixtral-8x7b-instruct":
    case "neversleep/noromaid-20b":
    case "migtissera/synthia-70b":
    // 5 crystal models
    case "haotian-liu/llava-13b":
    case "nousresearch/nous-hermes-2-vision-7b":
    // 10 crytstal models
    case "anthropic/claude-2":
    // Auto
    case "openrouter/auto":
      return OPENROUTER_API_URL;
    default:
      return OPENROUTER_API_URL;
  }
};

export const getAPIKey = (modelName: string) => {
  switch (modelName) {
    case "gpt-3.5-turbo-1106":
    case "gpt-4-1106-preview":
      return process.env.OPENAI_API_KEY;
    case "mixtral-8x7b-instruct":
    case "mistral-7b-instruct":
    case "pplx-7b-online":
    case "pplx-7b-chat":
    case "pplx-70b-online":
    case "pplx-70b-chat":
      return process.env.PERPLEXITY_API_KEY;
    case "accounts/fireworks/models/qwen-14b-chat":
      return process.env.FIREWORKS_API_KEY;
    case "mistral-tiny":
    case "mistral-small":
    case "mistral-medium":
      return process.env.MISTRAL_API_KEY;
    // free models
    case "nousresearch/nous-capybara-7b":
    case "mistralai/mistral-7b-instruct":
    case "huggingfaceh4/zephyr-7b-beta":
    case "openchat/openchat-7b":
    case "gryphe/mythomist-7b":
    case "openrouter/cinematika-7b":
    case "rwkv/rwkv-5-world-3b":
    case "recursal/rwkv-5-3b-ai-town":
    // 1 crystal models
    case "nousresearch/nous-hermes-llama2-13b":
    case "austism/chronos-hermes-13b":
    case "jebcarter/psyfighter-13b":
    case "koboldai/psyfighter-13b-2":
    case "meta-llama/codellama-34b-instruct":
    case "phind/phind-codellama-34b":
    case "intel/neural-chat-7b":
    case "mistralai/mixtral-8x7b-instruct":
    case "meta-llama/llama-2-13b-chat":
    case "meta-llama/llama-2-70b-chat":
    case "nousresearch/nous-hermes-llama2-70b":
    case "nousresearch/nous-capybara-34b":
    case "gryphe/mythomax-l2-13b-8k":
    case "jondurbin/airoboros-l2-70b":
    case "google/gemini-pro":
    case "teknium/openhermes-2-mistral-7b":
    case "anthropic/claude-instant-v1":
    case "cognitivecomputations/dolphin-mixtral-8x7b":
    case "lizpreciatior/lzlv-70b-fp16-hf":
    // 3 crystal models
    case "neversleep/noromaid-mixtral-8x7b-instruct":
    case "neversleep/noromaid-20b":
    case "migtissera/synthia-70b":
    // 5 crystal models
    case "haotian-liu/llava-13b":
    case "nousresearch/nous-hermes-2-vision-7b":
    // 10 crytstal models
    case "anthropic/claude-2":
    // Auto
    case "openrouter/auto":
      return process.env.OPENROUTER_API_KEY;
    default:
      return process.env.OPENROUTER_API_KEY;
  }
};

export const getRemindInstructionInterval = (modelName: string) => {
  switch (modelName) {
    case "mixtral-8x7b-instruct":
    case "mistral-7b-instruct":
    case "pplx-7b-online":
    case "pplx-7b-chat":
      return 16;
    case "accounts/fireworks/models/qwen-14b-chat":
    case "pplx-70b-online":
    case "pplx-70b-chat":
      return 64;
    case "mistral-tiny":
    case "mistral-small":
    case "mistral-medium":
      return 128;
    case "gpt-4-1106-preview":
      return 128;
    default:
      return 64;
  }
};

export const getCrystalPrice = (modelName: string) => {
  const allModels = [...modelData, ...imageModelData];
  const model = allModels.find((m) => m.value === modelName);
  return model ? model.crystalPrice : modelName === "auto" ? 9 : 5;
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
    crystalPrice: 9,
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
    value: "nousresearch/nous-capybara-7b",
    description: "Copybara 7B by Nous Research",
    crystalPrice: 1,
  },
  {
    value: "mistralai/mistral-7b-instruct",
    description: "Mistral 7B by Mistral AI",
    crystalPrice: 0,
  },
  {
    value: "huggingfaceh4/zephyr-7b-beta",
    description: "Zephyr 7B by Hugging Face",
    crystalPrice: 0,
  },
  {
    value: "openchat/openchat-7b",
    description: "Openchat 7B by Open Chat",
    crystalPrice: 0,
  },
  {
    value: "gryphe/mythomist-7b",
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
    value: "gryphe/mythomax-l2-13b-8k",
    description: "Mythomax L2 13B by Gryphe",
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
    value: "dalle-3",
    description: "Dall-E 3 by Open AI",
    crystalPrice: 75,
  },
  {
    value: "stable-diffusion-xl-1024-v1-0",
    description: "Stable Diffusion XL by Stability AI",
    crystalPrice: 25,
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
