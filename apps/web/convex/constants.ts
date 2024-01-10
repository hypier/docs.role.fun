export const SIGN_UP_FREE_CRYSTALS = 100;
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
  switch (modelName) {
    case "mixtral-8x7b-instruct":
      return 1;
    case "mistral-7b-instruct":
      return 1;
    case "pplx-7b-chat":
      return 1;
    case "pplx-7b-online":
      return 1;
    case "pplx-70b-online":
      return 1;
    case "pplx-70b-chat":
      return 1;
    case "accounts/fireworks/models/qwen-14b-chat":
      return 1;
    case "gpt-3.5-turbo-1106":
      return 1;
    // free models
    case "nousresearch/nous-capybara-7b":
    case "mistralai/mistral-7b-instruct":
    case "huggingfaceh4/zephyr-7b-beta":
    case "openchat/openchat-7b":
    case "gryphe/mythomist-7b":
    case "openrouter/cinematika-7b":
      return 0;
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
      return 1;
    // 3 crystal models
    case "neversleep/noromaid-mixtral-8x7b-instruct":
    case "neversleep/noromaid-20b":
    case "migtissera/synthia-70b":
      return 3;
    // 5 crystal models
    case "haotian-liu/llava-13b":
    case "nousresearch/nous-hermes-2-vision-7b":
      return 5;
    // 10 crytstal models
    case "anthropic/claude-2":
      return 10;
    case "stable-diffusion-xl-1024-v1-0":
      return 25;
    case "gpt-4-1106-preview":
      return 10;
    case "dalle-3":
      return 75;
    case "mistral-tiny":
      return 1;
    case "mistral-small":
      return 2;
    case "mistral-medium":
      return 10;
    default:
      return 5;
  }
};

export const crystalDollarPrice = {
  300: "99",
  1650: "499",
  5450: "1499",
  11200: "2999",
  19400: "4999",
  90000: "9999",
};
