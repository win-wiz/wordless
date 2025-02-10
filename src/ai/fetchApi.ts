import { WORD_PROMPT } from "./prompts";

// 添加一个简单的内存缓存来记录最近生成的单词
const recentWordsCache: { [key: number]: Set<string> } = {};
const MAX_CACHE_SIZE = 10; // 记录每个长度最近10个单词

export async function fetchApi(
  url: string, 
  model: string,
  length: number,
  apiKey: string
) {
  // 初始化缓存
  if (!recentWordsCache[length]) {
    recentWordsCache[length] = new Set();
  }

  const bodyData = {
    model,
    messages: [
      {
        role: 'system',
        content: WORD_PROMPT
      },
      {
        role: 'user',
        content: `请创造性地生成一个${length}个字母的单词，避免使用这些最近用过的单词：${Array.from(recentWordsCache[length]).join(', ')}`
      },
    ],
    parameters: {
      temperature: 1.5,        // 增加更多随机性
      top_p: 0.95,            // 增加更多可能性
      frequency_penalty: 1.5,  // 进一步降低重复的可能
      presence_penalty: 1.5,   // 更强烈地鼓励新词
      stream: false,
      max_tokens: 250,
    }
  };

  // console.log('Request URL:', url);
  // console.log('Request Body:', bodyData);

  try {
    const response = await fetch('/api/ai-completion', {  // 使用本地API路由
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    // console.log('response====>>>', response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    };

    // console.log('data====>>>', data);

    // 获取AI返回的内容
    const content = data.choices[0]?.message.content || '';
    
    // 清理内容，移除可能的markdown标记
    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const parsed = JSON.parse(jsonContent);

      // console.log('parsed====>>>', parsed);
      
      // 确保返回的是正确格式的数据
      if (Array.isArray(parsed.words)) {
        const validWords = parsed.words.filter((word: string) => 
          typeof word === 'string' && 
          word.length === length
        );

        // 更新缓存
        if (validWords.length > 0) {
          const word = validWords[0].toUpperCase();
          recentWordsCache[length].add(word);
          
          // 限制缓存大小
          if (recentWordsCache[length].size > MAX_CACHE_SIZE) {
            const values = Array.from(recentWordsCache[length]);
            recentWordsCache[length] = new Set(values.slice(-MAX_CACHE_SIZE));
          }
        }

        return {
          [length]: validWords
        };
      }
      
      throw new Error('Invalid response format');
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        [length]: []
      };
    }

  } catch (err) {
    console.error('fetchApi error:', err);
    return {
      [length]: []
    };
  }
}