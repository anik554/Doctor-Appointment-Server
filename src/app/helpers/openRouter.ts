import OpenAI from 'openai';
import config from '../../config';

export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openrouter_api_key,
});
