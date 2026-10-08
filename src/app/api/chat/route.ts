import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ 
        error: "No API key provided. Please set your Groq API Key in the Profile settings." 
      }, { status: 400 });
    }

    // Fetch user context from database to ground the AI
    const profile = await prisma.userProfile.findFirst();
    const ownedProducts = await prisma.groomingProduct.findMany();
    const clothes = await prisma.clothingItem.findMany();
    const meals = await prisma.meal.findMany({
      orderBy: { eatenAt: 'desc' },
      take: 10
    });

    const systemPrompt = `
You are the user's advanced AI Personal Secretary and Grooming/Modeling Coach. You have access to all world knowledge BUT you must ALWAYS cross-check and tailor your advice based on the user's personal data below.

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

    const formattedHistory = history ? history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })) : [];

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch from Groq");
    }

    const responseText = data.choices[0].message.content;

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
