import { ExperimentAnalysis } from '@/types/experiment';
import { SYSTEM_PROMPT, validateAndSanitizeAnalysis } from './schema';
import { analyzeQuestionWithMock } from './mockAnalyzer';

export async function analyzeQuestion(question: string): Promise<ExperimentAnalysis> {
  const trimmed = question?.trim();
  if (!trimmed) {
    throw new Error('Please enter a research question first.');
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. Try Groq (Ultra-Fast Cloud LPU Inference)
  if (groqApiKey) {
    const groqModels = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'groq/compound'];
    for (const model of groqModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: trimmed },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let content = data?.choices?.[0]?.message?.content;
          if (content) {
            // Strip any <think> tags if model emits them
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            const parsed = JSON.parse(content);
            return validateAndSanitizeAnalysis({ ...parsed, isMockFallback: false }, trimmed);
          }
        }
      } catch (err) {
        console.warn(`Groq model ${model} failed, trying next option:`, err);
      }
    }
  }

  // 2. Try Gemini if configured
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${SYSTEM_PROMPT}\n\nUSER QUESTION TO ANALYZE:\n"${trimmed}"` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return validateAndSanitizeAnalysis({ ...parsed, isMockFallback: false }, trimmed);
        }
      } else {
        console.warn('Gemini API call failed, falling back to mock analyzer:', response.status);
      }
    } catch (err) {
      console.warn('Gemini API request error, using fallback:', err);
    }
  }

  // 3. Try OpenAI if configured
  if (openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: trimmed },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return validateAndSanitizeAnalysis({ ...parsed, isMockFallback: false }, trimmed);
        }
      } else {
        console.warn('OpenAI API call failed, falling back to mock analyzer:', response.status);
      }
    } catch (err) {
      console.warn('OpenAI API error, using fallback:', err);
    }
  }

  // 4. Fallback: Intelligent Deterministic Mock Analyzer
  const mockResult = analyzeQuestionWithMock(trimmed);
  return validateAndSanitizeAnalysis(mockResult, trimmed);
}
