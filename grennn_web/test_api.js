import axios from 'axios';
import process from 'node:process';

const testAPI = async () => {
  try {
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      throw new Error('Missing SILICONFLOW_API_KEY');
    }

    console.log('Testing SiliconFlow API...');
    const response = await axios.post(
      'https://api.siliconflow.cn/v1/chat/completions',
      {
        model: 'Qwen/QwQ-32B',
        messages: [
          {
            role: 'user',
            content: 'Hello, are you working?',
          },
        ],
        stream: false,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('API Response:', response.data);
    console.log('Success!');
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
};

testAPI();
