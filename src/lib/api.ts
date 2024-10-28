const API_URL = "https://api.datamuse.com/words?sp=";

const apiEndpoint = (word: string) => `${API_URL}${word}`;

const fetchWords = async (word: string) => {
  if (!word) return [];
  const response = await fetch(apiEndpoint(word));
  const data = await response.json();
  return data.length > 0;
};

export const fetcher = (...args: [RequestInfo, RequestInit?]) => fetch(...args).then((res) => res.json());

export default fetchWords;
