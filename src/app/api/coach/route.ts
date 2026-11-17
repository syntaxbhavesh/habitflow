import { NextResponse } from "next/server";

type CoachHabit = { name?: string; category?: string; streak?: number; target?: number; completedToday?: boolean };
type CoachSummary = { total?: number; completed?: number; completionRate?: number };
function localCoach(prompt:string, habits:CoachHabit[], summary:CoachSummary) {
 const total=Math.max(0,Number(summary.total)||habits.length);
 const completed=Math.max(0,Number(summary.completed)||habits.filter(h=>h.completedToday).length);
 const rate=Math.max(0,Math.min(100,Number(summary.completionRate)||0));
 const pending=habits.filter(h=>!h.completedToday).slice(0,3);
 const longest=[...habits].sort((a,b)=>(Number(b.streak)||0)-(Number(a.streak)||0))[0];
 const lines=[
  "Here is your HabitFlow check-in:",
  "",
  total ? `• You completed ${completed} of ${total} active habits today (${Math.round(completed/total*100)}%). Your recent 7-day consistency is ${rate}%.` : "• Start with one small habit so HabitFlow can learn your routine.",
  longest?.streak ? `• Your current strongest streak is ${longest.streak} days for “${String(longest.name).slice(0,70)}”. Keep it steady rather than making it harder.` : "• Focus on showing up consistently; streaks will build naturally.",
  pending.length ? `• A gentle next step: ${pending.map(h=>String(h.name).slice(0,60)).join("; ")}. Pick just one to do next.` : "• You have checked off today's habits. Take a moment to recognise the progress.",
  "",
  "Try this: choose the smallest useful action, attach it to a routine you already have, and make it easy to repeat tomorrow.",
  "",
  "This is HabitFlow's built-in coach. Connect an AI provider in Vercel if you want fully generated, personalised responses."
 ];
 return lines.join("\\n");
}

export async function POST(req:Request) {
 try {
  const body=await req.json();
  const prompt=String(body.prompt||"Review my habits and suggest small improvements.").slice(0,1200);
  const habits=Array.isArray(body.habits)?body.habits.slice(0,40):[];
  const summary=body.summary&&typeof body.summary==="object"?body.summary:{};
  const system="You are HabitFlow Coach. Be encouraging, specific, non-judgmental and concise. Give realistic habit suggestions, not medical advice. Never shame missed days. Do not encourage sleep deprivation, extreme exercise, or restrictive eating. Provide at most 3 actionable suggestions.";
  const input=JSON.stringify({prompt,habits,summary});
  const provider=process.env.AI_PROVIDER||"openai";
  if(provider==="gemini"&&process.env.GEMINI_API_KEY) {
   const model=process.env.GEMINI_MODEL||"gemini-2.0-flash";
   const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent?key="+process.env.GEMINI_API_KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{parts:[{text:input}]}]})});
   if(r.ok){const d=await r.json();const reply=d.candidates?.[0]?.content?.parts?.[0]?.text;if(reply)return NextResponse.json({reply,source:"gemini"});}
  } else if(provider==="openai"&&process.env.OPENAI_API_KEY) {
   const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.OPENAI_API_KEY},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:input}],temperature:.6})});
   if(r.ok){const d=await r.json();const reply=d.choices?.[0]?.message?.content;if(reply)return NextResponse.json({reply,source:"openai"});}
  }
  return NextResponse.json({reply:localCoach(prompt,habits,summary),source:"built-in"});
 } catch {
  return NextResponse.json({reply:"HabitFlow Coach is having a brief hiccup. Try again in a moment, or use your habit check-ins to choose one small next step.",source:"built-in"});
 }
}
