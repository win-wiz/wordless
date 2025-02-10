import { fetchApi } from "./fetchApi";

export async function wordAiSearch(length: number, env: Record<string, string>) {
  const result = await fetchApi(env.DOUBAO_BASE_URL + '/chat/completions', env.DOUBAO_LINK_128K_MODEL!, length, env.DOUBAO_OPENAI_API_KEY!);
  return result;
}