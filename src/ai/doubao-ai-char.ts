
import { fetchApi } from './fetchApi';

export async function doubaoGenerateEmoji(
  count: number, 
  env: Record<string, string>
) {
  const url = env.DOUBAO_BASE_URL + '/chat/completions';
  const apiKey = env.DOUBAO_OPENAI_API_KEY;
  const model = env.DOUBAO_LINK_128K_MODEL;
  return await fetchApi(url, model!, count, apiKey!);
}