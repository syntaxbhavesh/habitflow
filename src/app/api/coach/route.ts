import { NextResponse } from "next/server";
export async function POST(req:Request){
 try{
  const body=await req.json();const prompt=String(body.prompt||"Review my habits and suggest small improvements.").slice(0,1200);
  const habits=Array.isArray(body.habits)?body.habits.slice(0,40):[];const summary=body.summary&&typeof body.summary==="object"?body.summary:{};
  const system="You are HabitFlow Coach. Be encouraging, specific, non-judgmental and concise. Give realistic habit suggestions, not medical advice. Never shame the user for missed days. Do not encourage sleep deprivation, extreme exercise, or restrictive eating. Provide at most 3 actionable suggestions.";
  const input=JSON.stringify({prompt,habits,summary});
  const provider=process.env.AI_PROVIDER||"openai";
  if(provider==="gemini"&&process.env.GEMINI_API_KEY){
   const model=process.env.GEMINI_MODEL||"gemini-2.0-flash";
   const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent?key="+process.env.GEMINI_API_KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{parts:[{text:input}]}]})});
   if(!r.ok)throw new Error("Gemini request failed");const d=await r.json();return NextResponse.json({reply:d.candidates?.[0]?.content?.parts?.[0]?.text||"I couldn't create a suggestion just now."});
  }
  if(provider==="openai"&&process.env.OPENAI_API_KEY){
   const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.OPENAI_API_KEY},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:input}],temperature:.6})});
   if(!r.ok)throw new Error("OpenAI request failed");const d=await r.json();return NextResponse.json({reply:d.choices?.[0]?.message?.content||"I couldn't create a suggestion just now."});
  }
  return NextResponse.json({reply:"AI provider is not configured yet. Add a server-side OPENAI_API_KEY or GEMINI_API_KEY in Vercel project settings to enable personalized coaching. Your tracker works without it."});
 }catch{return NextResponse.json({error:"The coach is temporarily unavailable."},{status:502})}
}
