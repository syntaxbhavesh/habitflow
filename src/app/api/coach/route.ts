import { NextResponse } from "next/server";
export async function POST(req:Request) {
  try {
    const { prompt, habits, summary } = await req.json();
    const provider = process.env.AI_PROVIDER || "openai";
    const system = "You are HabitFlow Coach. Be encouraging, specific, non-judgmental and concise. Never shame users. Give realistic habit suggestions, not medical advice.";
    const input = JSON.stringify({prompt,habits,summary});
    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{parts:[{text:input}]}]})});
      if(!r.ok) throw new Error("Gemini request failed");
      const data = await r.json();
      return NextResponse.json({reply:data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't create a suggestion just now."});
    }
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:input}],temperature:.7})});
      if(!r.ok) throw new Error("OpenAI request failed");
      const data = await r.json();
      return NextResponse.json({reply:data.choices?.[0]?.message?.content || "I couldn't create a suggestion just now."});
    }
    return NextResponse.json({reply:"Your tracker is ready. To activate AI coaching, add an AI_PROVIDER and matching server-side API key in your environment settings."});
  } catch { return NextResponse.json({error:"The coach is temporarily unavailable."},{status:500}); }
}
