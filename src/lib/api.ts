const API_URL = "https://api.datamuse.com/words?sp=";

const apiEndpoint = (word: string) => `${API_URL}${word}`;

// 添加超时函数
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
};

const fetchWords = async (word: string): Promise<boolean> => {
  if (!word || word.trim() === '') {
    console.warn('Empty word provided to fetchWords');
    return false;
  }

  try {
    // 使用Promise.race实现超时控制（5秒超时）
    const fetchPromise = fetch(apiEndpoint(word.toLowerCase()));
    const response = await Promise.race([
      fetchPromise,
      timeoutPromise(5000)
    ]) as Response;

    // 检查响应状态
    if (!response.ok) {
      console.warn(`API response not OK: ${response.status} ${response.statusText}`);
      // API失败时，对于常见单词返回true（备用验证）
      return isCommonWord(word);
    }

    const data = await response.json();
    
    // 检查返回数据的格式
    if (!Array.isArray(data)) {
      console.warn('API returned invalid data format');
      return isCommonWord(word);
    }

    return data.length > 0;
    
  } catch (error) {
    console.error('fetchWords error:', error);
    
    // 网络错误时使用备用验证
    return isCommonWord(word);
  }
};

// 备用验证：检查是否为常见单词模式
const isCommonWord = (word: string): boolean => {
  if (!word || word.length < 3 || word.length > 8) {
    return false;
  }

  // 检查是否只包含字母
  if (!/^[a-zA-Z]+$/.test(word)) {
    return false;
  }

  // 基本的英语单词模式检查
  const commonPatterns = [
    /^[aeiou]/i,  // 元音开头
    /[aeiou]/i,   // 包含元音
    /^(th|sh|ch|wh|st|sp|sc|sm|sn|sw|tr|dr|br|gr|fr|pr|cr|bl|cl|fl|gl|pl|sl)/i, // 常见开头
  ];

  // 至少匹配一个常见模式
  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(word));
  
  if (!hasCommonPattern) {
    console.warn(`Word "${word}" doesn't match common English patterns`);
    return false;
  }

  return true;  // 在网络问题时对符合基本模式的单词返回true
};

export const fetcher = (...args: [RequestInfo, RequestInit?]) => 
  fetch(...args).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });

export default fetchWords;
