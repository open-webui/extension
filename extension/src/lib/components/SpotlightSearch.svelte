<script lang="ts">
  import { onMount } from "svelte";
  import { generateOpenAIChatCompletion, getModels } from "../apis";
  import { splitStream } from "../utils";

  let show = false;
  let showConfig = false;

  let url = "";
  let key = "";
  let model = "";

  let searchValue = "";
  let models = [];

  const resetConfig = () => {
    console.log("resetConfig");

    try {
      chrome.storage.local.clear().then(() => {
        console.log("Value is cleared");
      });
    } catch (error) {
      console.log(error);

      localStorage.setItem("url", "");
      localStorage.setItem("key", "");
      localStorage.setItem("model", "");
    }

    url = "";
    key = "";
    model = "";
    showConfig = true;
  };

  const submitHandler = (e) => {
    e.preventDefault();

    window.open(
      `${url}/?q=${encodeURIComponent(searchValue)}&models=${model}`,
      "_blank"
    );

    searchValue = "";
    show = false;
  };

  const initHandler = (e) => {
    e.preventDefault();

    try {
      chrome.storage.local
        .set({ url: url, key: key, model: model })
        .then(() => {
          console.log("Value is set");
        });
    } catch (error) {
      console.log(error);

      localStorage.setItem("url", url);
      localStorage.setItem("key", key);
      localStorage.setItem("model", model);
    }

    showConfig = false;
  };

  onMount(async () => {
    let _storageCache = null;

    try {
      _storageCache = await chrome.storage.local.get();
    } catch (error) {
      console.log(error);
    }

    if (_storageCache) {
      url = _storageCache.url ?? "";
      key = _storageCache.key ?? "";
      model = _storageCache.model ?? "";
      if (_storageCache.url && _storageCache.key && _storageCache.model) {
        models = await getModels(_storageCache.key, _storageCache.url);
        showConfig = false;
      }
    }

    const down = async (e) => {
      // Reset the configuration when ⌘Shift+Escape is pressed
      if (show && e.shiftKey && e.key === "Escape") {
        resetConfig();
      } else if (e.key === "Escape") {
        show = false;
      }

      if (
        e.key === " " &&
        (e.metaKey || e.ctrlKey) &&
        (e.shiftKey || e.altKey)
      ) {
        e.preventDefault();

        try {
          const response = await chrome.runtime.sendMessage({
            action: "getSelection",
          });

          if (response?.data ?? false) {
            searchValue = response.data;
          }
        } catch (error) {
          console.log("catch", error);
        }

        show = !show;

        setTimeout(() => {
          const inputElement = document.getElementById(
            "open-webui-search-input"
          );

          if (inputElement) {
            inputElement.focus();
          }
        }, 0);
      }

      if (key !== "" && url !== "") {
        if (
          e.key === "Enter" &&
          (e.metaKey || e.ctrlKey) &&
          (e.shiftKey || e.altKey)
        ) {
          e.preventDefault();

          try {
            const response = await chrome.runtime.sendMessage({
              action: "getSelection",
            });

            if (response?.data ?? false) {
              await chrome.runtime.sendMessage({
                action: "writeText",
                text: "\n",
              });

              const [res, controller] = await generateOpenAIChatCompletion(
                key,
                {
                  model: model,
                  messages: [
                    {
                      role: "system",
                      content: "You are a helpful assistant.",
                    },
                    {
                      role: "user",
                      content: response.data,
                    },
                  ],
                  stream: true,
                },
                models.find((m) => m.id === model)?.url
              );

              if (res && res.ok) {
                const reader = res.body
                  .pipeThrough(new TextDecoderStream())
                  .pipeThrough(splitStream("\n"))
                  .getReader();

                while (true) {
                  const { value, done } = await reader.read();
                  if (done) {
                    break;
                  }

                  try {
                    let lines = value.split("\n");
                    for (const line of lines) {
                      if (line !== "") {
                        console.log(line);
                        if (line === "data: [DONE]") {
                          console.log("DONE");
                        } else {
                          let data = JSON.parse(line.replace(/^data: /, ""));
                          console.log(data);

                          if ("request_id" in data) {
                            console.log(data.request_id);
                          } else {
                            await chrome.runtime.sendMessage({
                              action: "writeText",
                              text: data.choices[0].delta.content ?? "",
                            });
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="tlwd-fixed tlwd-top-0 tlwd-right-0 tlwd-left-0 tlwd-bottom-0 tlwd-w-full tlwd-min-h-screen tlwd-h-screen tlwd-flex tlwd-justify-center tlwd-z-[9999999999] tlwd-overflow-hidden tlwd-overscroll-contain"
    on:mousedown={() => {
      show = false;
    }}
  >
    {#if showConfig}
      <div class=" tlwd-m-auto tlwd-max-w-sm tlwd-w-full tlwd-pb-32">
        <div
          class="tlwd-w-full tlwd-flex tlwd-flex-col tlwd-justify-between tlwd-py-2.5 tlwd-px-3.5 tlwd-rounded-2xl tlwd-outline tlwd-outline-1 tlwd-outline-gray-850 tlwd-backdrop-blur-3xl tlwd-bg-gray-850/70 shadow-4xl modal-animation"
        >
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <form
            class="tlwd-text-gray-200 tlwd-w-full tlwd-p-0 tlwd-m-0"
            on:submit={initHandler}
            on:mousedown={(e) => {
              e.stopPropagation();
            }}
            autocomplete="off"
          >
            <div class="tlwd-flex tlwd-items-center tlwd-gap-2 tlwd-w-full">
              <div class=" tlwd-flex tlwd-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={2.5}
                  stroke="currentColor"
                  class="tlwd-size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
              </div>
              <input
                id="open-webui-url-input"
                placeholder="Open WebUI URL"
                class="tlwd-p-0 tlwd-m-0 tlwd-text-xl tlwd-w-full tlwd-font-medium tlwd-bg-transparent tlwd-border-none placeholder:tlwd-text-gray-500 tlwd-text-neutral-100 tlwd-outline-none"
                bind:value={url}
                autocomplete="one-time-code"
                required
              />
            </div>
            <div
              class="tlwd-flex tlwd-items-center tlwd-gap-2 tlwd-w-full tlwd-mt-2"
            >
              <div class=" tlwd-flex tlwd-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={2.5}
                  stroke="currentColor"
                  class="tlwd-size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              </div>
              <input
                placeholder="Open WebUI API Key"
                class="tlwd-p-0 tlwd-m-0 tlwd-text-xl tlwd-w-full tlwd-font-medium tlwd-bg-transparent tlwd-border-none placeholder:tlwd-text-gray-500 tlwd-text-neutral-100 tlwd-outline-none"
                bind:value={key}
                autocomplete="one-time-code"
                required
              />
              <button
                class=" tlwd-flex tlwd-items-center tlwd-bg-transparent tlwd-text-neutral-100 tlwd-cursor-pointer tlwd-p-0 tlwd-m-0 tlwd-outline-none tlwd-border-none"
                type="button"
                on:click={async () => {
                  if (url.endsWith("/")) {
                    url = url.slice(0, -1);
                  }

                  models = await getModels(key, url);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={2.5}
                  stroke="currentColor"
                  class="tlwd-size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>

            {#if models && models.length > 0}
              <div
                class="tlwd-flex tlwd-items-center tlwd-gap-2 tlwd-w-full tlwd-mt-2"
              >
                <div class=" tlwd-flex tlwd-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width={2.5}
                    stroke="currentColor"
                    class="tlwd-size-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                  </svg>
                </div>
                <select
                  id="open-webui-model-input"
                  class="tlwd-p-0 tlwd-m-0 tlwd-text-xl tlwd-w-full tlwd-font-medium tlwd-bg-transparent tlwd-border-none placeholder:tlwd-text-gray-500 tlwd-text-neutral-100 tlwd-outline-none"
                  bind:value={model}
                  autocomplete="off"
                  required
                >
                  <option value="">Select a model</option>
                  {#each models as model}
                    <option value={model.id}>{model.name ?? model.id}</option>
                  {/each}
                </select>
                <button
                  class=" tlwd-flex tlwd-items-center tlwd-bg-transparent tlwd-text-neutral-100 tlwd-cursor-pointer tlwd-p-0 tlwd-m-0 tlwd-outline-none tlwd-border-none"
                  type="submit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width={2.5}
                    stroke="currentColor"
                    class="tlwd-size-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </button>
              </div>
            {/if}
          </form>
        </div>
      </div>
    {:else}
      <div class=" tlwd-m-auto tlwd-max-w-xl tlwd-w-full tlwd-pb-32">
        <div
          class="tlwd-w-full tlwd-flex tlwd-flex-col tlwd-justify-between tlwd-py-2.5 tlwd-px-3.5 tlwd-rounded-2xl tlwd-outline tlwd-outline-1 tlwd-outline-gray-850 tlwd-backdrop-blur-3xl tlwd-bg-gray-850/70 shadow-4xl modal-animation"
        >
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <form
            class="tlwd-text-gray-200 tlwd-w-full tlwd-p-0 tlwd-m-0"
            on:submit={submitHandler}
            on:mousedown={(e) => {
              e.stopPropagation();
            }}
            autocomplete="off"
          >
            <div class="tlwd-flex tlwd-items-center tlwd-gap-2 tlwd-w-full">
              <div class=" tlwd-flex tlwd-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={2.5}
                  stroke="currentColor"
                  class="tlwd-size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <input
                id="open-webui-search-input"
                placeholder="Search Open WebUI"
                class="tlwd-p-0 tlwd-m-0 tlwd-text-xl tlwd-w-full tlwd-font-medium tlwd-bg-transparent tlwd-border-none placeholder:tlwd-text-gray-500 tlwd-text-neutral-100 tlwd-outline-none"
                bind:value={searchValue}
                autocomplete="one-time-code"
              />
            </div>

            <div class=" tlwd-flex tlwd-justify-end tlwd-gap-1">
              <p
                class="tlwd-text-right tlwd-text-[0.7rem] tlwd-p-0 tlwd-m-0 tlwd-text-neutral-300"
              >
                Press ⌘Space+Shift to toggle
              </p>
              <button
                class=" tlwd-flex tlwd-items-center tlwd-bg-transparent tlwd-text-neutral-100 tlwd-cursor-pointer tlwd-p-0 tlwd-m-0 tlwd-outline-none tlwd-border-none"
                type="button"
                on:click={() => {
                  showConfig = true;
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={2.5}
                  stroke="currentColor"
                  class="tlwd-size-3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}
  </div>
{/if}
