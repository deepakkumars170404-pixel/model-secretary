import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ 
        error: "No API key provided. Please set your Gemini API Key in the Profile settings." 
      }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      // @ts-ignore
      tools: [{ googleSearch: {} }] 
    });

    // Fetch user context from database to ground the AI
    const profile = await prisma.userProfile.findFirst();
    const ownedProducts = await prisma.groomingProduct.findMany();
    const clothes = await prisma.clothingItem.findMany();
    const meals = await prisma.meal.findMany({
      orderBy: { eatenAt: 'desc' },
      take: 10 // only last 10 meals for context
    });

    const systemPrompt = `
You are the user's advanced AI Personal Secretary and Grooming/Modeling Coach. You have access to all world knowledge (acting like ChatGPT/Google) BUT you must ALWAYS cross-check and tailor your advice based on the user's personal data below.

--- USER PERSONAL DATA ---
Height: ${profile?.heightCm || 'Unknown'} cm
Weight: ${profile?.weightKg || 'Unknown'} kg
Goal Weight: ${profile?.goalWeightKg || 'Unknown'} kg
Skin Type: ${profile?.skinType || 'Unknown'}
Skin Conditions: ${profile?.skinCondition || 'None'}
Daily Calorie Target: ${profile?.dailyCalories || 'Unknown'} kcal

Owned Grooming Products:
${ownedProducts.map(p => `- ${p.name} (${p.category})`).join('\n') || 'None listed.'}

Wardrobe Items:
${clothes.map(c => `- ${c.color} ${c.type} (${c.description || ''})`).join('\n') || 'None listed.'}

Recent Meals Logged:
${meals.map(m => `- ${m.name} (${m.calories} kcal)`).join('\n') || 'No recent meals.'}
--------------------------

When the user asks a question, give a comprehensive, advanced answer. Cross-check your world knowledge with their personal data. For example, if they ask for a skincare routine, explicitly use their "Owned Grooming Products" in the routine and recommend others based on their skin type. If they ask about clothes, reference their Wardrobe Items.
Do not mention that you are an AI reading a prompt, just act as their helpful expert secretary. Keep it conversational but highly informative.
`;

    // Convert history format to Gemini's format
    const formattedHistory = history ? history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })) : [];

    // Add system prompt as the first message context if history is empty
    if (formattedHistory.length === 0) {
       // Gemini 1.5 supports system instructions, but for simplicity we can inject it into the first prompt
    }

    const chatSession = model.startChat({
      history: formattedHistory,
      systemInstruction: systemPrompt,
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
