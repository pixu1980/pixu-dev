import { FETCH_TIMEOUT_MS, USER_AGENT } from "./_constants.js";

export async function fetchResponse(url, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Fetch failed ${response.status} for ${url}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchJson(url, headers = {}) {
  const response = await fetchResponse(url, {
    Accept: "application/vnd.github+json",
    ...headers,
  });

  return response.json();
}

export async function fetchText(url, headers = {}) {
  const response = await fetchResponse(url, headers);

  return response.text();
}
