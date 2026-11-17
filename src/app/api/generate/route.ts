import { NextResponse } from "next/server";
type SuggestedHabit={name:string;category:string;emoji:string;target:number};
const fallback=(prompt:string):SuggestedHabit[]=>{
 const p=prompt.toLowerCase();
 if(/study|exam|learn|school|jee|math|chem|physics/.test(p))return [
 {name:"Do one 25-minute focused study block",category:"Learning",emoji:"🎯",target:5},
 {name:"Revise yesterday's notes for 10 minutes",category:"Learning",emoji:"📚",target:5},
 {name:"Solve 5 practice questions",category:"Learning",emoji:"✍️",target:4}
 ];
 if(/sleep|rest|morning/.test(p))return [
 {name:"Keep a consistent wind-down time",category:"Wellness",emoji:"🌙",target:5},
 {name:"Prepare tomorrow's top priority",category:"Focus",emoji:"📝",target:5},
 {name:"Take a short screen-free break",category:"Wellness",emoji:"🌿",target:7}
 ];
 return [
 {name:"Spend 10 minutes on your main priority",category:"Personal",emoji:"✨",target:5},
 {name:"Take a 10-minute mindful walk",category:"Wellness",emoji:"🌿",target:4},
 {name:"Write one line about today's progress",category:"Personal",emoji:"📓",target:5}
 ];
};
export async function POST(req:Request){
 try{
  const body=await req.json();const prompt=String(body.prompt||"").slice(0,1200);const existing=Array.isArray(body.existingHabits)?body.existingHabits.slice(0,30).map((x:unknown)=>String(x).slice(0,100)):[];
  if(!prompt.trim())return NextResponse.json({error:"Describe what you want to improve."},{status:400});
  const provider=process.env.AI_PROVIDER||"openai";
  const system="Suggest exactly 3 practical, small, safe habits based on the user's goal. Avoid medical claims, extreme routines, or shame. Return ONLY JSON: {\"habits\":[{\"name\":\"...\",\"category\":\"Learning|Wellness|Health|Focus|Personal\",\"emoji\":\"...\",\"target\":1}]}. target is 1 to 7 days per week. Do not duplicate existing habits.";
  let text="";
  if(provider==="gemini"&&process.env.GEMINI_API_KEY){
   const model=process.env.GEMINI_MODEL||"gemini-2.0-flash";
   const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent?key="+process.env.GEMINI_API_KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{parts:[{text:JSON.stringify({prompt,existing})}]}],generationConfig:{responseMimeType:"application/json"}})});
   if(!r.ok)throw new Error("AI provider request failed");const d=await r.json();text=d.candidates?.[0]?.content?.parts?.[0]?.text||"";
  }else if(provider==="openai"&&process.env.OPENAI_API_KEY){
   const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.OPENAI_API_KEY},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:JSON.stringify({prompt,existing})}],response_format:{type:"json_object"},temperature:.5})});
   if(!r.ok)throw new Error("AI provider request failed");const d=await r.json();text=d.choices?.[0]?.message?.content||"";
  }else return NextResponse.json({habits:fallback(prompt),source:"built-in suggestions"});
  const parsed=JSON.parse(text);const habits=Array.isArray(parsed.habits)?parsed.habits.slice(0,3).map((h:SuggestedHabit)=>({name:String(h.name||"A small daily step").slice(0,80),category:["Learning","Wellness","Health","Focus","Personal"].includes(h.category)?h.category:"Personal",emoji:String(h.emoji||"✨").slice(0,8),target:Math.max(1,Math.min(7,Number(h.target)||3))})):fallback(prompt);
  return NextResponse.json({habits,source:"ai"});
 }catch{return NextResponse.json({error:"Habit ideas could not be generated. Check your AI provider settings and try again."},{status:502})}
}
