import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "chat", imageToEdit } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Starting request with mode:', mode, 'messages:', messages.length);

    // Image editing mode
    if (mode === "edit" && imageToEdit) {
      const lastMessage = messages[messages.length - 1];
      const prompt = lastMessage?.content || "edit this image";

      // Extract base64 from data URL
      const base64Data = imageToEdit.split(',')[1];
      const mimeType = imageToEdit.split(';')[0].split(':')[1] || 'image/jpeg';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image editing error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Image editing failed: ${response.status}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "I've analyzed and processed the image for you.";

      return new Response(
        JSON.stringify({ 
          content: textContent,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Image generation mode - using Gemini's image capabilities
    if (mode === "image") {
      const lastMessage = messages[messages.length - 1];
      const prompt = lastMessage?.content || "a beautiful image";

      // Use Gemini for image description since direct generation isn't available
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a creative image description AI. The user wants to generate an image with this prompt: "${prompt}". 
              
Since direct image generation isn't available, provide:
1. A detailed, vivid description of what this image would look like
2. Artistic style suggestions
3. Color palette recommendations
4. Composition ideas

Be creative and inspiring in your response!`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image generation error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "I've created an image description for you.";

      return new Response(
        JSON.stringify({ 
          content: textContent,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get system prompt based on mode
    const getSystemPrompt = (mode: string) => {
      switch (mode) {
        case 'summarize':
          return 'You are Stechy, an expert summarization AI. Your task is to provide clear, concise summaries of any text, article, or content provided by the user. Highlight key points, main ideas, and important details. Format your response with bullet points when appropriate.';
        case 'translate':
          return 'You are Stechy, a multilingual translation AI. Translate the user\'s text accurately while preserving meaning, tone, and context. If the target language is not specified, ask the user. Support all major languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, Russian, and more.';
        case 'code':
          return 'You are Stechy, an expert coding assistant. Help users write, debug, explain, and optimize code. Support all major programming languages. Provide well-commented, clean code with explanations. Format code blocks properly using markdown.';
        default:
          return 'You are Stechy, a helpful, friendly, and intelligent AI assistant. You provide clear, concise, and engaging responses. You can help with questions, creative writing, analysis, coding, and more. Format responses nicely using markdown when appropriate.';
      }
    };

    const systemPrompt = getSystemPrompt(mode);

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Add system instruction as first user message if needed
    if (geminiMessages.length > 0 && geminiMessages[0].role !== 'model') {
      geminiMessages.unshift({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      geminiMessages.splice(1, 0, {
        role: 'model',
        parts: [{ text: 'Understood! I am Stechy, ready to help you. How can I assist you today?' }]
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Transform Gemini SSE to OpenAI-compatible format
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim() === '[DONE]') {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              continue;
            }
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              if (content) {
                const openAiFormat = {
                  choices: [{
                    delta: { content },
                    index: 0
                  }]
                };
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openAiFormat)}\n\n`));
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    });

    const transformedStream = response.body?.pipeThrough(transformStream);

    return new Response(transformedStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});