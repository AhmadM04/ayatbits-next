import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models
    try {
      const models = await genAI.listModels();
      return NextResponse.json({
        success: true,
        apiKeyExists: true,
        apiKeyLength: apiKey.length,
        models: models,
      });
    } catch (modelError: any) {
      return NextResponse.json({
        success: false,
        apiKeyExists: true,
        apiKeyLength: apiKey.length,
        error: modelError.message,
        details: modelError,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

