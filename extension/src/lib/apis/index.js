export const getModels = async (key, url) => {
  let error = null;

  const res = await fetch(`${url}/api/models`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(key && { authorization: `Bearer ${key}` }),
    },
  })
    .then(async (res) => {
      if (!res.ok) throw await res.json();
      return res.json();
    })
    .catch((err) => {
      console.log(err);
      error = err;
      return null;
    });

  if (error) {
    throw error;
  }

  let models = res?.data ?? [];

  models = models
    .filter((models) => models)
    .sort((a, b) => {
      // Compare case-insensitively
      const lowerA = a.name.toLowerCase();
      const lowerB = b.name.toLowerCase();

      if (lowerA < lowerB) return -1;
      if (lowerA > lowerB) return 1;

      // If same case-insensitively, sort by original strings,
      // lowercase will come before uppercase due to ASCII values
      if (a < b) return -1;
      if (a > b) return 1;

      return 0; // They are equal
    });

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
