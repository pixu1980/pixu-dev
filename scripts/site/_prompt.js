import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

let promptInterface;

export function canPrompt(options = {}) {
  return Boolean(options.force || (input.isTTY && output.isTTY));
}

function getPromptInterface() {
  promptInterface ??= createInterface({ input, output });
  return promptInterface;
}

export async function promptLine(message, options = {}) {
  if (!canPrompt(options)) return "";
  return (await getPromptInterface().question(message)).trim();
}

export async function promptYesNo(message, defaultValue = false, options = {}) {
  const suffix = defaultValue ? " [Y/n] " : " [y/N] ";
  const answer = (await promptLine(`${message}${suffix}`, options)).toLowerCase();

  if (!answer) return defaultValue;

  return ["y", "yes"].includes(answer);
}

export function closePrompt() {
  promptInterface?.close();
  promptInterface = undefined;
}
