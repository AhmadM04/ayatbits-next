import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Try multiple model names to find which one works
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro',
    ];

    const results: any[] = [];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: 'Say "Hello"',
        });
        
        const text = response.text || '';
        
        results.push({
          model: modelName,
          success: true,
          response: text,
        });
        
        // If we found a working model, return success immediately
        return NextResponse.json({
          success: true,
          workingModel: modelName,
          apiKeyValid: true,
          testResponse: text,
          message: `Found working model: ${modelName}`,
        });
      } catch (modelError: any) {
        results.push({
          model: modelName,
          success: false,
          error: modelError.message,
          status: modelError.status,
        });
      }
    }

    // If we get here, none of the models worked
    return NextResponse.json({
      success: false,
      apiKeyExists: true,
      apiKeyLength: apiKey.length,
      message: 'None of the models worked',
      attemptedModels: results,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

