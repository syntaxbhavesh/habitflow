export type Habit = { id:string; name:string; category:string; emoji:string; target:number; days:string[]; createdAt:string; completions:Record<string,boolean> };
export const todayKey = () => new Date().toISOString().slice(0,10);
export const seedHabits: Habit[] = [
 {id:"read",name:"Read 20 pages",category:"Learning",emoji:"📚",target:7,days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],createdAt:todayKey(),completions:{}},
 {id:"move",name:"Move your body",category:"Wellness",emoji:"🌿",target:5,days:["Mon","Tue","Wed","Thu","Fri"],createdAt:todayKey(),completions:{}},
 {id:"water",name:"Drink enough water",category:"Health",emoji:"💧",target:7,days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],createdAt:todayKey(),completions:{}},
 {id:"focus",name:"Focused study",category:"Focus",emoji:"🎯",target:5,days:["Mon","Tue","Wed","Thu","Fri"],createdAt:todayKey(),completions:{}}
];
