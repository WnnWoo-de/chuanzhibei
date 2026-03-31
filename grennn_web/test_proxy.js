import axios from 'axios';

const testProxy = async () => {
  try {
    console.log('Testing Local Proxy...');
    const response = await axios.post(
      'http://localhost:5173/siliconflow-api/v1/chat/completions',
      {
        model: 'Qwen/QwQ-32B',
        messages: [
          {
            role: 'user',
            content: 'Test proxy',
          },
        ],
        stream: false,
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Proxy Response:', response.data);
    console.log('Proxy Success!');
  } catch (error) {
    console.error('Proxy Error:', error.response ? error.response.data : error.message);
  }
};

testProxy();
