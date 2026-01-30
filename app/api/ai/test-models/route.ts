import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to create a model and send a simple test message
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Say "Hello"');
      const response = await result.response;
      const text = response.text();
      
      return NextResponse.json({
        success: true,
        apiKeyExists: true,
        apiKeyLength: apiKey.length,
        message: 'API key is working! Model responded.',
        testResponse: text,
      });
    } catch (modelError: any) {
      return NextResponse.json({
        success: false,
        apiKeyExists: true,
        apiKeyLength: apiKey.length,
        error: modelError.message,
        status: modelError.status,
        statusText: modelError.statusText,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

