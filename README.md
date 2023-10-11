<h1 align="center">
  🚅 LiteLLM.js
</h1>
<p align="center">
    <p align="center">JavaScript implementation of <a href="https://github.com/BerriAI/litellm">LiteLLM</a>. </p>
</p>

# Usage

```
npm install litellm
```

```ts
import { completion } from 'litellm';
process.env['OPENAI_API_KEY'] = 'your-openai-key';

const response = await completion({
  model: 'gpt-3.5-turbo',
  messages: [{ content: 'Hello, how are you?', role: 'user' }],
});

// or stream the results
const stream = await completion({
  model: "gpt-3.5-turbo",
  messages: [{ content: "Hello, how are you?", role: "user" }],
  stream: true
});

for await (const part of stream) {
  process.stdout.write(part.choices[0]?.delta?.content || "");
}
```

# Features
We aim to support all features that [LiteLLM python package](https://github.com/BerriAI/litellm) supports.

* Standardised completion 🚧
* Caching ❌
* Proxy ❌

## Supported Providers
| Provider | Completion | Streaming |
| ------------- | ------------- | ------------- | 
| [openai](https://docs.litellm.ai/docs/providers/openai)  | ✅ | ✅  |
| [cohere](https://docs.litellm.ai/docs/providers/cohere)  | ✅  | ✅  |
| [anthropic](https://docs.litellm.ai/docs/providers/anthropic)  | ✅ | ✅ |
| [ollama](https://docs.litellm.ai/docs/providers/ollama)  | ✅ | ✅ |
| [replicate](https://docs.litellm.ai/docs/providers/replicate)  | ❌ | ❌ |
| [huggingface](https://docs.litellm.ai/docs/providers/huggingface)  | ❌ | ❌ |
| [together_ai](https://docs.litellm.ai/docs/providers/togetherai)  | ❌ | ❌ |
| [openrouter](https://docs.litellm.ai/docs/providers/openrouter)  | ❌ | ❌ |
| [vertex_ai](https://docs.litellm.ai/docs/providers/vertex)  | ❌ | ❌ |
| [palm](https://docs.litellm.ai/docs/providers/palm)  | ❌ | ❌ |
| [ai21](https://docs.litellm.ai/docs/providers/ai21)  | ❌ | ❌ |
| [baseten](https://docs.litellm.ai/docs/providers/baseten)  | ❌ | ❌ |
| [azure](https://docs.litellm.ai/docs/providers/azure)  | ❌ | ❌ |
| [sagemaker](https://docs.litellm.ai/docs/providers/aws_sagemaker)  | ❌ | ❌ |
| [bedrock](https://docs.litellm.ai/docs/providers/bedrock)  | ❌ | ❌ |
| [vllm](https://docs.litellm.ai/docs/providers/vllm)  | ❌ | ❌ |
| [nlp_cloud](https://docs.litellm.ai/docs/providers/nlp_cloud)  | ❌ | ❌ |
| [aleph alpha](https://docs.litellm.ai/docs/providers/aleph_alpha)  | ❌ | ❌ |
| [petals](https://docs.litellm.ai/docs/providers/petals)  | ❌ | ❌ |
| [deepinfra](https://docs.litellm.ai/docs/providers/deepinfra)  | ❌ | ❌ |

# Development

## Clone the repo
```
git clone https://github.com/zya/litellmjs.git
```

## Install dependencies
```
npm install
```

## Run unit tests
```
npm t
```

## Run E2E tests
First copy the example env file.

```
cp .example.env .env
```

Then fill the variables with your API keys to be able to run the E2E tests.

```
OPENAI_API_KEY=<Your OpenAI API key>
....
```

Then run the command below to run the tests
```
npm run test:e2e
```