export const getOpenAIModels = async (token = "", url = "") => {
  let error = null;

  const res = await fetch(`${url}/models`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token && { authorization: `Bearer ${token}` }),
    },
  })
    .then(async (res) => {
      if (!res.ok) throw await res.json();
      return res.json();
    })
    .catch((err) => {
      error = `OpenAI: ${err?.error?.message ?? "Network Problem"}`;
      return [];
    });

  if (error) {
    throw error;
  }

  const models = Array.isArray(res) ? res : res?.data ?? null;

  return models
    ? models
        .map((model) => ({
          id: model.id,
          name: model.name ?? model.id,
          url: url,
          custom_info: model.custom_info,
        }))
        .sort((a, b) => {
          return a.name.localeCompare(b.name);
        })
    : models;
};

export const getModels = async (key, url) => {
  let models = await Promise.all([
    getOpenAIModels(key, `${url}/ollama/v1`).catch((error) => {
      console.log(error);
      return null;
    }),
    getOpenAIModels(key, `${url}/openai/api`).catch((error) => {
      console.log(error);
      return null;
    }),
  ]);

  models = models
    .filter((models) => models)
    .reduce((a, e, i, arr) => a.concat(e), []);

  console.log(models);

  return models;
};

export const generateOpenAIChatCompletion = async (
  api_key = "",
  body = {},
  url = "http://localhost:8080"
) => {
  const controller = new AbortController();
  let error = null;

  const res = await fetch(`${url}/chat/completions`, {
    signal: controller.signal,
    method: "POST",
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch((err) => {
    console.log(err);
    error = err;
    return null;
  });

  if (error) {
    throw error;
  }

  return [res, controller];
};
