import { loadData, saveData } from './supabase';
import { useState, useEffect, useRef } from "react";

const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── THEMES — Light mode fully redesigned with strong contrast ─────────────────
const THEMES={
  dark:{bg:"#07070e",card:"#10101c",border:"#1c1c30",text:"#e8e8f0",muted:"#5a5a80",input:"#080814",sub:"#0c0c1a",shadow:"0 2px 8px rgba(0,0,0,0.4)",name:"DARK"},
  light:{bg:"#e8e8f5",card:"#ffffff",border:"#8080b0",text:"#0a0a1e",muted:"#404068",input:"#ffffff",sub:"#dcdcee",shadow:"0 2px 8px rgba(80,80,160,0.15)",name:"LIGHT"},
  gold:{bg:"#0e0a00",card:"#1a1400",border:"#5a4400",text:"#ffe8a0",muted:"#907050",input:"#100c00",sub:"#140f00",shadow:"0 2px 8px rgba(0,0,0,0.4)",name:"GOLD"},
  crimson:{bg:"#0e0007",card:"#180010",border:"#500030",text:"#ffe0f0",muted:"#905070",input:"#130008",sub:"#130008",shadow:"0 2px 8px rgba(0,0,0,0.4)",name:"CRIMSON"},
  neon:{bg:"#000a0a",card:"#001515",border:"#005050",text:"#c0fff0",muted:"#307070",input:"#001010",sub:"#001010",shadow:"0 2px 8px rgba(0,212,170,0.1)",name:"NEON"},
};

const ACCENT={cal:"#ff6b35",protein:"#ff4d88",steps:"#00d4aa",water:"#4da6ff",sleep:"#b06aff",gym:"#ffd700",mood:"#ff8844",cardio:"#00e5ff",supp:"#a8ff78",boss:"#ff2255",reward:"#f0a500",fiber:"#88cc44",energy:"#ffcc00",home:"#cc88ff"};
const XP_THRESH=[0,100,250,500,900,1400,2100,3000,4200,6000,9000];
const LEVEL_NAMES=["Rookie","Grinder","Warrior","Champion","Beast","Legend","Elite","Titan","Apex","GOD MODE","TRANSCENDENT"];

// ── MUSCLE GROUPS ─────────────────────────────────────────────────────────────
const MUSCLE_GROUPS={
  push:["Chest","Shoulders","Triceps"],
  pull:["Back","Biceps","Rear Delts"],
  legs:["Quads","Hamstrings","Calves","Glutes"],
  full:["Full Body"],
};

const WORKOUT_PLANS={
  push:{name:"Push Day",emoji:"💪",color:"#ff6b35",muscles:["Chest","Shoulders","Triceps"],exercises:[
    {name:"Bench Press",sets:"3",reps:"8-12",rest:90,tip:"Shoulders retracted, feet drive into floor",muscle:"Chest",warmup:true},
    {name:"Incline DB Press",sets:"3",reps:"10",rest:75,tip:"Control descent, squeeze at top",muscle:"Upper Chest",warmup:false},
    {name:"Shoulder Press",sets:"3",reps:"10-12",rest:60,tip:"Don't flare elbows too wide",muscle:"Shoulders",warmup:false},
    {name:"Lateral Raises",sets:"3",reps:"15",rest:45,tip:"Lead with elbows, slight lean forward",muscle:"Side Delts",warmup:false},
    {name:"Tricep Pushdown",sets:"3",reps:"12-15",rest:45,tip:"Keep elbows pinned at sides",muscle:"Triceps",warmup:false},
    {name:"Overhead Tricep Ext",sets:"3",reps:"12",rest:45,tip:"Full range, feel the stretch",muscle:"Triceps",warmup:false},
  ]},
  pull:{name:"Pull Day",emoji:"🔥",color:"#00d4aa",muscles:["Back","Biceps","Rear Delts"],exercises:[
    {name:"Lat Pulldown",sets:"3",reps:"10-12",rest:90,tip:"Pull to upper chest, lean slightly back",muscle:"Lats",warmup:true},
    {name:"Seated Cable Row",sets:"3",reps:"10-12",rest:60,tip:"Squeeze shoulder blades at peak",muscle:"Mid Back",warmup:false},
    {name:"Face Pulls",sets:"3",reps:"15",rest:45,tip:"Elbows high, pull to forehead",muscle:"Rear Delts",warmup:false},
    {name:"Barbell Curl",sets:"3",reps:"10",rest:60,tip:"Don't swing, control the negative",muscle:"Biceps",warmup:false},
    {name:"Hammer Curl",sets:"3",reps:"12",rest:45,tip:"Neutral grip, full range",muscle:"Biceps",warmup:false},
    {name:"Rear Delt Fly",sets:"3",reps:"15",rest:45,tip:"Slight bend in elbows, pinch back",muscle:"Rear Delts",warmup:false},
  ]},
  legs:{name:"Leg Day",emoji:"🦵",color:"#ffd700",muscles:["Quads","Hamstrings","Calves"],exercises:[
    {name:"Squat",sets:"4",reps:"8-10",rest:120,tip:"Knees track toes, chest up, depth matters",muscle:"Quads",warmup:true},
    {name:"Leg Press",sets:"3",reps:"12",rest:90,tip:"Full range, never lock knees",muscle:"Quads",warmup:false},
    {name:"Romanian Deadlift",sets:"3",reps:"10",rest:90,tip:"Push hips back, feel hamstring stretch",muscle:"Hamstrings",warmup:false},
    {name:"Leg Extension",sets:"3",reps:"15",rest:45,tip:"Squeeze hard at top",muscle:"Quads",warmup:false},
    {name:"Leg Curl",sets:"3",reps:"12",rest:45,tip:"Control the negative rep",muscle:"Hamstrings",warmup:false},
    {name:"Calf Raises",sets:"4",reps:"20",rest:30,tip:"Full range, pause at top and bottom",muscle:"Calves",warmup:false},
  ]},
  full:{name:"Full Body",emoji:"💥",color:"#ff4d88",muscles:["Full Body"],exercises:[
    {name:"Squat",sets:"3",reps:"8",rest:90,tip:"The king of all movements",muscle:"Legs",warmup:true},
    {name:"Bench Press",sets:"3",reps:"8",rest:90,tip:"Controlled descent always",muscle:"Chest",warmup:false},
    {name:"Bent Over Row",sets:"3",reps:"10",rest:60,tip:"Hinge at hips, neutral spine",muscle:"Back",warmup:false},
    {name:"Shoulder Press",sets:"3",reps:"10",rest:60,tip:"Core braced throughout",muscle:"Shoulders",warmup:false},
    {name:"Romanian Deadlift",sets:"3",reps:"10",rest:60,tip:"Hip hinge pattern",muscle:"Hamstrings",warmup:false},
    {name:"Plank",sets:"3",reps:"45s",rest:30,tip:"Squeeze glutes + abs simultaneously",muscle:"Core",warmup:false},
  ]},
};

const CLASSES=[
  {id:"iron_beast",name:"Iron Beast",icon:"🦁",desc:"15 gym sessions",color:"#ff6b35",check:d=>Object.values(d.logs).filter(l=>l.gym).length>=15,reward:"Gold Theme + 2x gym XP"},
  {id:"step_warrior",name:"Step Warrior",icon:"⚡",desc:"15k steps 5+ days",color:"#00d4aa",check:d=>Object.values(d.logs).filter(l=>l.steps>=15000).length>=5,reward:"Neon Theme + 1.5x step XP"},
  {id:"nutrition_monk",name:"Nutrition Monk",icon:"🧘",desc:"120g protein 10+ days",color:"#ff4d88",check:d=>Object.values(d.logs).filter(l=>l.protein>=120).length>=10,reward:"Crimson Theme + 2x nutrition XP"},
  {id:"consistency_king",name:"Consistency King",icon:"👑",desc:"20 day streak",color:"#ffd700",check:d=>d.streak>=20,reward:"All Themes + 1.5x all XP"},
  {id:"hydration_god",name:"Hydration God",icon:"💧",desc:"8 glasses 7+ days",color:"#4da6ff",check:d=>Object.values(d.logs).filter(l=>l.water>=8).length>=7,reward:"+10XP every water log"},
];

const ALL_MISSIONS=[
  {id:"m_water8",label:"Hydration Hero",desc:"Log 8 glasses of water",xp:40,difficulty:"EASY",icon:"💧",check:l=>l.water>=8},
  {id:"m_protein120",label:"Protein Push",desc:"Hit 120g protein today",xp:60,difficulty:"MEDIUM",icon:"💪",check:l=>l.protein>=120},
  {id:"m_steps12k",label:"Step Champion",desc:"Log 12,000+ steps",xp:50,difficulty:"MEDIUM",icon:"👟",check:l=>l.steps>=12000},
  {id:"m_gym",label:"Iron Session",desc:"Complete a gym session",xp:70,difficulty:"HARD",icon:"🏋️",check:l=>l.gym},
  {id:"m_sleep7",label:"Rest Master",desc:"Log 7+ hours of sleep",xp:35,difficulty:"EASY",icon:"😴",check:l=>l.sleep>=7},
  {id:"m_sodium",label:"Sodium Guard",desc:"Stay under 2000mg sodium",xp:40,difficulty:"MEDIUM",icon:"🧂",check:l=>l.sodium>0&&l.sodium<2000},
  {id:"m_meals3",label:"Consistent Eater",desc:"Log 3+ meals today",xp:30,difficulty:"EASY",icon:"🍽️",check:l=>l.meals?.length>=3},
  {id:"m_double",label:"Double Threat",desc:"Water AND protein targets",xp:80,difficulty:"HARD",icon:"⚔️",check:l=>l.water>=8&&l.protein>=120},
  {id:"m_full_send",label:"Full Send",desc:"10k steps AND gym session",xp:100,difficulty:"HARD",icon:"💥",check:l=>l.steps>=10000&&l.gym},
  {id:"m_mindful",label:"Mindful",desc:"Log mood and write a note",xp:25,difficulty:"EASY",icon:"🧠",check:l=>l.mood>0&&!!l.notes},
  {id:"m_protein150",label:"Protein God",desc:"Hit 150g protein",xp:90,difficulty:"HARD",icon:"👑",check:l=>l.protein>=150},
  {id:"m_15k",label:"Distance King",desc:"Log 15,000+ steps",xp:70,difficulty:"HARD",icon:"⚡",check:l=>l.steps>=15000},
];

const BOSS_CHALLENGES=[
  {id:"b1",name:"The Plateau",icon:"🗻",desc:"Hit all daily targets 3 days straight",xp:300,reward:"❄️ 3 Streak Freezes"},
  {id:"b2",name:"Iron Week",icon:"⚔️",desc:"Gym 4x this week",xp:400,reward:"🎖️ Iron Badge + Gold Theme"},
  {id:"b3",name:"Nutrition Arc",icon:"🧬",desc:"120g+ protein 5 days this week",xp:350,reward:"💎 Nutrition Badge"},
  {id:"b4",name:"Step Legend",icon:"🌍",desc:"70,000 steps this week",xp:350,reward:"⚡ Step Legend Badge + Neon Theme"},
  {id:"b5",name:"The Monk",icon:"🧘",desc:"Water + sleep + protein every day this week",xp:500,reward:"👑 Monk Badge + Crimson Theme"},
];

const WEEKLY_CHALLENGES=[
  {id:"wc1",label:"Step Master",desc:"Hit 10k steps 5 days this week",icon:"👟",xp:100,check:(logs)=>logs.filter(l=>l.steps>=10000).length>=5},
  {id:"wc2",label:"Protein Streak",desc:"Hit 120g protein 5 days this week",icon:"💪",xp:100,check:(logs)=>logs.filter(l=>l.protein>=120).length>=5},
  {id:"wc3",label:"Triple Threat",desc:"Gym 3x this week",icon:"🏋️",xp:150,check:(logs)=>logs.filter(l=>l.gym).length>=3},
  {id:"wc4",label:"Hydration Run",desc:"8 glasses water 5 days",icon:"💧",xp:75,check:(logs)=>logs.filter(l=>l.water>=8).length>=5},
  {id:"wc5",label:"Daily Logger",desc:"Log meals every day this week",icon:"📋",xp:75,check:(logs)=>logs.filter(l=>l.meals?.length>0).length>=7},
  {id:"wc6",label:"Sleep Streak",desc:"7+ hours sleep 5 days",icon:"😴",xp:75,check:(logs)=>logs.filter(l=>l.sleep>=7).length>=5},
  {id:"wc7",label:"Home Warrior",desc:"2 home gym sessions this week",icon:"🏠",xp:80,check:(logs)=>logs.filter(l=>l.homeGym).length>=2},
  {id:"wc8",label:"Fiber Week",desc:"Hit fiber target 5 days",icon:"🌾",xp:80,check:(logs)=>logs.filter(l=>(l.fiber||0)>=25).length>=5},
];

const ACHIEVEMENTS=[
  {id:"first_gym",label:"Iron Initiated",desc:"First gym session",icon:"🏋️",reward:"Title: Iron Trainee",check:s=>Object.values(s.logs).some(l=>l.gym)},
  {id:"steps_10k",label:"10K Club",desc:"10k steps in a day",icon:"👟",reward:"+5 Bonus XP per 10k day",check:s=>Object.values(s.logs).some(l=>l.steps>=10000)},
  {id:"steps_15k",label:"Step Demon",desc:"15k steps in a day",icon:"⚡",reward:"Unlock Neon Theme",check:s=>Object.values(s.logs).some(l=>l.steps>=15000)},
  {id:"protein_120",label:"Protein King",desc:"120g protein in a day",icon:"👑",reward:"Title: The Fueled",check:s=>Object.values(s.logs).some(l=>l.protein>=120)},
  {id:"protein_150",label:"Amino God",desc:"150g protein in a day",icon:"💎",reward:"Title: Amino God + ❄️ 1 Freeze",check:s=>Object.values(s.logs).some(l=>l.protein>=150)},
  {id:"streak_3",label:"On Fire",desc:"3 day gym streak",icon:"🔥",reward:"❄️ 1 Streak Freeze",check:s=>s.streak>=3},
  {id:"streak_7",label:"Week Warrior",desc:"7 day gym streak",icon:"⚔️",reward:"❄️ 2 Freezes + Title: Week Warrior",check:s=>s.streak>=7},
  {id:"streak_14",label:"Fortnight Beast",desc:"14 day gym streak",icon:"🦁",reward:"❄️ 3 Freezes + Gold Theme",check:s=>s.streak>=14},
  {id:"sessions_10",label:"Beast Mode",desc:"10 gym sessions",icon:"🏆",reward:"Title: Beast Mode",check:s=>Object.values(s.logs).filter(l=>l.gym).length>=10},
  {id:"sessions_25",label:"Dedicated",desc:"25 gym sessions",icon:"🎯",reward:"Title: The Dedicated",check:s=>Object.values(s.logs).filter(l=>l.gym).length>=25},
  {id:"water_8",label:"Hydrated",desc:"8 glasses in a day",icon:"💧",reward:"Unlock Water XP Bonus",check:s=>Object.values(s.logs).some(l=>l.water>=8)},
  {id:"xp_500",label:"XP Grinder",desc:"500 total XP",icon:"⭐",reward:"Title: The Grinder",check:s=>s.xp>=500},
  {id:"xp_2000",label:"XP Legend",desc:"2000 total XP",icon:"🌟",reward:"Unlock Crimson Theme",check:s=>s.xp>=2000},
  {id:"xp_5000",label:"XP God",desc:"5000 total XP",icon:"💫",reward:"All Themes Unlocked",check:s=>s.xp>=5000},
  {id:"boss_first",label:"Boss Slayer",desc:"Defeat your first boss",icon:"🗡️",reward:"Title: Boss Slayer + ❄️ 2 Freezes",check:s=>Object.keys(s.bossesDefeated||{}).length>=1},
  {id:"pr_first",label:"Personal Best",desc:"Set your first PR",icon:"🏅",reward:"Title: PR Machine",check:s=>Object.keys(s.exercisePRs||{}).length>=1},
  {id:"pr_5",label:"PR Collector",desc:"Set 5 different PRs",icon:"🥇",reward:"Title: PR Collector + ❄️ 1 Freeze",check:s=>Object.keys(s.exercisePRs||{}).length>=5},
  {id:"volume_10k",label:"Volume King",desc:"10,000 total volume lifted",icon:"⚡",reward:"Title: Volume King",check:s=>(s.totalVolume||0)>=10000},
];

// ── SUGGESTED REAL LIFE REWARDS ───────────────────────────────────────────────
const SUGGESTED_REWARDS=[
  {id:"r1",category:"🍔 Food",title:"Cheat meal at your favourite restaurant",milestone:"5 gym sessions",trigger:{type:"sessions",value:5}},
  {id:"r2",category:"👟 Gear",title:"New gym shoes or workout clothes",milestone:"25 gym sessions",trigger:{type:"sessions",value:25}},
  {id:"r3",category:"🎵 Music",title:"New headphones for the gym",milestone:"1kg lost",trigger:{type:"weight_lost",value:1}},
  {id:"r4",category:"💆 Recovery",title:"Massage or spa day",milestone:"3kg lost",trigger:{type:"weight_lost",value:3}},
  {id:"r5",category:"👕 Style",title:"New outfit — you've earned it",milestone:"5kg lost",trigger:{type:"weight_lost",value:5}},
  {id:"r6",category:"🏖️ Experience",title:"Beach day or trip — show off that progress",milestone:"Beach body goal",trigger:{type:"weight_lost",value:8}},
  {id:"r7",category:"🎮 Entertainment",title:"Buy a game or experience you've been putting off",milestone:"50 gym sessions",trigger:{type:"sessions",value:50}},
  {id:"r8",category:"🍫 Treat",title:"Your favourite dessert guilt-free",milestone:"7 day streak",trigger:{type:"streak",value:7}},
];

const PRESET_MEALS=[
  // Breads & grains
  {name:"1 Roti",calories:70,protein:2,sodium:5,fiber:1},
  {name:"1 Cup Rice",calories:200,protein:4,sodium:0,fiber:0},
  {name:"1 Slice Bread",calories:80,protein:3,sodium:130,fiber:1},
  {name:"1 Paratha",calories:160,protein:3,sodium:10,fiber:2},
  // Protein
  {name:"1 Egg",calories:70,protein:6,sodium:70,fiber:0},
  {name:"Diesel Shake",calories:120,protein:25,sodium:53,fiber:2},
  {name:"100g Chicken",calories:165,protein:31,sodium:75,fiber:0},
  {name:"100g Paneer",calories:265,protein:18,sodium:30,fiber:0},
  // Dal & sabzi
  {name:"1 Katori Dal",calories:130,protein:9,sodium:250,fiber:5},
  {name:"1 Katori Sabzi",calories:80,protein:3,sodium:200,fiber:3},
  {name:"1 Katori Dahi",calories:60,protein:4,sodium:40,fiber:0},
  {name:"1 Katori Bhurji",calories:140,protein:10,sodium:220,fiber:1},
  // Snacks & extras
  {name:"Banana",calories:90,protein:1,sodium:0,fiber:3},
  {name:"PB Toast",calories:180,protein:7,sodium:90,fiber:2},
  {name:"1 Glass Milk",calories:120,protein:6,sodium:100,fiber:0},
  {name:"Handful Almonds",calories:160,protein:6,sodium:0,fiber:2},
  {name:"1 Katori Soya",calories:110,protein:12,sodium:200,fiber:3},
  {name:"Greek Yogurt",calories:130,protein:20,sodium:60,fiber:0},
];

const HOME_EXERCISES=[
  {name:"Pushups",icon:"💪",muscle:"Chest / Triceps",calPerRep:0.32,options:[25,50,75,100]},
  {name:"Squats",icon:"🦵",muscle:"Quads / Glutes",calPerRep:0.32,options:[25,50,75,100]},
  {name:"Lunges",icon:"🚶",muscle:"Quads / Glutes",calPerRep:0.35,options:[20,40,60,100]},
  {name:"Burpees",icon:"💥",muscle:"Full Body",calPerRep:0.8,options:[10,20,30,50]},
  {name:"Pullups",icon:"🔥",muscle:"Back / Biceps",calPerRep:0.6,options:[5,10,15,25]},
  {name:"Dips",icon:"⬇️",muscle:"Triceps / Chest",calPerRep:0.4,options:[10,20,30,50]},
  {name:"Mountain Climbers",icon:"⛰️",muscle:"Core / Cardio",calPerRep:0.25,options:[20,40,60,100]},
  {name:"Situps",icon:"🔄",muscle:"Core",calPerRep:0.25,options:[25,50,75,100]},
  {name:"Plank",icon:"🧱",muscle:"Core",calPerRep:0.5,options:[30,60,90,120],unit:"sec"},
  {name:"Jump Rope",icon:"🪢",muscle:"Cardio",calPerRep:0.15,options:[50,100,200,300],unit:"jumps"},
  {name:"Glute Bridges",icon:"🌉",muscle:"Glutes / Hamstrings",calPerRep:0.2,options:[20,40,60,100]},
  {name:"Pike Pushups",icon:"🔺",muscle:"Shoulders",calPerRep:0.3,options:[10,20,30,50]},
];

function calcEnergy(log,manualBoost){
  manualBoost=manualBoost||0;
  if(!log) return {score:0,label:"No Data",color:"#555",suggestions:[]};
  let score=0; var suggestions=[];
  var protein=log.protein||0,steps=log.steps||0,sleep=log.sleep||0;
  var water=log.water||0,mood=log.mood||0,gym=log.gym||false;
  var homeGym=log.homeGym||false,meals=(log.meals||[]).length;
  score+=Math.round(Math.min(protein/120,1)*30);
  if(protein<60) suggestions.push("🍗 Low protein — energy suffers");
  else if(protein>=120) suggestions.push("💪 Protein hit — muscles fueled");
  score+=Math.round(Math.min(steps/10000,1)*20);
  if(steps<3000) suggestions.push("👟 Move more — low steps drain energy");
  else if(steps>=10000) suggestions.push("⚡ 10k+ steps — circulation boosted");
  var sleepPct=sleep>=8?1:sleep>=7?0.8:sleep>=6?0.5:0.2;
  score+=Math.round(sleepPct*20);
  if(sleep>0&&sleep<6) suggestions.push("😴 Sleep debt — recovery hit");
  else if(sleep>=8) suggestions.push("😴 Well rested — peak recovery");
  score+=Math.round(Math.min(water/8,1)*10);
  if(water<4) suggestions.push("💧 Drink more — dehydration drains energy");
  if(gym||homeGym){score+=10;suggestions.push("🏋️ Trained today — endorphins up");}
  if(meals>=3) score+=5;
  else if(meals===0) suggestions.push("🍽️ No meals logged yet");
  score+=Math.round((mood/10)*5);
  score=Math.min(score+manualBoost,100);
  var gymReady=protein>=60&&(sleep>=6||manualBoost>0)&&water>=3;
  if(gymReady&&score>=60&&!gym&&!homeGym) suggestions.unshift("🏋️ You are charged — gym is a GO 💪");
  else if(!gymReady&&!gym&&!homeGym) suggestions.unshift("⚠️ Fuel up first before training");
  var label=score>=90?"⚡ PEAK":score>=75?"💪 CHARGED":score>=55?"😐 MODERATE":score>=35?"🥱 LOW":"😴 DRAINED";
  var color=score>=90?"#ffcc00":score>=75?"#88ff44":score>=55?"#ff8844":score>=35?"#ff6b35":"#ff4d88";
  return {score:score,label:label,color:color,suggestions:suggestions.slice(0,3)};
}

function getLevelInfo(xp){
  let level=0;
  for(let i=0;i<XP_THRESH.length;i++) if(xp>=XP_THRESH[i]) level=i;
  const next=XP_THRESH[level+1]||XP_THRESH[level]+2000;
  const prev=XP_THRESH[level];
  return{level,name:LEVEL_NAMES[Math.min(level,LEVEL_NAMES.length-1)],progress:Math.min(((xp-prev)/(next-prev))*100,100),toNext:next-xp};
}
function getToday(){return new Date().toISOString().split("T")[0];}
function getMonday(d){const dt=new Date(d),day=dt.getDay();dt.setDate(dt.getDate()-day+(day===0?-6:1));return dt.toISOString().split("T")[0];}
function getWeekDays(){return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return{date:d.toISOString().split("T")[0],day:DAYS[d.getDay()]};});}
function getDailyMissions(dateStr){
  const seed=dateStr.replace(/-/g,"").split("").reduce((a,b,i)=>a+b.charCodeAt(0)*(i+1),0);
  return [...ALL_MISSIONS].sort((a,b)=>(seed*a.xp)%17-(seed*b.xp)%17).slice(0,8);
}
function pct(v,t){return Math.min((v/Math.max(t,1))*100,100);}
function daysSince(dateStr){if(!dateStr)return 99;return Math.floor((Date.now()-new Date(dateStr).getTime())/(1000*60*60*24));}

export default function FitnessTracker(){
  const [themeName,setThemeName]=useState("dark");
  const [data,setData]=useState({
    logs:{},weightLog:{},xp:0,streak:0,lastGymDate:null,
    exercisePRs:{},completedChallenges:{},goalWeight:74,
    streakFreezes:1,missionsCompleted:0,routineCount:0,
    bossesDefeated:{},unlockedThemes:["dark","light"],
    selectedMissions:[],missionDate:null,realLifeChallenges:[],
    customRewards:[],claimedRewards:{},totalVolume:0,personalTrackers:{},weeklyReports:{},monthlyReports:{},
    sessionHistory:[],
    customPresets:[],deletedPresets:[],
    calSettings:{maintenance:2200,deficit:500},
  });
  const [tab,setTab]=useState("dashboard");
  const [subTab,setSubTab]=useState("meals");
  const [gymView,setGymView]=useState("home"); // home | plan | session | history | muscle
  const [selectedPlan,setSelectedPlan]=useState(null);
  const [activeSession,setActiveSession]=useState(null); // {plan, exercises:[{...ex, sets:[{reps,weight}], note}]}
  const [restTimer,setRestTimer]=useState(null);
  const [prInput,setPrInput]=useState({});
  const [setLogInput,setSetLogInput]=useState({}); // {exName: {reps, weight}}
  const [sessionNote,setSessionNote]=useState("");
  const [mealInput,setMealInput]=useState({name:"",calories:"",protein:"",sodium:"",fiber:"",saveAsPreset:false});
  const [customMeal,setCustomMeal]=useState(false);
  const [stepsInput,setStepsInput]=useState("");
  const [weightInput,setWeightInput]=useState("");
  const [sleepInput,setSleepInput]=useState("");
  const [moodInput,setMoodInput]=useState(7);
  const [hrInput,setHrInput]=useState("");
  const [notesInput,setNotesInput]=useState("");
  const [goalInput,setGoalInput]=useState("");
  const [notification,setNotif]=useState(null);
  const [levelUp,setLevelUp]=useState(null);
  const [calMonth,setCalMonth]=useState(new Date());
  const [focusTimer,setFocusTimer]=useState(null);
  const [focusMode,setFocusMode]=useState("work");
  const [focusCycles,setFocusCycles]=useState(0);
  const [gymMode,setGymMode]=useState("gym");
  const [homeExSel,setHomeExSel]=useState({});
  const [energyBoost,setEnergyBoost]=useState(0);
  const [calTrackerDate,setCalTrackerDate]=useState(null);
  const [reportView,setReportView]=useState("weekly");
  const [questsTab,setQuestsTab]=useState("missions");
  const [newChallenge,setNewChallenge]=useState({title:"",reward:"",days:30});
  const [showNewChallenge,setShowNewChallenge]=useState(false);
  const [presetEditMode,setPresetEditMode]=useState(false);
  const [confirmReset,setConfirmReset]=useState(false);
  const [cardioInput,setCardioInput]=useState({type:"Walk",duration:"",calories:""});
  const [routineChecks,setRoutineChecks]=useState({});
  const [measureInput,setMeasureInput]=useState({waist:"",chest:"",arms:""});
  const [rewardInput,setRewardInput]=useState({title:"",category:"🎯 Personal",milestone:""});
  const [showAddReward,setShowAddReward]=useState(false);
  const [postSession,setPostSession]=useState(null);
  const timerRef=useRef(null);
  const focusRef=useRef(null);
  const prevXP=useRef(0);
  const prevData=useRef(data);
  const loadedFromDB=useRef(false);

  const T=THEMES[themeName]||THEMES.dark;
  const isLight=themeName==="light";

  useEffect(()=>{
    const defaultData={logs:{},weightLog:{},xp:0,streak:0,lastGymDate:null,exercisePRs:{},completedChallenges:{},goalWeight:74,streakFreezes:1,missionsCompleted:0,routineCount:0,bossesDefeated:{},unlockedThemes:["dark","light"],selectedMissions:[],missionDate:null,customRewards:[],claimedRewards:{},totalVolume:0,personalTrackers:{},weeklyReports:{},monthlyReports:{},sessionHistory:[],customPresets:[],deletedPresets:[],calSettings:{maintenance:2600,deficit:500},realLifeChallenges:[]};
    const merge=(base,incoming)=>{
      if(!incoming||typeof incoming!=="object") return base;
      return{...base,...incoming,logs:{...(base.logs||{}),...(incoming.logs||{})}};
    };
    // Step 1: load localStorage first (instant)
    let localData=null;
    try{
      const raw=localStorage.getItem("rajvir_ft");
      if(raw){
        const parsed=JSON.parse(raw);
        if(parsed&&parsed.data&&typeof parsed.data==="object"){
          localData=parsed;
          setData(merge(defaultData,parsed.data));
          setThemeName(parsed.theme||"dark");
        }
      }
    }catch(e){console.warn("localStorage load failed",e);}
    // Step 2: load Supabase, smart merge
    loadData().then(saved=>{
      if(saved&&saved.data&&typeof saved.data==="object"){
        setData(prev=>{
          const today=getToday();
          const prevCal=(prev.logs?.[today]?.calories)||0;
          const dbCal=(saved.data.logs?.[today]?.calories)||0;
          const winnerToday=prevCal>=dbCal
            ?{...(saved.data.logs?.[today]||{}),...(prev.logs?.[today]||{})}
            :{...(prev.logs?.[today]||{}),...(saved.data.logs?.[today]||{})};
          const mergedLogs={...(saved.data.logs||{}),...(prev.logs||{}),[today]:winnerToday};
          return{...merge(defaultData,saved.data),...merge(defaultData,prev),
            logs:mergedLogs,
            xp:Math.max(prev.xp||0,saved.data.xp||0),
            streak:Math.max(prev.streak||0,saved.data.streak||0),
            customPresets:[...(saved.data.customPresets||[]),...(prev.customPresets||[]).filter(p=>!(saved.data.customPresets||[]).some(s=>s.name===p.name))],
          };
        });
        setThemeName(saved.theme||"dark");
      }
      loadedFromDB.current=true;
    }).catch(e=>{
      console.warn("Supabase load failed",e);
      loadedFromDB.current=true;
    });
  },[]);

  useEffect(()=>{
    // Save to localStorage immediately on every change
    try{localStorage.setItem("rajvir_ft",JSON.stringify({data,theme:themeName}));}catch(e){}
    if(!loadedFromDB.current) return;
    const timeout=setTimeout(()=>{saveData(data,themeName);},800);
    return()=>clearTimeout(timeout);
  },[data,themeName]);

  // Level up detection
  useEffect(()=>{
    const prev=getLevelInfo(prevXP.current).level;
    const curr=getLevelInfo(data.xp).level;
    if(curr>prev&&prevXP.current>0){setLevelUp({level:curr+1,name:getLevelInfo(data.xp).name});setTimeout(()=>setLevelUp(null),4000);}
    prevXP.current=data.xp;
  },[data.xp]);

  // Check real life rewards unlock
  useEffect(()=>{
    const totalSessions=Object.values(data.logs).filter(l=>l.gym).length;
    const weightEntries2=Object.entries(data.weightLog||{}).sort((a,b)=>a[0].localeCompare(b[0]));const startW=weightEntries2[0]?.[1]||79.4;const currW=weightEntries2[weightEntries2.length-1]?.[1]||startW;const weightLost=parseFloat((startW-currW).toFixed(1));
    const allRewards=[...SUGGESTED_REWARDS,...(data.customRewards||[])];
    allRewards.forEach(r=>{
      if(data.claimedRewards?.[r.id]) return;
      const trigger=r.trigger;
      if(!trigger) return;
      let unlocked=false;
      if(trigger.type==="sessions"&&totalSessions>=trigger.value) unlocked=true;
      if(trigger.type==="weight_lost"&&weightLost>=trigger.value) unlocked=true;
      if(trigger.type==="streak"&&data.streak>=trigger.value) unlocked=true;
      if(unlocked&&!prevData.current.claimedRewards?.[r.id]){
        showNotif(`🏆 REWARD UNLOCKED: ${r.title}!`,"reward");
      }
    });
    prevData.current=data;
  },[data.xp,data.streak]);

  useEffect(()=>{
    if(restTimer!==null&&restTimer>0){timerRef.current=setTimeout(()=>setRestTimer(t=>t-1),1000);}
    else if(restTimer===0){showNotif("⏱️ REST DONE — NEXT SET!","warning");setRestTimer(null);}
    return()=>clearTimeout(timerRef.current);
  },[restTimer]);

  useEffect(()=>{
    if(focusTimer!==null&&focusTimer>0){focusRef.current=setTimeout(()=>setFocusTimer(t=>t-1),1000);}
    else if(focusTimer===0){
      if(focusMode==="work"){setFocusMode("break");setFocusTimer(5*60);showNotif("☕ BREAK — 5 mins","warning");}
      else{setFocusCycles(c=>c+1);setFocusMode("work");setFocusTimer(25*60);showNotif("🎵 FOCUS — 25 mins");}
    }
    return()=>clearTimeout(focusRef.current);
  },[focusTimer,focusMode]);

  const today=getToday();
  const todayLog=data.logs[today]||{calories:0,protein:0,sodium:0,fiber:0,steps:0,gym:false,homeGym:false,meals:[],water:0,sleep:0,mood:0,hr:0,notes:"",cardioSessions:[],supplements:[],routine:[]};
  const levelInfo=getLevelInfo(data.xp);
  const xpMult=data.streak>=7?1.5:data.streak>=3?1.2:1.0;
  const maintenance=data.calSettings?.maintenance||2200;
  const deficitAmt=data.calSettings?.deficit||500;
  const calTarget=Math.max(maintenance-deficitAmt,1200);
  const fiberTarget=Math.max(25,Math.round((todayLog.protein||0)*0.18));
  const energy=calcEnergy(todayLog,energyBoost);
  const dailyMissions=getDailyMissions(today);
  const selectedMissions=data.missionDate===today?data.selectedMissions:[];
  const weightEntries=Object.entries(data.weightLog||{}).sort((a,b)=>a[0].localeCompare(b[0]));
  const startWeight=weightEntries[0]?.[1]||79.4;
  const currentWeight=weightEntries[weightEntries.length-1]?.[1]||startWeight;
  const lostWeight=parseFloat((startWeight-currentWeight).toFixed(1));
  const goalDiff=startWeight-(data.goalWeight||74);const goalProgress=goalDiff<=0?0:Math.min(Math.max(((startWeight-currentWeight)/goalDiff)*100,0),100);
  const weekDays=getWeekDays();
  const weekLogs=weekDays.map(d=>({...d,log:data.logs[d.date]||null}));
  const weekGymCount=weekLogs.filter(d=>d.log?.gym).length;
  const totalSessions=Object.values(data.logs).filter(l=>l.gym).length;

  // Last time each muscle group was trained
  const lastMuscleTrain={};
  Object.entries(data.logs||{}).sort((a,b)=>b[0].localeCompare(a[0])).forEach(([date,log])=>{
    if(log.gymPlan){
      const muscles=WORKOUT_PLANS[log.gymPlan]?.muscles||[];
      muscles.forEach(m=>{if(!lastMuscleTrain[m])lastMuscleTrain[m]=date;});
    }
  });

  const showNotif=(msg,type="success")=>{setNotif({msg,type});setTimeout(()=>setNotif(null),3500);};

  const updateLog=(updates,xpGain=0,notifMsg=null)=>{
    setData(prev=>{
      const prevLog=prev.logs[today]||{calories:0,protein:0,sodium:0,fiber:0,steps:0,gym:false,homeGym:false,meals:[],water:0,sleep:0,mood:0,hr:0,notes:"",cardioSessions:[],supplements:[],routine:[]};
      let streak=prev.streak;
      if(updates.gym&&!prevLog.gym){
        const yd=new Date();yd.setDate(yd.getDate()-1);const yk=yd.toISOString().split("T")[0];
        streak=(prev.lastGymDate===yk||prev.lastGymDate===today)?streak+1:1;
      }
      const gained=Math.round(xpGain*xpMult);
      const newLog={...prevLog,...updates};
      if(updates.meals!==undefined)newLog.meals=updates.meals;
      if(updates.cardioSessions!==undefined)newLog.cardioSessions=updates.cardioSessions;
      if(updates.supplements!==undefined)newLog.supplements=updates.supplements;
      if(updates.routine!==undefined)newLog.routine=updates.routine;
      return{...prev,xp:prev.xp+gained,streak:updates.gym?streak:prev.streak,
        lastGymDate:updates.gym?today:prev.lastGymDate,logs:{...prev.logs,[today]:newLog}};
    });
    if(notifMsg) showNotif(notifMsg);
  };

  const addMeal=(meal)=>{
    const cal=parseInt(meal.calories)||0,prot=parseInt(meal.protein)||0,sod=parseInt(meal.sodium)||0,fib=parseInt(meal.fiber)||0;
    const prevLog=data.logs[today]||{calories:0,protein:0,sodium:0,fiber:0,meals:[]};
    updateLog({
      calories:(prevLog.calories||0)+cal,protein:(prevLog.protein||0)+prot,
      sodium:(prevLog.sodium||0)+sod,fiber:(prevLog.fiber||0)+fib,
      meals:[...(prevLog.meals||[]),{name:meal.name,calories:cal,protein:prot,sodium:sod,fiber:fib,time:new Date().getHours()}]
    },10,`+${Math.round(10*xpMult)}XP! ${meal.name}`);
    setMealInput({name:"",calories:"",protein:"",sodium:""});setCustomMeal(false);
  };

  // ── GYM SESSION ─────────────────────────────────────────────────────────────
  const startSession=(planKey)=>{
    const plan=WORKOUT_PLANS[planKey];
    const session={
      planKey,planName:plan.name,startTime:Date.now(),
      exercises:plan.exercises.map(ex=>({
        ...ex,
        lastWeight:data.exercisePRs?.[ex.name]||0,
        sets:[],note:"",
        lastSessionWeight:getLastWeight(ex.name),
      }))
    };
    setActiveSession(session);
    setGymView("session");
  };

  const getLastWeight=(exName)=>{
    const recent=Object.entries(data.logs||{}).sort((a,b)=>b[0].localeCompare(a[0]));
    for(const [,log] of recent){
      if(log.exerciseWeights?.[exName]) return log.exerciseWeights[exName];
    }
    return null;
  };

  const logSet=(exName)=>{
    const inp=setLogInput[exName]||{};
    if(!inp.reps&&!inp.weight) return;
    setActiveSession(prev=>({
      ...prev,
      exercises:prev.exercises.map(ex=>ex.name===exName?{
        ...ex,sets:[...ex.sets,{reps:inp.reps||"",weight:parseFloat(inp.weight)||0,time:Date.now()}]
      }:ex)
    }));
    setSetLogInput(p=>({...p,[exName]:{reps:"",weight:""}}));
    // auto start rest timer based on exercise
    const ex=activeSession?.exercises.find(e=>e.name===exName);
    if(ex?.rest) setRestTimer(ex.rest);
  };

  const finishSession=()=>{
    if(!activeSession) return;
    const duration=Math.round((Date.now()-activeSession.startTime)/60000);
    let totalVol=0;let newPRs=[];
    const exerciseWeights={};
    activeSession.exercises.forEach(ex=>{
      if(ex.sets.length===0) return;
      const maxWeight=Math.max(...ex.sets.map(s=>s.weight||0));
      const totalSets=ex.sets.length;
      const avgReps=ex.sets.reduce((a,s)=>a+parseInt(s.reps||0),0)/totalSets;
      const vol=ex.sets.reduce((a,s)=>a+(s.weight||0)*(parseInt(s.reps||0)||0),0);
      totalVol+=vol;
      exerciseWeights[ex.name]=maxWeight;
      if(maxWeight>(data.exercisePRs?.[ex.name]||0)&&maxWeight>0){
        newPRs.push({name:ex.name,weight:maxWeight});
      }
    });
    const sessionData={
      date:today,planKey:activeSession.planKey,planName:activeSession.planName,
      duration,totalVolume:totalVol,exercises:activeSession.exercises,
      note:sessionNote,newPRs,
    };
    // Update PRs
    const updatedPRs={...data.exercisePRs};
    newPRs.forEach(pr=>{updatedPRs[pr.name]=pr.weight;});
    const xpGain=75+newPRs.length*25+(totalVol>0?20:0);
    setData(prev=>({
      ...prev,
      xp:prev.xp+Math.round(xpGain*xpMult),
      exercisePRs:updatedPRs,
      totalVolume:(prev.totalVolume||0)+totalVol,
      sessionHistory:[...(prev.sessionHistory||[]).slice(-19),sessionData],
    }));
    updateLog({gym:true,gymPlan:activeSession.planKey,exerciseWeights},0);
    setPostSession(sessionData);
    setActiveSession(null);setSessionNote("");setSetLogInput({});
    setGymView("post");
    showNotif(`🏋️ SESSION DONE! +${Math.round(xpGain*xpMult)}XP${newPRs.length>0?` 🏆 ${newPRs.length} NEW PR!`:""}`)
  };

  const selectMission=(mId)=>{
    if(selectedMissions.length>=3&&!selectedMissions.includes(mId)) return;
    const updated=selectedMissions.includes(mId)?selectedMissions.filter(m=>m!==mId):[...selectedMissions,mId];
    setData(prev=>({...prev,selectedMissions:updated,missionDate:today}));
  };

  const claimMission=(mission)=>{
    if(!mission.check(todayLog)){showNotif("Not completed yet!","error");return;}
    if(data.logs[today]?.[`md_${mission.id}`]){showNotif("Already claimed!","warning");return;}
    const gained=Math.round(mission.xp*xpMult);
    const allDone=selectedMissions.filter(mid=>mid!==mission.id).every(mid=>{
      const m=ALL_MISSIONS.find(x=>x.id===mid);return m&&m.check(todayLog);
    });
    const bonus=allDone&&selectedMissions.length>=3?50:0;
    setData(prev=>({...prev,xp:prev.xp+gained+bonus,missionsCompleted:(prev.missionsCompleted||0)+1,
      logs:{...prev.logs,[today]:{...(prev.logs[today]||{}),["md_"+mission.id]:true}}}));
    showNotif(`🎯 +${gained}XP${bonus>0?` +${bonus} BONUS!`:""}`);
  };

  const defeatBoss=(boss)=>{
    if(data.bossesDefeated?.[boss.id]){showNotif("Already defeated!","warning");return;}
    setData(prev=>({...prev,xp:prev.xp+boss.xp,
      bossesDefeated:{...prev.bossesDefeated,[boss.id]:true},
      streakFreezes:(prev.streakFreezes||0)+(boss.id==="b1"?3:boss.id==="b2"?1:0),
      unlockedThemes:[...new Set([...(prev.unlockedThemes||[]),
        boss.id==="b2"?"gold":boss.id==="b4"?"neon":boss.id==="b5"?"crimson":"dark"])]}));
    showNotif(`⚔️ BOSS DEFEATED! +${boss.xp}XP!`);
  };

  const useStreakFreeze=()=>{
    if((data.streakFreezes||0)<1){showNotif("No freezes left!","error");return;}
    setData(prev=>({...prev,streakFreezes:prev.streakFreezes-1,lastGymDate:today}));
    showNotif("❄️ Streak protected!");
  };

  const claimReward=(rewardId)=>{
    setData(prev=>({...prev,claimedRewards:{...prev.claimedRewards,[rewardId]:today}}));
    showNotif("🎁 Reward claimed! You deserve it 💪");
  };

  const addCustomReward=()=>{
    if(!rewardInput.title||!rewardInput.milestone) return;
    const newR={...rewardInput,id:`cr_${Date.now()}`,trigger:{type:"custom"}};
    setData(prev=>({...prev,customRewards:[...(prev.customRewards||[]),newR]}));
    setRewardInput({title:"",category:"🎯 Personal",milestone:""});
    setShowAddReward(false);
    showNotif("🎯 Reward goal added!");
  };

  const isRewardUnlocked=(r)=>{
    if(!r.trigger||r.trigger.type==="custom") return false;
    if(r.trigger.type==="sessions"&&totalSessions>=r.trigger.value) return true;
    if(r.trigger.type==="weight_lost"&&lostWeight>=r.trigger.value) return true;
    if(r.trigger.type==="streak"&&data.streak>=r.trigger.value) return true;
    return false;
  };

  const rewardProgress=(r)=>{
    if(!r.trigger||r.trigger.type==="custom") return 0;
    if(r.trigger.type==="sessions") return pct(totalSessions,r.trigger.value);
    if(r.trigger.type==="weight_lost") return pct(Math.max(lostWeight,0),r.trigger.value);
    if(r.trigger.type==="streak") return pct(data.streak,r.trigger.value);
    return 0;
  };

  const unlockedClasses=CLASSES.filter(c=>c.check(data));
  const year=calMonth.getFullYear(),month=calMonth.getMonth();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const firstDay=new Date(year,month,1).getDay();

  // Style helpers — sensitive to light mode
  const iStyle={width:"100%",background:T.input,border:`2px solid ${T.border}`,borderRadius:"7px",
    padding:"10px 12px",color:T.text,fontSize:"12px",fontFamily:"monospace",
    boxSizing:"border-box",display:"block",fontWeight:isLight?"600":"400"};
  const bStyle=(color,textDark=true)=>({width:"100%",marginTop:"10px",padding:"13px",
    background:`linear-gradient(135deg,${color},${color}cc)`,border:"none",borderRadius:"8px",
    color:textDark?"#000":"#fff",fontSize:"11px",fontWeight:"bold",cursor:"pointer",
    letterSpacing:"2px",fontFamily:"monospace",display:"block"});
  const cStyle={background:T.card,borderRadius:"10px",padding:"14px",
    border:`2px solid ${T.border}`,marginBottom:"10px",boxShadow:T.shadow};
  const labelStyle={fontSize:"9px",color:T.muted,letterSpacing:"3px",marginBottom:"8px",
    fontWeight:isLight?"700":"400"};
  const valueStyle=(color)=>({fontSize:"22px",fontWeight:"bold",color,lineHeight:1});
  const mutedText={fontSize:"10px",color:T.muted,fontWeight:isLight?"600":"400"};

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"monospace",
      padding:"14px",maxWidth:"480px",margin:"0 auto",transition:"all 0.3s"}}>

      {/* LEVEL UP */}
      {levelUp&&(
        <div onClick={()=>setLevelUp(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:10000,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"64px",animation:"bounce 0.4s ease infinite alternate"}}>⚡</div>
            <div style={{fontSize:"13px",color:ACCENT.gym,letterSpacing:"6px",marginTop:"16px"}}>LEVEL UP!</div>
            <div style={{fontSize:"56px",fontWeight:"bold",color:ACCENT.gym,lineHeight:1,margin:"8px 0"}}>{levelUp.level}</div>
            <div style={{fontSize:"20px",color:ACCENT.steps,letterSpacing:"3px"}}>{levelUp.name.toUpperCase()}</div>
            <div style={{fontSize:"11px",color:"#666",marginTop:"16px",letterSpacing:"2px"}}>TAP TO CONTINUE</div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",
          background:notification.type==="warning"?ACCENT.gym:notification.type==="error"?ACCENT.protein:notification.type==="reward"?ACCENT.reward:ACCENT.steps,
          color:"#000",padding:"10px 22px",borderRadius:"8px",fontWeight:"bold",
          zIndex:9999,fontSize:"12px",letterSpacing:"1px",whiteSpace:"nowrap",
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"pop 0.3s ease"}}>
          {notification.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{marginBottom:"14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div>
            <div style={{fontSize:"9px",color:T.muted,letterSpacing:"5px",fontWeight:isLight?"700":"400"}}>TRAINING ARC</div>
            <div style={{fontSize:"24px",fontWeight:"bold",color:ACCENT.steps,letterSpacing:"-1px",lineHeight:1}}>RAJVIR.EXE</div>
            {unlockedClasses.length>0&&(
              <div style={{fontSize:"10px",marginTop:"3px",color:unlockedClasses[0].color,fontWeight:"bold",letterSpacing:"1px"}}>
                {unlockedClasses[0].icon} {unlockedClasses[0].name.toUpperCase()}
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"5px"}}>
            <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
              {(data.unlockedThemes||["dark","light"]).map(tn=>(
                <button key={tn} onClick={()=>setThemeName(tn)} style={{
                  width:"22px",height:"22px",borderRadius:"50%",cursor:"pointer",
                  background:tn==="dark"?"#07070e":tn==="light"?"#f2f2fa":tn==="gold"?"#ffd700":tn==="crimson"?"#ff2255":"#00d4aa",
                  border:themeName===tn?`3px solid ${ACCENT.steps}`:`2px solid ${T.border}`}} title={THEMES[tn]?.name}/>
              ))}
            </div>
            <div style={{background:"linear-gradient(135deg,#ff6b35,#ffd700)",borderRadius:"6px",
              padding:"5px 12px",fontSize:"11px",fontWeight:"bold",color:"#000",letterSpacing:"1px"}}>
              LVL {levelInfo.level+1} · {levelInfo.name.toUpperCase()}
            </div>
            <div style={{...mutedText}}>{data.xp.toLocaleString()} XP{xpMult>1&&<span style={{color:ACCENT.gym}}> · 🔥{xpMult}x</span>}</div>
          </div>
        </div>
        <div style={{background:T.sub,borderRadius:"3px",height:"5px",overflow:"hidden",marginBottom:"6px",border:`1px solid ${T.border}`}}>
          <div style={{height:"100%",width:`${levelInfo.progress}%`,background:"linear-gradient(90deg,#ff6b35,#ffd700)",transition:"width 0.6s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",...mutedText,marginBottom:"10px"}}>
          <span>{levelInfo.toNext} XP to LVL {levelInfo.level+2}</span>
          <span>{Math.round(levelInfo.progress)}%</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"5px"}}>
          {[
            {l:"STREAK",v:`🔥${data.streak}`,c:ACCENT.gym},
            {l:"GYM",v:totalSessions,c:ACCENT.steps},
            {l:"KG LOST",v:lostWeight>0?`-${lostWeight}`:"-",c:ACCENT.protein},
            {l:"❄️",v:data.streakFreezes||0,c:ACCENT.water},
          ].map(s=>(
            <div key={s.l} style={{...cStyle,marginBottom:0,textAlign:"center",padding:"8px"}}>
              <div style={{fontSize:"15px",fontWeight:"bold",color:s.c}}>{s.v}</div>
              <div style={{fontSize:"8px",color:T.muted,letterSpacing:"1px",fontWeight:isLight?"700":"400"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:"2px",marginBottom:"12px",background:T.card,borderRadius:"10px",padding:"3px",overflowX:"auto",border:`2px solid ${T.border}`}}>
        {[["TODAY","dashboard"],["LOG","log"],["GYM","gym"],["QUESTS","quests"],["CHARTS","charts"],["CAL","calendar"],["REPORTS","reports"],["REWARDS","rewards"],["STATS","stats"],["❓","help"]].map(([label,id])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:"0 0 auto",padding:"7px 10px",borderRadius:"7px",border:"none",
            background:tab===id?ACCENT.steps:"transparent",
            color:tab===id?"#000":T.muted,
            fontSize:"9px",fontWeight:"bold",cursor:"pointer",letterSpacing:"1px",
            transition:"all 0.2s",fontFamily:"monospace",whiteSpace:"nowrap"}}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ TODAY ══ */}
      {tab==="dashboard"&&(
        <div>
          {/* ENERGY CARD */}
          <div style={{...cStyle,border:`2px solid ${energy.color}66`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
              <div>
                <div style={labelStyle}>ENERGY LEVEL</div>
                <div style={{fontSize:"32px",fontWeight:"bold",color:energy.color,lineHeight:1}}>{energy.score}</div>
                <div style={{fontSize:"14px",fontWeight:"bold",color:energy.color,marginTop:"2px"}}>{energy.label}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"9px",color:T.muted,marginBottom:"6px",fontWeight:isLight?"700":"400"}}>SELF INPUT</div>
                <div style={{display:"flex",gap:"4px"}}>
                  {[-10,-5,0,5,10].map(v=>(
                    <button key={v} onClick={()=>setEnergyBoost(v)} style={{width:"28px",height:"28px",borderRadius:"6px",border:`1px solid ${energyBoost===v?energy.color:T.border}`,background:energyBoost===v?energy.color+"33":T.sub,color:energyBoost===v?energy.color:T.muted,fontSize:"9px",cursor:"pointer",fontWeight:"bold"}}>
                      {v===0?"–":v>0?"+"+v:v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{background:T.sub,borderRadius:"4px",height:"8px",overflow:"hidden",marginBottom:"10px",border:`1px solid ${T.border}`}}>
              <div style={{height:"100%",width:`${energy.score}%`,background:`linear-gradient(90deg,${energy.color}88,${energy.color})`,borderRadius:"4px",transition:"width 0.6s"}}/>
            </div>
            {energy.suggestions.map((s,i)=>(
              <div key={i} style={{fontSize:"11px",color:energy.color,marginBottom:"4px",fontWeight:"bold",padding:"6px 10px",background:energy.color+"11",borderRadius:"6px",border:`1px solid ${energy.color}22`}}>{s}</div>
            ))}
          </div>

          {/* FIBER REMINDER */}
          {(todayLog.protein||0)>=80&&(todayLog.fiber||0)<fiberTarget&&(
            <div style={{...cStyle,border:`2px solid ${ACCENT.fiber}66`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={labelStyle}>FIBER REMINDER</div>
                  <div style={{fontSize:"12px",fontWeight:"bold",color:ACCENT.fiber}}>High protein needs high fiber!</div>
                  <div style={mutedText}>{todayLog.fiber||0}g of {fiberTarget}g target</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"18px",fontWeight:"bold",color:ACCENT.fiber}}>{Math.max(fiberTarget-(todayLog.fiber||0),0)}g</div>
                  <div style={mutedText}>still needed</div>
                </div>
              </div>
              <div style={{background:T.sub,borderRadius:"3px",height:"5px",overflow:"hidden",marginTop:"8px",border:`1px solid ${T.border}`}}>
                <div style={{height:"100%",width:`${pct(todayLog.fiber||0,fiberTarget)}%`,background:ACCENT.fiber,borderRadius:"3px"}}/>
              </div>
              <div style={mutedText}>Sources: Dal, soya, roti, banana, oats</div>
            </div>
          )}

          {/* Forecast */}
          <div style={{...cStyle,border:`2px solid ${pct(todayLog.calories,calTarget)>=90&&pct(todayLog.protein,120)>=90?ACCENT.steps:T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={labelStyle}>TODAY'S FORECAST</div>
                <div style={{fontSize:"14px",fontWeight:"bold",color:todayLog.calories>0?ACCENT.steps:T.muted}}>
                  {todayLog.calories>0?(pct(todayLog.protein,120)>=100&&pct(todayLog.calories,calTarget)>=80?"✓ ON TRACK":"📊 IN PROGRESS"):"No data yet"}
                </div>
                <div style={mutedText}>{Math.max(calTarget-todayLog.calories,0)} cal left · {Math.max(120-todayLog.protein,0)}g protein left</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={labelStyle}>BURN TODAY</div>
                <div style={{fontSize:"20px",fontWeight:"bold",color:ACCENT.cal}}>
                  {(1950+(todayLog.steps>=15000?680:todayLog.steps>=10000?510:todayLog.steps>=5000?210:100)+(todayLog.gym?350:0)).toLocaleString()}
                </div>
                <div style={mutedText}>kcal burned</div>
              </div>
            </div>
          </div>

          {/* Cal + Protein big cards */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
            {[
              {label:"CALORIES",current:todayLog.calories,target:calTarget,color:ACCENT.cal,unit:"kcal"},
              {label:"PROTEIN",current:todayLog.protein,target:120,color:ACCENT.protein,unit:"g"},
            ].map(s=>(
              <div key={s.label} style={cStyle}>
                <div style={labelStyle}>{s.label}</div>
                <div style={valueStyle(s.color)}>{s.current}<span style={{fontSize:"12px"}}>{s.unit}</span></div>
                <div style={{...mutedText,marginBottom:"6px"}}>/{s.target}{s.unit} · {Math.round(pct(s.current,s.target))}%</div>
                <div style={{background:T.sub,borderRadius:"4px",height:"7px",overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <div style={{height:"100%",width:`${pct(s.current,s.target)}%`,
                    background:pct(s.current,s.target)>=100?"linear-gradient(90deg,#00d4aa,#00ff88)":`linear-gradient(90deg,${s.color}88,${s.color})`,
                    borderRadius:"4px",transition:"width 0.5s"}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Other metrics */}
          {[
            {label:"STEPS",current:todayLog.steps,target:10000,color:ACCENT.steps,unit:"",sub:todayLog.steps>=10000?"✓ 10K DONE!":"Need "+(Math.max(0,10000-todayLog.steps)).toLocaleString()+" more"},
            {label:"FIBER",current:todayLog.fiber||0,target:fiberTarget,color:ACCENT.fiber,unit:"g",sub:(todayLog.fiber||0)>=fiberTarget?"✓ Fiber target hit":"Need "+(Math.max(0,fiberTarget-(todayLog.fiber||0)))+"g more"},
            {label:"WATER",current:todayLog.water||0,target:8,color:ACCENT.water,unit:" glasses",sub:`${(todayLog.water||0)*250}ml of 2000ml`},
            {label:"SODIUM",current:todayLog.sodium||0,target:2300,color:"#ffaa44",unit:"mg",sub:(todayLog.sodium||0)>2300?"⚠️ Over limit":"✓ Within range"},
          ].map(s=>(
            <div key={s.label} style={cStyle}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"6px"}}>
                <div><div style={labelStyle}>{s.label}</div>
                  <div style={valueStyle(s.color)}>{s.current.toLocaleString()}<span style={{fontSize:"11px"}}>{s.unit}</span></div>
                </div>
                <div style={{fontSize:"14px",fontWeight:"bold",color:pct(s.current,s.target)>=100?ACCENT.steps:T.muted}}>{Math.round(pct(s.current,s.target))}%</div>
              </div>
              <div style={{background:T.sub,borderRadius:"4px",height:"6px",overflow:"hidden",marginBottom:"4px",border:`1px solid ${T.border}`}}>
                <div style={{height:"100%",width:`${pct(s.current,s.target)}%`,
                  background:pct(s.current,s.target)>=100?ACCENT.steps:`linear-gradient(90deg,${s.color}66,${s.color})`,borderRadius:"4px"}}/>
              </div>
              <div style={{...mutedText,color:pct(s.current,s.target)>=100?ACCENT.steps:T.muted}}>{s.sub}</div>
            </div>
          ))}

          {/* Sleep Mood HR */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"10px"}}>
            {[{l:"SLEEP",v:todayLog.sleep?(todayLog.sleep+"h"):"—",c:ACCENT.sleep,i:"😴"},
              {l:"MOOD",v:todayLog.mood?(todayLog.mood+"/10"):"—",c:ACCENT.mood,i:"😤"},
              {l:"HR",v:todayLog.hr?(todayLog.hr+"bpm"):"—",c:ACCENT.protein,i:"🫀"}].map(s=>(
              <div key={s.l} style={{...cStyle,marginBottom:0,textAlign:"center",padding:"10px"}}>
                <div style={{fontSize:"18px"}}>{s.i}</div>
                <div style={{fontSize:"13px",fontWeight:"bold",color:s.c}}>{s.v}</div>
                <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>{s.l}</div>
              </div>
            ))}
          </div>

          <button onClick={()=>{updateLog({gym:true},75,`🏋️ +${Math.round(75*xpMult)}XP! Streak ${data.streak+1}🔥`);}}
            disabled={todayLog.gym}
            style={{width:"100%",padding:"16px",marginBottom:"6px",
              background:todayLog.gym?"transparent":"linear-gradient(135deg,#ff6b35,#ffd700)",
              border:todayLog.gym?`2px solid ${ACCENT.steps}`:`2px solid transparent`,
              borderRadius:"10px",color:todayLog.gym?ACCENT.steps:"#000",
              fontSize:"14px",fontWeight:"bold",cursor:todayLog.gym?"default":"pointer",
              letterSpacing:"2px",fontFamily:"monospace"}}>
            {todayLog.gym?"✓ GYM SESSION LOGGED":"🏋️  LOG GYM SESSION"}
          </button>

          {!todayLog.gym&&(data.streakFreezes||0)>0&&data.streak>0&&(
            <button onClick={useStreakFreeze} style={{width:"100%",padding:"10px",background:"transparent",
              border:`2px solid ${ACCENT.water}66`,borderRadius:"8px",marginBottom:"10px",
              color:ACCENT.water,fontSize:"11px",cursor:"pointer",letterSpacing:"1px",fontFamily:"monospace"}}>
              ❄️ USE STREAK FREEZE ({data.streakFreezes} left)
            </button>
          )}

          {/* RESET TODAY */}
          {!confirmReset?(
            <button onClick={()=>setConfirmReset(true)} style={{width:"100%",padding:"8px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:"8px",marginBottom:"10px",color:T.muted,fontSize:"10px",cursor:"pointer",letterSpacing:"1px",fontFamily:"monospace"}}>
              🗑️ RESET TODAY'S DATA
            </button>
          ):(
            <div style={{...cStyle,border:`2px solid ${ACCENT.protein}44`,marginBottom:"10px",textAlign:"center"}}>
              <div style={{fontSize:"12px",fontWeight:"bold",color:ACCENT.protein,marginBottom:"10px"}}>⚠️ Reset all of today's logged data?</div>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={()=>{
                  setData(prev=>({...prev,logs:{...prev.logs,[today]:{calories:0,protein:0,sodium:0,fiber:0,steps:0,gym:false,homeGym:false,meals:[],water:0,sleep:0,mood:0,hr:0,notes:"",cardioSessions:[],supplements:[],routine:[]}}}));
                  setConfirmReset(false);
                  showNotif("🗑️ Today reset");
                }} style={{flex:1,padding:"10px",background:ACCENT.protein,border:"none",borderRadius:"7px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>YES, RESET</button>
                <button onClick={()=>setConfirmReset(false)} style={{flex:1,padding:"10px",background:"none",border:`2px solid ${T.border}`,borderRadius:"7px",color:T.muted,fontSize:"11px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>CANCEL</button>
              </div>
            </div>
          )}

          {/* Today meals */}
          {todayLog.meals?.length>0&&(
            <div>
              <div style={labelStyle}>TODAY'S MEALS</div>
              {todayLog.meals.map((m,i)=>(
                <div key={i} style={{...cStyle,marginBottom:"5px",padding:"10px 12px",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:"12px",fontWeight:isLight?"600":"400"}}>{m.name}</span>
                  <div style={{display:"flex",gap:"8px",fontSize:"11px"}}>
                    <span style={{color:ACCENT.cal,fontWeight:"bold"}}>{m.calories}</span>
                    <span style={{color:ACCENT.protein,fontWeight:"bold"}}>{m.protein}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ LOG ══ */}
      {tab==="log"&&(
        <div>
          <div style={{display:"flex",gap:"2px",marginBottom:"12px",background:T.card,borderRadius:"8px",padding:"3px",overflowX:"auto",border:`2px solid ${T.border}`}}>
            {["meals","body","wellness","cardio","supps","routine","notes"].map(st=>(
              <button key={st} onClick={()=>setSubTab(st)} style={{
                flex:"0 0 auto",padding:"6px 8px",borderRadius:"6px",border:"none",
                background:subTab===st?ACCENT.cal:"transparent",
                color:subTab===st?"#000":T.muted,
                fontSize:"8px",fontWeight:"bold",cursor:"pointer",letterSpacing:"1px",
                fontFamily:"monospace",whiteSpace:"nowrap"}}>
                {st.toUpperCase()}
              </button>
            ))}
          </div>

          {subTab==="meals"&&(
            <div>
              <div style={cStyle}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                  <div style={labelStyle}>QUICK ADD MEAL</div>
                  <button onClick={()=>setCustomMeal(!customMeal)} style={{background:"none",border:`2px solid ${T.border}`,borderRadius:"6px",color:ACCENT.steps,fontSize:"10px",cursor:"pointer",padding:"4px 10px",fontFamily:"monospace",fontWeight:"bold"}}>
                    {customMeal?"PRESETS":"CUSTOM"}
                  </button>
                </div>
                {!customMeal?(
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                      <div style={mutedText}>{PRESET_MEALS.filter(m=>!(data.deletedPresets||[]).includes(m.name)).length+(data.customPresets||[]).length}/20 presets</div>
                      <button onClick={()=>setPresetEditMode(!presetEditMode)} style={{background:presetEditMode?ACCENT.protein+"22":"none",border:`2px solid ${presetEditMode?ACCENT.protein:T.border}`,borderRadius:"6px",color:presetEditMode?ACCENT.protein:T.muted,fontSize:"9px",cursor:"pointer",padding:"3px 10px",fontFamily:"monospace",fontWeight:"bold"}}>
                        {presetEditMode?"✓ DONE":"✏️ EDIT"}
                      </button>
                    </div>
                    {presetEditMode&&(
                      <div style={{...mutedText,marginBottom:"8px",color:ACCENT.protein,fontWeight:"bold"}}>Tap × next to any preset to remove it. Built-ins can be re-added by saving as custom.</div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                      {[...PRESET_MEALS.filter(m=>!(data.deletedPresets||[]).includes(m.name)),...(data.customPresets||[])].map((m,i)=>{
                        const isCustom=i>=PRESET_MEALS.length;
                        return(
                          <div key={i} style={{position:"relative"}}>
                            <button onClick={()=>{if(!presetEditMode)addMeal(m);}} style={{width:"100%",background:isCustom?ACCENT.protein+"11":T.sub,border:`2px solid ${presetEditMode?(isCustom?ACCENT.protein+"88":ACCENT.cal+"66"):isCustom?ACCENT.protein+"44":T.border}`,borderRadius:"8px",padding:"10px 8px",cursor:presetEditMode?"default":"pointer",textAlign:"left",fontFamily:"monospace",color:T.text}}>
                              <div style={{fontSize:"11px",marginBottom:"3px",fontWeight:isLight?"700":"500"}}>{m.name}{isCustom&&<span style={{color:ACCENT.protein,fontSize:"8px"}}> ★</span>}</div>
                              <div style={{fontSize:"9px"}}>
                                <span style={{color:ACCENT.cal,fontWeight:"bold"}}>{m.calories}</span>
                                <span style={{color:T.muted}}> · </span>
                                <span style={{color:ACCENT.protein,fontWeight:"bold"}}>{m.protein}g</span>
                                {m.fiber>0&&<><span style={{color:T.muted}}> · </span><span style={{color:ACCENT.fiber,fontWeight:"bold"}}>{m.fiber}f</span></>}
                              </div>
                            </button>
                            {presetEditMode&&(
                              <button onClick={()=>{
                                if(isCustom){
                                  const ci=i-PRESET_MEALS.length;
                                  setData(prev=>({...prev,customPresets:(prev.customPresets||[]).filter((_,idx)=>idx!==ci)}));
                                } else {
                                  setData(prev=>({...prev,deletedPresets:[...(prev.deletedPresets||[]),m.name]}));
                                }
                                showNotif("🗑️ Preset hidden");
                              }} style={{position:"absolute",top:"-6px",right:"-6px",width:"22px",height:"22px",borderRadius:"50%",background:ACCENT.protein,border:"none",color:"#000",fontSize:"13px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",lineHeight:1,zIndex:10}}>×</button>
                            )}
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                ):(
                  <div>
                    <input value={mealInput.name} onChange={e=>setMealInput(p=>({...p,name:e.target.value}))} placeholder="Meal name" style={iStyle}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginTop:"6px"}}>
                      <input value={mealInput.calories} onChange={e=>setMealInput(p=>({...p,calories:e.target.value}))} placeholder="kcal" type="number" style={iStyle}/>
                      <input value={mealInput.protein} onChange={e=>setMealInput(p=>({...p,protein:e.target.value}))} placeholder="protein g" type="number" style={iStyle}/>
                      <input value={mealInput.fiber||""} onChange={e=>setMealInput(p=>({...p,fiber:e.target.value}))} placeholder="fiber g" type="number" style={iStyle}/>
                      <input value={mealInput.sodium} onChange={e=>setMealInput(p=>({...p,sodium:e.target.value}))} placeholder="sodium mg" type="number" style={iStyle}/>
                    </div>
                    <div onClick={()=>setMealInput(p=>({...p,saveAsPreset:!p.saveAsPreset}))} style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"10px",cursor:"pointer",padding:"8px 10px",borderRadius:"8px",background:mealInput.saveAsPreset?ACCENT.protein+"11":T.sub,border:`2px solid ${mealInput.saveAsPreset?ACCENT.protein+"66":T.border}`}}>
                      <div style={{width:"18px",height:"18px",borderRadius:"4px",background:mealInput.saveAsPreset?ACCENT.protein:"transparent",border:`2px solid ${mealInput.saveAsPreset?ACCENT.protein:T.muted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"bold",color:"#000",flexShrink:0}}>{mealInput.saveAsPreset?"✓":""}</div>
                      <span style={{fontSize:"11px",color:mealInput.saveAsPreset?ACCENT.protein:T.muted,fontWeight:"bold"}}>Save as preset ★</span>
                      {(PRESET_MEALS.filter(m=>!(data.deletedPresets||[]).includes(m.name)).length+(data.customPresets||[]).length)>=20&&<span style={{fontSize:"9px",color:ACCENT.protein}}>(limit reached)</span>}
                    </div>
                    <button onClick={()=>{
                      if(!mealInput.name||!mealInput.calories) return;
                      if(mealInput.saveAsPreset&&(PRESET_MEALS.length+(data.customPresets||[]).length)<20){
                        const preset={name:mealInput.name,calories:parseInt(mealInput.calories)||0,protein:parseInt(mealInput.protein)||0,sodium:parseInt(mealInput.sodium)||0,fiber:parseInt(mealInput.fiber)||0};
                        setData(prev=>({...prev,customPresets:[...(prev.customPresets||[]),preset]}));
                      }
                      addMeal(mealInput);
                    }} style={bStyle(ACCENT.cal)}>ADD MEAL{mealInput.saveAsPreset?" + SAVE PRESET":""}</button>
                  </div>
                )}
              </div>
              <div style={cStyle}>
                <div style={labelStyle}>LOG STEPS</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <input value={stepsInput} onChange={e=>setStepsInput(e.target.value)} placeholder="Steps today" type="number" style={{...iStyle,flex:1}}/>
                  <button onClick={()=>{if(!stepsInput)return;const s=parseInt(stepsInput);const newSteps=(todayLog.steps||0)+s;const x=newSteps>=10000?50:newSteps>=7000?30:15;updateLog({steps:newSteps},x,`+${Math.round(x*xpMult)}XP! ${newSteps.toLocaleString()} 👟`);setStepsInput("");}}
                    style={{background:ACCENT.steps,border:"none",borderRadius:"7px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",padding:"0 16px",fontFamily:"monospace"}}>LOG</button>
                </div>
              </div>
              <div style={cStyle}>
                <div style={labelStyle}>WATER 💧</div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
                  {Array(8).fill(null).map((_,i)=>(
                    <button key={i} onClick={()=>updateLog({water:i+1},5)} style={{width:"38px",height:"38px",borderRadius:"8px",
                      border:`2px solid ${i<(todayLog.water||0)?ACCENT.water:T.border}`,
                      background:i<(todayLog.water||0)?ACCENT.water+"33":T.sub,
                      color:i<(todayLog.water||0)?ACCENT.water:T.muted,fontSize:"16px",cursor:"pointer"}}>💧</button>
                  ))}
                </div>
                <div style={{...mutedText,color:ACCENT.water,fontWeight:"bold"}}>{todayLog.water||0}/8 · {(todayLog.water||0)*250}ml</div>
              </div>
            </div>
          )}

          {subTab==="body"&&(
            <div>
              <div style={cStyle}>
                <div style={labelStyle}>MONDAY WEIGH-IN ⚖️</div>
                <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                  <input value={weightInput} onChange={e=>setWeightInput(e.target.value)} placeholder="kg e.g. 79.1" type="number" step="0.1" style={{...iStyle,flex:1}}/>
                  <button onClick={()=>{if(!weightInput)return;setData(prev=>({...prev,weightLog:{...prev.weightLog,[getMonday(today)]:parseFloat(weightInput)}}));showNotif(`⚖️ ${weightInput}kg`);setWeightInput("");}}
                    style={{background:ACCENT.gym,border:"none",borderRadius:"7px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",padding:"0 16px",fontFamily:"monospace"}}>LOG</button>
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  <input value={goalInput} onChange={e=>setGoalInput(e.target.value)} placeholder={`Goal: ${data.goalWeight}kg`} type="number" step="0.1" style={{...iStyle,flex:1}}/>
                  <button onClick={()=>{if(!goalInput)return;setData(prev=>({...prev,goalWeight:parseFloat(goalInput)}));showNotif(`🎯 Goal: ${goalInput}kg`);setGoalInput("");}}
                    style={{background:"#b06aff",border:"none",borderRadius:"7px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",padding:"0 16px",fontFamily:"monospace"}}>SET</button>
                </div>
                <div style={{marginTop:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                    <span style={mutedText}>Start: {startWeight}kg</span>
                    <span style={mutedText}>Goal: {data.goalWeight}kg</span>
                  </div>
                  <div style={{background:T.sub,borderRadius:"4px",height:"8px",overflow:"hidden",border:`1px solid ${T.border}`}}>
                    <div style={{height:"100%",width:`${goalProgress}%`,background:"linear-gradient(90deg,#ff4d88,#00d4aa)"}}/>
                  </div>
                  <div style={{fontSize:"10px",color:ACCENT.steps,marginTop:"4px",fontWeight:"bold"}}>{Math.round(goalProgress)}% · {lostWeight>0?lostWeight+"kg lost":"Starting"}</div>
                </div>
                {weightEntries.length>0&&(
                  <div style={{marginTop:"10px"}}>
                    {weightEntries.slice(-4).reverse().map(([date,w],i,arr)=>{
                      const prev=arr[i+1]?.[1];const diff=prev?(w-prev).toFixed(1):null;
                      return(
                        <div key={date} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:"11px"}}>
                          <span style={mutedText}>{new Date(date).toLocaleDateString("en-CA",{month:"short",day:"numeric"})}</span>
                          <div style={{display:"flex",gap:"8px"}}>
                            {diff&&<span style={{color:parseFloat(diff)<=0?ACCENT.steps:ACCENT.protein,fontWeight:"bold"}}>{parseFloat(diff)<=0?"▼":"▲"}{Math.abs(diff)}</span>}
                            <span style={{color:ACCENT.gym,fontWeight:"bold"}}>{w}kg</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={cStyle}>
                <div style={labelStyle}>MEASUREMENTS (cm)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"8px"}}>
                  {["waist","chest","arms"].map(k=>(
                    <input key={k} value={measureInput[k]} onChange={e=>setMeasureInput(p=>({...p,[k]:e.target.value}))} placeholder={k} type="number" style={iStyle}/>
                  ))}
                </div>
                <button onClick={()=>{setData(prev=>({...prev,logs:{...prev.logs,[today]:{...(prev.logs[today]||{}),measurements:{...measureInput}}}}));showNotif("📏 Saved");setMeasureInput({waist:"",chest:"",arms:""});}} style={bStyle("#ffaa44")}>SAVE</button>
              </div>
              <div style={cStyle}>
                <div style={labelStyle}>🔥 CALORIE SETTINGS</div>
                <div style={{...mutedText,marginBottom:"12px"}}>
                  Your target = Maintenance − Deficit. Current: {data.calSettings?.maintenance||2200} − {data.calSettings?.deficit||500} = <span style={{color:ACCENT.cal,fontWeight:"bold"}}>{Math.max((data.calSettings?.maintenance||2200)-(data.calSettings?.deficit||500),1200)} kcal/day</span>
                </div>
                <div style={{marginBottom:"8px"}}>
                  <div style={labelStyle}>MAINTENANCE CALORIES (TDEE)</div>
                  <div style={{...mutedText,marginBottom:"6px"}}>Your total daily energy expenditure — calories burned doing nothing + daily activity. Use a TDEE calculator online for accuracy. Average sedentary male ~2000–2400.</div>
                  <div style={{display:"flex",gap:"8px"}}>
                    <input
                      defaultValue={data.calSettings?.maintenance||2200}
                      onBlur={e=>{const v=parseInt(e.target.value);if(v>0)setData(prev=>({...prev,calSettings:{...prev.calSettings,maintenance:v}}));}}
                      placeholder="e.g. 2200" type="number" style={{...iStyle,flex:1}}/>
                  </div>
                </div>
                <div style={{marginBottom:"8px"}}>
                  <div style={labelStyle}>DAILY DEFICIT</div>
                  <div style={{...mutedText,marginBottom:"6px"}}>How much below maintenance to eat. 300–500 = moderate cut. 500–700 = aggressive. ~500 deficit = ~0.5kg/week loss.</div>
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"8px"}}>
                    {[250,350,500,600,750].map(d=>(
                      <button key={d} onClick={()=>setData(prev=>({...prev,calSettings:{...prev.calSettings,deficit:d}}))} style={{padding:"6px 12px",borderRadius:"6px",border:`2px solid ${(data.calSettings?.deficit||500)===d?ACCENT.cal:T.border}`,background:(data.calSettings?.deficit||500)===d?ACCENT.cal+"22":T.sub,color:(data.calSettings?.deficit||500)===d?ACCENT.cal:T.muted,fontSize:"11px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
                        -{d}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{background:T.sub,borderRadius:"8px",padding:"10px",border:`1px solid ${T.border}`}}>
                  <div style={{...mutedText,fontWeight:"bold",color:ACCENT.steps}}>📊 At {data.calSettings?.deficit||500} cal deficit:</div>
                  <div style={mutedText}>~{((data.calSettings?.deficit||500)*7/7700).toFixed(2)}kg lost per week</div>
                  <div style={mutedText}>~{((data.calSettings?.deficit||500)*30/7700).toFixed(1)}kg lost per month</div>
                </div>
              </div>
            </div>
          )}

          {subTab==="wellness"&&(
            <div>
              <div style={cStyle}>
                <div style={labelStyle}>SLEEP 😴</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <input value={sleepInput} onChange={e=>setSleepInput(e.target.value)} placeholder="Hours" type="number" step="0.5" style={{...iStyle,flex:1}}/>
                  <button onClick={()=>{if(!sleepInput)return;const h=parseFloat(sleepInput);const x=h>=8?20:h>=7?10:5;updateLog({sleep:h},x,`😴 ${h}h +${Math.round(x*xpMult)}XP`);setSleepInput("");}}
                    style={{background:ACCENT.sleep,border:"none",borderRadius:"7px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",padding:"0 16px",fontFamily:"monospace"}}>LOG</button>
                </div>
              </div>
              <div style={cStyle}>
                <div style={labelStyle}>MOOD 😤 — {moodInput}/10</div>
                <input type="range" min="1" max="10" value={moodInput} onChange={e=>setMoodInput(parseInt(e.target.value))} style={{width:"100%",marginBottom:"8px",accentColor:ACCENT.mood}}/>
                <div style={{display:"flex",justifyContent:"space-between",...mutedText,marginBottom:"8px"}}><span>💀 Dead</span><span>😐 Meh</span><span>⚡ Fired</span></div>
                <button onClick={()=>updateLog({mood:moodInput},5,`😤 Mood ${moodInput}/10`)} style={bStyle(ACCENT.mood)}>LOG MOOD</button>
              </div>
              <div style={cStyle}>
                <div style={labelStyle}>HEART RATE 🫀</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <input value={hrInput} onChange={e=>setHrInput(e.target.value)} placeholder="BPM" type="number" style={{...iStyle,flex:1}}/>
                  <button onClick={()=>{if(!hrInput)return;updateLog({hr:parseInt(hrInput)},0,`🫀 ${hrInput}bpm`);setHrInput("");}}
                    style={{background:ACCENT.protein,border:"none",borderRadius:"7px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",padding:"0 16px",fontFamily:"monospace"}}>LOG</button>
                </div>
              </div>
            </div>
          )}

          {subTab==="cardio"&&(
            <div style={cStyle}>
              <div style={labelStyle}>CARDIO SESSION 🏃</div>
              <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
                {["Walk","Run","Cycle","HIIT","Jump Rope","Swim"].map(t=>(
                  <button key={t} onClick={()=>setCardioInput(p=>({...p,type:t}))} style={{padding:"6px 10px",borderRadius:"6px",border:`2px solid ${cardioInput.type===t?ACCENT.cardio:T.border}`,cursor:"pointer",background:cardioInput.type===t?ACCENT.cardio+"22":T.sub,color:cardioInput.type===t?ACCENT.cardio:T.muted,fontSize:"10px",fontFamily:"monospace",fontWeight:"bold"}}>{t}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
                <input value={cardioInput.duration} onChange={e=>setCardioInput(p=>({...p,duration:e.target.value}))} placeholder="Mins" type="number" style={iStyle}/>
                <input value={cardioInput.calories} onChange={e=>setCardioInput(p=>({...p,calories:e.target.value}))} placeholder="Cal burned" type="number" style={iStyle}/>
              </div>
              <button onClick={()=>{if(!cardioInput.duration)return;const prev=data.logs[today]||{};updateLog({cardioSessions:[...(prev.cardioSessions||[]),{...cardioInput}]},20,`🏃 ${cardioInput.type} +${Math.round(20*xpMult)}XP`);setCardioInput({type:"Walk",duration:"",calories:""});}} style={bStyle(ACCENT.cardio)}>LOG CARDIO</button>
            </div>
          )}

          {subTab==="supps"&&(
            <div style={cStyle}>
              <div style={labelStyle}>SUPPLEMENTS 💊</div>
              {[{id:"diesel",name:"Diesel Protein",icon:"💪",timing:"Post workout"},{id:"magnesium",name:"Magnesium",icon:"😴",timing:"Before bed"},{id:"omega3",name:"Omega-3",icon:"🧠",timing:"With meal"},{id:"vitd",name:"Vitamin D",icon:"☀️",timing:"Morning"},{id:"zinc",name:"Zinc",icon:"⚡",timing:"With meal"}].map(s=>{
                const logged=todayLog.supplements?.includes(s.id);
                return(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:"8px",marginBottom:"6px",background:logged?ACCENT.supp+"11":T.sub,border:`2px solid ${logged?ACCENT.supp+"66":T.border}`}}>
                    <div>
                      <div style={{fontSize:"12px",fontWeight:"bold",color:logged?ACCENT.supp:T.text}}>{s.icon} {s.name}</div>
                      <div style={mutedText}>{s.timing}</div>
                    </div>
                    <button onClick={()=>{if(logged)return;const prev=data.logs[today]||{};updateLog({supplements:[...(prev.supplements||[]),s.id]},5);}} style={{background:logged?ACCENT.supp+"22":"none",border:`2px solid ${logged?ACCENT.supp+"66":T.border}`,borderRadius:"6px",color:logged?ACCENT.supp:T.muted,fontSize:"10px",cursor:logged?"default":"pointer",padding:"5px 12px",fontFamily:"monospace",fontWeight:"bold"}}>
                      {logged?"✓ TAKEN":"TAKE"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {subTab==="routine"&&(
            <div style={cStyle}>
              <div style={labelStyle}>MORNING ROUTINE 🌅</div>
              <div style={{...mutedText,marginBottom:"12px"}}>Complete 3+ items · Every 5 routines = ❄️ Freeze</div>
              {[{id:"jeera",label:"Jeera Water",icon:"💧"},{id:"sunlight",label:"10min Sunlight",icon:"☀️"},{id:"weigh",label:"Weigh In",icon:"⚖️"},{id:"stretch",label:"5min Stretch",icon:"🧘"},{id:"supps",label:"Supplements",icon:"💊"},{id:"journal",label:"Journal",icon:"📓"}].map(item=>{
                const checked=routineChecks[item.id]||false;const done=todayLog.routine?.includes(item.id);
                return(
                  <div key={item.id} onClick={()=>{if(!done)setRoutineChecks(p=>({...p,[item.id]:!checked}));}}
                    style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px",borderRadius:"8px",marginBottom:"6px",cursor:"pointer",background:(checked||done)?ACCENT.steps+"11":T.sub,border:`2px solid ${(checked||done)?ACCENT.steps+"88":T.border}`}}>
                    <div style={{width:"20px",height:"20px",borderRadius:"5px",background:(checked||done)?ACCENT.steps:"transparent",border:`2px solid ${(checked||done)?ACCENT.steps:T.muted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",flexShrink:0,fontWeight:"bold"}}>
                      {(checked||done)?"✓":""}
                    </div>
                    <span style={{fontSize:"13px",fontWeight:isLight?"600":"400"}}>{item.icon} {item.label}</span>
                  </div>
                );
              })}
              <button onClick={()=>{
                const checked=Object.keys(routineChecks).filter(k=>routineChecks[k]);
                if(checked.length<3){showNotif("Complete 3+ items","error");return;}
                const xpGain=checked.length*10;
                setData(prev=>({...prev,xp:prev.xp+xpGain,routineCount:(prev.routineCount||0)+1}));
                updateLog({routine:checked},0,`🌅 +${xpGain}XP`);
                setRoutineChecks({});
                if(((data.routineCount||0)+1)%5===0){
                  setData(prev=>({...prev,streakFreezes:(prev.streakFreezes||0)+1}));
                  showNotif("❄️ STREAK FREEZE EARNED!");
                }
              }} style={bStyle(ACCENT.steps)}>COMPLETE ROUTINE (+{Object.values(routineChecks).filter(Boolean).length*10}XP)</button>
            </div>
          )}

          {subTab==="notes"&&(
            <div>
              <div style={cStyle}>
                <div style={labelStyle}>DAILY NOTE 📝</div>
                <textarea value={notesInput} onChange={e=>setNotesInput(e.target.value)} placeholder="How's the day going..." style={{...iStyle,height:"120px",resize:"none",lineHeight:"1.6"}}/>
                <button onClick={()=>{if(!notesInput)return;updateLog({notes:notesInput},5,"📝 Saved");setNotesInput("");}} style={bStyle(ACCENT.steps)}>SAVE NOTE</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ GYM — FULLY REBUILT ══ */}
      {tab==="gym"&&(
        <div>
          {/* Rest timer always visible */}
          {restTimer!==null&&(
            <div style={{...cStyle,textAlign:"center",border:`2px solid ${ACCENT.gym}`,marginBottom:"12px",background:isLight?"#fffbea":ACCENT.gym+"08"}}>
              <div style={{fontSize:"9px",color:ACCENT.gym,letterSpacing:"3px",marginBottom:"4px",fontWeight:"bold"}}>⏱️ REST TIMER</div>
              <div style={{fontSize:"48px",fontWeight:"bold",color:ACCENT.gym,fontVariantNumeric:"tabular-nums",lineHeight:1}}>{Math.floor(restTimer/60)}:{String(restTimer%60).padStart(2,"0")}</div>
              <div style={{background:T.sub,borderRadius:"3px",height:"5px",overflow:"hidden",margin:"8px 0",border:`1px solid ${T.border}`}}>
                <div style={{height:"100%",transition:"width 1s linear",background:ACCENT.gym,
                  width:`${100-((restTimer/120)*100)}%`}}/>
              </div>
              <button onClick={()=>setRestTimer(null)} style={{background:"none",border:`2px solid ${ACCENT.gym}66`,borderRadius:"6px",color:ACCENT.gym,fontSize:"10px",cursor:"pointer",padding:"4px 16px",fontFamily:"monospace",fontWeight:"bold"}}>SKIP REST</button>
            </div>
          )}

          {/* GYM / HOME MODE TOGGLE */}
          {gymView!=="session"&&gymView!=="post"&&(
            <div>
              <div style={{display:"flex",gap:"4px",marginBottom:"8px",background:T.card,borderRadius:"8px",padding:"3px",border:`2px solid ${T.border}`}}>
                {[["gym","🏋️  GYM"],["home_gym","🏠  HOME"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setGymMode(v)} style={{flex:1,padding:"9px",borderRadius:"6px",border:"none",background:gymMode===v?(v==="gym"?ACCENT.gym:ACCENT.home):"transparent",color:gymMode===v?"#000":T.muted,fontSize:"11px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
                    {l}
                  </button>
                ))}
              </div>
              {gymMode==="gym"&&(
                <div style={{display:"flex",gap:"4px",marginBottom:"12px",background:T.card,borderRadius:"8px",padding:"3px",border:`2px solid ${T.border}`}}>
                  {[["home","PLANS"],["history","HISTORY"],["muscle","MUSCLES"],["pr","PRs"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setGymView(v)} style={{flex:1,padding:"7px 4px",borderRadius:"6px",border:"none",background:gymView===v?ACCENT.gym:"transparent",color:gymView===v?"#000":T.muted,fontSize:"9px",fontWeight:"bold",cursor:"pointer",letterSpacing:"1px",fontFamily:"monospace"}}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HOME GYM SECTION */}
          {gymMode==="home_gym"&&gymView!=="session"&&gymView!=="post"&&(
            <div>
              <div style={{...cStyle,border:`2px solid ${ACCENT.home}44`}}>
                <div style={labelStyle}>HOME WORKOUT</div>
                <div style={mutedText}>Tap an amount to select · tap again to deselect</div>
              </div>
              {HOME_EXERCISES.map(ex=>{
                const selReps=homeExSel[ex.name]||0;
                const estCal=selReps>0?Math.round(ex.calPerRep*selReps):0;
                return(
                  <div key={ex.name} style={{...cStyle,border:`2px solid ${selReps>0?ACCENT.home+"88":T.border}`,marginBottom:"8px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                      <div>
                        <div style={{fontSize:"13px",fontWeight:"bold",color:selReps>0?ACCENT.home:T.text}}>{ex.icon} {ex.name}</div>
                        <div style={mutedText}>{ex.muscle}</div>
                      </div>
                      {selReps>0&&(
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"13px",fontWeight:"bold",color:ACCENT.home}}>{selReps} {ex.unit||"reps"}</div>
                          <div style={{...mutedText,color:ACCENT.cal}}>~{estCal} cal</div>
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                      {ex.options.map(opt=>(
                        <button key={opt} onClick={()=>setHomeExSel(p=>({...p,[ex.name]:p[ex.name]===opt?0:opt}))} style={{
                          padding:"8px 14px",borderRadius:"8px",
                          border:`2px solid ${homeExSel[ex.name]===opt?ACCENT.home:T.border}`,
                          background:homeExSel[ex.name]===opt?ACCENT.home+"33":T.sub,
                          color:homeExSel[ex.name]===opt?ACCENT.home:T.muted,
                          fontSize:"12px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.values(homeExSel).some(v=>v>0)&&(
                <div style={{...cStyle,border:`2px solid ${ACCENT.home}`,background:isLight?"#f8f0ff":ACCENT.home+"08"}}>
                  <div style={labelStyle}>SESSION SUMMARY</div>
                  {Object.entries(homeExSel).filter(([,r])=>r>0).map(([name,reps])=>{
                    const ex=HOME_EXERCISES.find(e=>e.name===name);
                    return(
                      <div key={name} style={{display:"flex",justifyContent:"space-between",...mutedText,marginBottom:"4px"}}>
                        <span>{name}</span>
                        <span style={{color:ACCENT.home,fontWeight:"bold"}}>{reps} × ~{Math.round((ex?.calPerRep||0.3)*reps)} cal</span>
                      </div>
                    );
                  })}
                  <div style={{borderTop:`1px solid ${T.border}`,marginTop:"8px",paddingTop:"8px",display:"flex",justifyContent:"space-between",fontWeight:"bold"}}>
                    <span>Total burn</span>
                    <span style={{color:ACCENT.cal}}>~{Object.entries(homeExSel).filter(([,r])=>r>0).reduce((a,[name,reps])=>{const ex=HOME_EXERCISES.find(e=>e.name===name);return a+Math.round((ex?.calPerRep||0.3)*reps);},0)} cal</span>
                  </div>
                  <button onClick={()=>{
                    const selected=Object.entries(homeExSel).filter(([,r])=>r>0);
                    if(selected.length===0) return;
                    let totalCal=0;
                    const exercises=selected.map(([name,reps])=>{const ex=HOME_EXERCISES.find(e=>e.name===name);const cal=Math.round((ex?.calPerRep||0.3)*reps);totalCal+=cal;return{name,reps,caloriesBurned:cal};});
                    const prevLog=data.logs[today]||{};
                    updateLog({homeGym:true,homeGymExercises:exercises,homeGymCalories:totalCal},40,"+"+Math.round(40*xpMult)+"XP! Home workout done — "+totalCal+" cal burned");
                    setHomeExSel({});
                  }} style={{width:"100%",marginTop:"10px",padding:"13px",background:"linear-gradient(135deg,"+ACCENT.home+","+ACCENT.home+"cc)",border:"none",borderRadius:"8px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",letterSpacing:"2px",fontFamily:"monospace",display:"block"}}>
                    LOG HOME SESSION (+{Math.round(40*xpMult)}XP)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GYM PLANS */}
          {gymMode==="gym"&&gymView==="home"&&(
            <div>
              <div style={{...cStyle,border:`2px solid ${ACCENT.gym}44`}}>
                <div style={labelStyle}>RECOMMENDED SPLIT</div>
                <div style={{fontSize:"11px",color:T.muted,lineHeight:"1.8",fontWeight:isLight?"600":"400"}}>
                  Mon: Push 💪 · Wed: Pull 🔥 · Fri: Legs 🦵 · Any day: Full Body 💥
                </div>
              </div>

              {Object.entries(WORKOUT_PLANS).map(([key,plan])=>{
                const lastDone=Object.entries(data.logs||{}).filter(([,l])=>l.gymPlan===key).sort((a,b)=>b[0].localeCompare(a[0]))[0];
                const daysSinceDone=lastDone?daysSince(lastDone[0]):null;
                const freshness=daysSinceDone===null?"Never done":daysSinceDone===0?"Today":daysSinceDone===1?"Yesterday":`${daysSinceDone} days ago`;
                const isReady=daysSinceDone===null||daysSinceDone>=2;
                return(
                  <div key={key} style={{...cStyle,border:`2px solid ${isReady?plan.color+"66":T.border}`,cursor:"pointer"}} onClick={()=>startSession(key)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                      <div>
                        <div style={{fontSize:"16px",fontWeight:"bold",color:plan.color}}>{plan.emoji} {plan.name}</div>
                        <div style={{display:"flex",gap:"5px",marginTop:"5px",flexWrap:"wrap"}}>
                          {plan.muscles.map(m=>(
                            <span key={m} style={{fontSize:"9px",padding:"2px 7px",borderRadius:"10px",background:plan.color+"22",color:plan.color,fontWeight:"bold",border:`1px solid ${plan.color}44`}}>{m}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"10px",color:isReady?ACCENT.steps:ACCENT.protein,fontWeight:"bold"}}>{isReady?"✓ READY":"⚠ RECENT"}</div>
                        <div style={mutedText}>{freshness}</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
                      <div style={{background:T.sub,borderRadius:"6px",padding:"8px",textAlign:"center",border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:"14px",fontWeight:"bold",color:plan.color}}>{plan.exercises.length}</div>
                        <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>EXERCISES</div>
                      </div>
                      <div style={{background:T.sub,borderRadius:"6px",padding:"8px",textAlign:"center",border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:"14px",fontWeight:"bold",color:T.text}}>{plan.exercises.reduce((a,e)=>a+parseInt(e.sets),0)}</div>
                        <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>TOTAL SETS</div>
                      </div>
                      <div style={{background:T.sub,borderRadius:"6px",padding:"8px",textAlign:"center",border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:"14px",fontWeight:"bold",color:T.text}}>~{Math.round(plan.exercises.reduce((a,e)=>a+e.rest*parseInt(e.sets),0)/60)+15}m</div>
                        <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>DURATION</div>
                      </div>
                    </div>
                    <div style={{marginTop:"10px",fontSize:"10px",color:T.muted,fontWeight:isLight?"600":"400"}}>
                      {plan.exercises.slice(0,3).map(e=>e.name).join(" · ")} + more
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVE SESSION */}
          {gymView==="session"&&activeSession&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                <button onClick={()=>{if(window.confirm("Abandon this session? Progress will be lost.")){setActiveSession(null);setSessionNote("");setSetLogInput({});setGymView("home");}}} style={{background:"none",border:`2px solid ${T.border}`,borderRadius:"7px",color:T.muted,fontSize:"11px",cursor:"pointer",padding:"8px 12px",fontFamily:"monospace",fontWeight:"bold"}}>← BACK</button>
                <button onClick={finishSession} style={{background:"linear-gradient(135deg,#00d4aa,#00ff88)",border:"none",borderRadius:"8px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",padding:"10px 16px",fontFamily:"monospace",letterSpacing:"1px"}}>FINISH ✓</button>
              </div>
              <div style={{marginBottom:"12px"}}>
                <div style={{fontSize:"16px",fontWeight:"bold",color:WORKOUT_PLANS[activeSession.planKey].color}}>
                  {WORKOUT_PLANS[activeSession.planKey].emoji} {activeSession.planName}
                </div>
                <div style={mutedText}>{Math.round((Date.now()-activeSession.startTime)/60000)} min in · {activeSession.exercises.filter(e=>e.sets.length>0).length}/{activeSession.exercises.length} done</div>
              </div>

              {/* Session progress bar */}
              <div style={{background:T.sub,borderRadius:"4px",height:"6px",overflow:"hidden",marginBottom:"14px",border:`1px solid ${T.border}`}}>
                <div style={{height:"100%",width:`${(activeSession.exercises.filter(e=>e.sets.length>0).length/activeSession.exercises.length)*100}%`,background:"linear-gradient(90deg,#00d4aa,#00ff88)",transition:"width 0.4s"}}/>
              </div>

              {activeSession.exercises.map((ex,i)=>{
                const planColor=WORKOUT_PLANS[activeSession.planKey].color;
                const hasSets=ex.sets.length>0;
                const bestSet=hasSets?Math.max(...ex.sets.map(s=>s.weight||0)):0;
                const inp=setLogInput[ex.name]||{reps:"",weight:""};
                return(
                  <div key={i} style={{...cStyle,border:`2px solid ${hasSets?planColor+"88":T.border}`,opacity:hasSets?1:0.8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                      <div>
                        <div style={{fontSize:"13px",fontWeight:"bold",color:hasSets?planColor:T.text}}>{i+1}. {ex.name}</div>
                        <div style={{display:"flex",gap:"8px",marginTop:"3px"}}>
                          <span style={{fontSize:"10px",color:planColor,background:planColor+"22",padding:"2px 7px",borderRadius:"4px",fontWeight:"bold"}}>{ex.sets}×{ex.reps}</span>
                          <span style={mutedText}>{ex.muscle}</span>
                          {ex.warmup&&<span style={{fontSize:"9px",color:ACCENT.gym,background:ACCENT.gym+"22",padding:"2px 7px",borderRadius:"4px",fontWeight:"bold"}}>WARMUP</span>}
                        </div>
                      </div>
                      <button onClick={()=>setRestTimer(ex.rest)} style={{background:ACCENT.gym+"22",border:`2px solid ${ACCENT.gym}44`,borderRadius:"6px",color:ACCENT.gym,fontSize:"9px",cursor:"pointer",padding:"5px 8px",fontFamily:"monospace",fontWeight:"bold"}}>⏱️ {ex.rest}s</button>
                    </div>

                    {/* Previous performance */}
                    {ex.lastSessionWeight&&(
                      <div style={{...mutedText,marginBottom:"8px",padding:"6px 10px",background:T.sub,borderRadius:"6px",border:`1px solid ${T.border}`}}>
                        Last session: <span style={{color:ACCENT.gym,fontWeight:"bold"}}>{ex.lastSessionWeight} lbs</span>
                        {data.exercisePRs?.[ex.name]&&<span> · PR: <span style={{color:ACCENT.protein,fontWeight:"bold"}}>{data.exercisePRs[ex.name]} lbs</span></span>}
                      </div>
                    )}

                    {/* Warmup recommendation */}
                    {ex.warmup&&data.exercisePRs?.[ex.name]&&(
                      <div style={{...mutedText,marginBottom:"8px",color:ACCENT.gym,fontWeight:"bold",padding:"5px 10px",background:ACCENT.gym+"11",borderRadius:"6px",border:`1px solid ${ACCENT.gym}33`}}>
                        💡 Warmup: {Math.round(data.exercisePRs[ex.name]*0.5)} lbs × 10, {Math.round(data.exercisePRs[ex.name]*0.7)} lbs × 5
                      </div>
                    )}

                    {/* Set log */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"6px",marginBottom:"8px",alignItems:"end"}}>
                      <input value={inp.weight} onChange={e=>setSetLogInput(p=>({...p,[ex.name]:{...inp,weight:e.target.value}}))}
                        placeholder="Weight (lbs)" type="number" style={{...iStyle,fontSize:"11px",padding:"8px 10px"}}/>
                      <input value={inp.reps} onChange={e=>setSetLogInput(p=>({...p,[ex.name]:{...inp,reps:e.target.value}}))}
                        placeholder="Reps" type="number" style={{...iStyle,fontSize:"11px",padding:"8px 10px"}}/>
                      <button onClick={()=>logSet(ex.name)} style={{background:planColor,border:"none",borderRadius:"7px",color:"#000",fontSize:"11px",fontWeight:"bold",cursor:"pointer",padding:"10px 14px",fontFamily:"monospace",whiteSpace:"nowrap"}}>+ SET</button>
                    </div>

                    {/* Logged sets */}
                    {ex.sets.length>0&&(
                      <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                        {ex.sets.map((set,si)=>(
                          <div key={si} style={{background:planColor+"22",border:`1px solid ${planColor}44`,borderRadius:"5px",padding:"4px 8px",fontSize:"10px",color:planColor,fontWeight:"bold"}}>
                            {set.weight?`${set.weight}lb`:"BW"} × {set.reps}
                          </div>
                        ))}
                        <div style={{background:T.sub,border:`1px solid ${T.border}`,borderRadius:"5px",padding:"4px 8px",fontSize:"10px",color:T.muted,fontWeight:"bold"}}>
                          {ex.sets.reduce((a,s)=>a+(s.weight||0)*(parseInt(s.reps)||0),0).toLocaleString()} vol
                        </div>
                      </div>
                    )}

                    <div style={{fontSize:"9px",color:T.muted,marginTop:"6px",fontStyle:"italic",fontWeight:isLight?"600":"400"}}>💡 {ex.tip}</div>
                  </div>
                );
              })}

              <div style={cStyle}>
                <div style={labelStyle}>SESSION NOTES</div>
                <textarea value={sessionNote} onChange={e=>setSessionNote(e.target.value)}
                  placeholder="How did it feel? Any form cues to remember..." style={{...iStyle,height:"80px",resize:"none"}}/>
              </div>
              <button onClick={finishSession} style={bStyle(ACCENT.steps)}>✓ FINISH SESSION</button>
            </div>
          )}

          {/* POST SESSION SUMMARY */}
          {gymView==="post"&&postSession&&(
            <div>
              <div style={{...cStyle,textAlign:"center",border:`2px solid ${ACCENT.steps}`,background:isLight?"#f0fff8":ACCENT.steps+"08"}}>
                <div style={{fontSize:"32px",marginBottom:"8px"}}>🏋️</div>
                <div style={{fontSize:"18px",fontWeight:"bold",color:ACCENT.steps,marginBottom:"4px"}}>SESSION COMPLETE!</div>
                <div style={mutedText}>{postSession.planName}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"10px"}}>
                {[
                  {l:"DURATION",v:`${postSession.duration}m`,c:ACCENT.cal},
                  {l:"VOLUME",v:`${Math.round(postSession.totalVolume/1000)}k`,c:ACCENT.gym},
                  {l:"NEW PRs",v:postSession.newPRs.length,c:ACCENT.protein},
                ].map(s=>(
                  <div key={s.l} style={{...cStyle,marginBottom:0,textAlign:"center",padding:"12px"}}>
                    <div style={{fontSize:"20px",fontWeight:"bold",color:s.c}}>{s.v}</div>
                    <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {postSession.newPRs.length>0&&(
                <div style={{...cStyle,border:`2px solid ${ACCENT.protein}`,background:isLight?"#fff0f6":ACCENT.protein+"08"}}>
                  <div style={labelStyle}>NEW PERSONAL RECORDS 🏆</div>
                  {postSession.newPRs.map((pr,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:"12px",fontWeight:"bold"}}>{pr.name}</span>
                      <span style={{color:ACCENT.protein,fontWeight:"bold"}}>{pr.weight} lbs 🏆</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{...cStyle}}>
                <div style={labelStyle}>EXERCISES COMPLETED</div>
                {postSession.exercises.filter(e=>e.sets.length>0).map((ex,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:"11px",fontWeight:isLight?"600":"400"}}>{ex.name}</span>
                    <div style={{display:"flex",gap:"8px",fontSize:"10px"}}>
                      <span style={{color:T.muted}}>{ex.sets.length} sets</span>
                      <span style={{color:ACCENT.gym,fontWeight:"bold"}}>{Math.max(...ex.sets.map(s=>s.weight||0))} lbs max</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setGymView("home")} style={bStyle(ACCENT.steps)}>BACK TO GYM</button>
            </div>
          )}

          {/* HISTORY */}
          {gymMode==="gym"&&gymView==="history"&&(
            <div>
              <div style={labelStyle}>RECENT SESSIONS</div>
              {(data.sessionHistory||[]).length===0&&(
                <div style={{...cStyle,textAlign:"center",padding:"30px"}}>
                  <div style={{fontSize:"32px",marginBottom:"8px"}}>🏋️</div>
                  <div style={mutedText}>No sessions logged yet</div>
                  <div style={{...mutedText,marginTop:"4px"}}>Start your first session from HOME</div>
                </div>
              )}
              {[...(data.sessionHistory||[])].reverse().map((session,i)=>(
                <div key={i} style={{...cStyle,border:`2px solid ${WORKOUT_PLANS[session.planKey]?.color||T.border}44`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:"bold",color:WORKOUT_PLANS[session.planKey]?.color||T.text}}>
                        {WORKOUT_PLANS[session.planKey]?.emoji} {session.planName}
                      </div>
                      <div style={mutedText}>{new Date(session.date).toLocaleDateString("en-CA",{weekday:"short",month:"short",day:"numeric"})}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"12px",fontWeight:"bold",color:ACCENT.gym}}>{session.duration}min</div>
                      <div style={{...mutedText,color:ACCENT.protein}}>{session.newPRs.length>0?`${session.newPRs.length} PR!`:""}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                    <div style={{background:T.sub,borderRadius:"6px",padding:"8px",border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:"13px",fontWeight:"bold",color:ACCENT.cal}}>{Math.round(session.totalVolume/1000*10)/10}k</div>
                      <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>VOLUME (lbs)</div>
                    </div>
                    <div style={{background:T.sub,borderRadius:"6px",padding:"8px",border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:"13px",fontWeight:"bold",color:ACCENT.steps}}>{session.exercises.filter(e=>e.sets.length>0).length}</div>
                      <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>EXERCISES</div>
                    </div>
                  </div>
                  {session.note&&<div style={{...mutedText,marginTop:"8px",fontStyle:"italic"}}>"{session.note}"</div>}
                </div>
              ))}
            </div>
          )}

          {/* MUSCLE GROUPS */}
          {gymMode==="gym"&&gymView==="muscle"&&(
            <div>
              <div style={labelStyle}>MUSCLE GROUP TRACKER</div>
              <div style={{...mutedText,marginBottom:"12px"}}>Aim to train each group every 48-72 hours</div>
              {Object.entries({
                "Chest":["push","full"],"Back":["pull","full"],"Shoulders":["push","full"],
                "Biceps":["pull"],"Triceps":["push"],"Quads":["legs","full"],
                "Hamstrings":["legs","full"],"Calves":["legs"],"Core":["full"],"Rear Delts":["pull"],
              }).map(([muscle,plans])=>{
                const lastDate=lastMuscleTrain[muscle];
                const days=daysSince(lastDate);
                const status=days<=1?"FRESH":days<=2?"READY":days<=4?"OPTIMAL":"NEEDED";
                const statusColor=days<=1?ACCENT.protein:days<=2?ACCENT.gym:days<=4?ACCENT.steps:"#888";
                return(
                  <div key={muscle} style={{...cStyle,marginBottom:"6px",padding:"12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:"13px",fontWeight:"bold",color:T.text}}>{muscle}</div>
                        <div style={{display:"flex",gap:"4px",marginTop:"3px"}}>
                          {plans.map(p=>(
                            <span key={p} style={{fontSize:"8px",padding:"2px 6px",borderRadius:"4px",background:WORKOUT_PLANS[p]?.color+"22",color:WORKOUT_PLANS[p]?.color,fontWeight:"bold"}}>{WORKOUT_PLANS[p]?.emoji}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"11px",fontWeight:"bold",color:statusColor}}>{status}</div>
                        <div style={mutedText}>{lastDate?`${days===0?"Today":days===1?"Yesterday":days+" days ago"}`:"Never"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PRs */}
          {gymMode==="gym"&&gymView==="pr"&&(
            <div>
              <div style={labelStyle}>PERSONAL RECORDS 🏆</div>
              {Object.keys(data.exercisePRs||{}).length===0?(
                <div style={{...cStyle,textAlign:"center",padding:"30px"}}>
                  <div style={{fontSize:"32px",marginBottom:"8px"}}>🏅</div>
                  <div style={mutedText}>No PRs yet — log weights during sessions!</div>
                </div>
              ):(
                Object.entries(data.exercisePRs||{}).map(([ex,w])=>(
                  <div key={ex} style={{...cStyle,marginBottom:"6px",padding:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:"bold",color:T.text}}>{ex}</div>
                      <div style={mutedText}>Personal Best</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"20px",fontWeight:"bold",color:ACCENT.gym}}>{w} <span style={{fontSize:"12px"}}>lbs</span></div>
                      <div style={mutedText}>{Math.round(w*0.453592*10)/10} kg</div>
                    </div>
                  </div>
                ))
              )}
              {/* Total volume */}
              <div style={{...cStyle,border:`2px solid ${ACCENT.steps}44`}}>
                <div style={labelStyle}>TOTAL VOLUME LIFTED</div>
                <div style={{fontSize:"28px",fontWeight:"bold",color:ACCENT.steps}}>{((data.totalVolume||0)/1000).toFixed(1)}k <span style={{fontSize:"14px"}}>lbs</span></div>
                <div style={mutedText}>{Math.round((data.totalVolume||0)*0.453592/1000*10)/10}k kg total</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ QUESTS ══ */}
      {tab==="quests"&&(
        <div>
          {/* Sub tabs */}
          <div style={{display:"flex",gap:"3px",marginBottom:"12px",background:T.card,borderRadius:"8px",padding:"3px",border:`2px solid ${T.border}`}}>
            {[["missions","⚡ MISSIONS"],["challenges","🎯 CHALLENGES"],["bosses","⚔️ BOSSES"],["classes","🎭 CLASSES"]].map(([v,l])=>(
              <button key={v} onClick={()=>setQuestsTab(v)} style={{flex:1,padding:"7px 2px",borderRadius:"6px",border:"none",background:questsTab===v?ACCENT.steps:"transparent",color:questsTab===v?"#000":T.muted,fontSize:"9px",fontWeight:"bold",cursor:"pointer",letterSpacing:"1px",fontFamily:"monospace",whiteSpace:"nowrap"}}>
                {l}
              </button>
            ))}
          </div>

          {/* MISSIONS */}
          {questsTab==="missions"&&<div style={cStyle}>
            <div style={labelStyle}>⚡ DAILY MISSIONS — PICK 3</div>
            <div style={{...mutedText,marginBottom:"12px"}}>Complete all 3 selected = +50 BONUS XP · {selectedMissions.length}/3 selected</div>
            {dailyMissions.map(mission=>{
              const isSelected=selectedMissions.includes(mission.id);
              const isDone=data.logs[today]?.[`md_${mission.id}`];
              const isCompleted=mission.check(todayLog);
              const diffColor=mission.difficulty==="HARD"?ACCENT.cal:mission.difficulty==="MEDIUM"?ACCENT.gym:ACCENT.steps;
              return(
                <div key={mission.id} style={{borderRadius:"8px",padding:"12px",marginBottom:"8px",cursor:"pointer",
                  background:isDone?ACCENT.steps+"11":isSelected?ACCENT.steps+"08":T.sub,
                  border:`2px solid ${isDone?ACCENT.steps:isSelected?ACCENT.steps+"88":T.border}`,
                  opacity:(!isSelected&&selectedMissions.length>=3&&!isDone)?0.45:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div onClick={()=>selectMission(mission.id)} style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                        <span style={{fontSize:"18px"}}>{mission.icon}</span>
                        <span style={{fontSize:"12px",fontWeight:"bold",color:isDone?ACCENT.steps:T.text}}>{mission.label}</span>
                        <span style={{fontSize:"8px",padding:"2px 6px",borderRadius:"4px",background:diffColor+"22",color:diffColor,fontWeight:"bold"}}>{mission.difficulty}</span>
                      </div>
                      <div style={{...mutedText,marginLeft:"26px"}}>{mission.desc}</div>
                    </div>
                    <div style={{textAlign:"right",marginLeft:"8px"}}>
                      <div style={{fontSize:"12px",color:ACCENT.gym,fontWeight:"bold"}}>+{Math.round(mission.xp*xpMult)}XP</div>
                      {isSelected&&!isDone&&(
                        <button onClick={()=>claimMission(mission)} style={{background:isCompleted?ACCENT.steps:T.sub,border:`2px solid ${isCompleted?ACCENT.steps:T.border}`,borderRadius:"5px",color:isCompleted?"#000":T.muted,fontSize:"9px",cursor:"pointer",padding:"4px 10px",marginTop:"4px",fontFamily:"monospace",fontWeight:"bold"}}>
                          {isCompleted?"CLAIM ✓":"PENDING"}
                        </button>
                      )}
                      {isDone&&<div style={{fontSize:"10px",color:ACCENT.steps,marginTop:"4px",fontWeight:"bold"}}>✓ DONE</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}

          {/* WEEKLY CHALLENGES */}
          {questsTab==="challenges"&&(
            <div>
              <div style={{...mutedText,marginBottom:"12px"}}>Weekly challenges reset every Monday. Complete for bonus XP.</div>
              {(()=>{
                const wDays=getWeekDays();
                const wLogs=wDays.map(d=>data.logs[d.date]||{}).filter(l=>Object.keys(l).length>0);
                const weekKey=getMonday(today);
                return WEEKLY_CHALLENGES.map(ch=>{
                  const claimed=data.completedChallenges?.[weekKey]?.[ch.id];
                  const passed=ch.check(wLogs);
                  return(
                    <div key={ch.id} style={{...cStyle,border:`2px solid ${claimed?ACCENT.steps:passed?ACCENT.gym+"66":T.border}`,background:claimed?ACCENT.steps+"08":T.card}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                            <span style={{fontSize:"20px"}}>{ch.icon}</span>
                            <div>
                              <div style={{fontSize:"13px",fontWeight:"bold",color:claimed?ACCENT.steps:passed?ACCENT.gym:T.text}}>{ch.label}</div>
                              <div style={mutedText}>{ch.desc}</div>
                            </div>
                          </div>
                        </div>
                        <div style={{textAlign:"right",marginLeft:"8px"}}>
                          <div style={{fontSize:"13px",fontWeight:"bold",color:ACCENT.gym}}>+{ch.xp}XP</div>
                          {claimed
                            ?<div style={{fontSize:"10px",color:ACCENT.steps,marginTop:"4px",fontWeight:"bold"}}>✓ CLAIMED</div>
                            :passed
                              ?<button onClick={()=>{
                                setData(prev=>({...prev,xp:prev.xp+ch.xp,
                                  completedChallenges:{...prev.completedChallenges,
                                    [weekKey]:{...(prev.completedChallenges?.[weekKey]||{}),[ch.id]:true}}}));
                                showNotif("🎯 Challenge complete! +"+ch.xp+"XP");
                              }} style={{background:ACCENT.gym+"22",border:`2px solid ${ACCENT.gym}44`,borderRadius:"5px",color:ACCENT.gym,fontSize:"9px",cursor:"pointer",padding:"4px 10px",marginTop:"4px",fontFamily:"monospace",fontWeight:"bold"}}>CLAIM</button>
                              :<div style={{fontSize:"10px",color:T.muted,marginTop:"4px"}}>In progress...</div>
                          }
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* REAL LIFE CHALLENGES */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"16px 0 8px"}}>
                <div style={labelStyle}>🔥 REAL LIFE CHALLENGES</div>
                <button onClick={()=>setShowNewChallenge(!showNewChallenge)} style={{background:"none",border:`2px solid ${T.border}`,borderRadius:"6px",color:ACCENT.steps,fontSize:"10px",cursor:"pointer",padding:"4px 10px",fontFamily:"monospace",fontWeight:"bold"}}>
                  {showNewChallenge?"CANCEL":"+ NEW"}
                </button>
              </div>
              <div style={{...mutedText,marginBottom:"10px"}}>Set your own challenge, check in daily, earn your reward.</div>

              {showNewChallenge&&(
                <div style={{...cStyle,border:`2px solid ${ACCENT.cal}44`}}>
                  <div style={labelStyle}>CREATE CHALLENGE</div>
                  <input value={newChallenge.title} onChange={e=>setNewChallenge(p=>({...p,title:e.target.value}))} placeholder="e.g. No junk food for 30 days" style={{...iStyle,marginBottom:"8px"}}/>
                  <input value={newChallenge.reward} onChange={e=>setNewChallenge(p=>({...p,reward:e.target.value}))} placeholder="Reward when done (e.g. New Jordans)" style={{...iStyle,marginBottom:"8px"}}/>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"8px",flexWrap:"wrap"}}>
                    <span style={mutedText}>Duration:</span>
                    {[7,14,21,30,60].map(d=>(
                      <button key={d} onClick={()=>setNewChallenge(p=>({...p,days:d}))} style={{padding:"6px 12px",borderRadius:"6px",border:`2px solid ${newChallenge.days===d?ACCENT.cal:T.border}`,background:newChallenge.days===d?ACCENT.cal+"22":T.sub,color:newChallenge.days===d?ACCENT.cal:T.muted,fontSize:"11px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
                        {d}d
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>{
                    if(!newChallenge.title) return;
                    const challenge={id:`rlc_${Date.now()}`,title:newChallenge.title,reward:newChallenge.reward,days:newChallenge.days,startDate:today,checkIns:[],completed:false};
                    setData(prev=>({...prev,realLifeChallenges:[...(prev.realLifeChallenges||[]),challenge]}));
                    setNewChallenge({title:"",reward:"",days:30});
                    setShowNewChallenge(false);
                    showNotif("🔥 Challenge started! You got this.");
                  }} style={bStyle(ACCENT.cal)}>START CHALLENGE</button>
                </div>
              )}

              {(data.realLifeChallenges||[]).length===0&&!showNewChallenge&&(
                <div style={{...cStyle,textAlign:"center",padding:"24px"}}>
                  <div style={{fontSize:"32px",marginBottom:"8px"}}>🎯</div>
                  <div style={mutedText}>No active challenges yet</div>
                  <div style={{...mutedText,marginTop:"4px"}}>Tap + NEW to create one</div>
                </div>
              )}

              {[...(data.realLifeChallenges||[])].reverse().map(ch=>{
                const start=new Date(ch.startDate);
                const daysPassed=Math.floor((Date.now()-start.getTime())/(1000*60*60*24));
                const progress=Math.min(((ch.checkIns||[]).length/ch.days)*100,100);
                const checkedToday=(ch.checkIns||[]).includes(today);
                const isComplete=(ch.checkIns||[]).length>=ch.days||ch.completed;
                const daysLeft=Math.max(ch.days-daysPassed,0);
                return(
                  <div key={ch.id} style={{...cStyle,border:`2px solid ${isComplete?ACCENT.steps:checkedToday?ACCENT.gym+"66":T.border}`,background:isComplete?ACCENT.steps+"08":T.card}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"13px",fontWeight:"bold",color:isComplete?ACCENT.steps:T.text}}>{ch.title}</div>
                        {ch.reward&&<div style={{fontSize:"10px",color:ACCENT.reward,marginTop:"2px",fontWeight:"bold"}}>🎁 {ch.reward}</div>}
                        <div style={mutedText}>{(ch.checkIns||[]).length}/{ch.days} days · {daysLeft}d left</div>
                      </div>
                      <div style={{marginLeft:"8px"}}>
                        {isComplete
                          ?<div style={{fontSize:"20px"}}>✅</div>
                          :<button onClick={()=>{
                            if(checkedToday) return;
                            setData(prev=>({...prev,realLifeChallenges:(prev.realLifeChallenges||[]).map(c=>c.id===ch.id?{...c,checkIns:[...(c.checkIns||[]),today]}:c)}));
                            showNotif("✓ Checked in! Keep going 💪");
                          }} style={{background:checkedToday?ACCENT.gym+"22":ACCENT.gym,border:"none",borderRadius:"7px",color:"#000",fontSize:"10px",fontWeight:"bold",cursor:checkedToday?"default":"pointer",padding:"8px 12px",fontFamily:"monospace",whiteSpace:"nowrap"}}>
                            {checkedToday?"✓ DONE":"CHECK IN"}
                          </button>
                        }
                      </div>
                    </div>
                    <div style={{background:T.sub,borderRadius:"3px",height:"6px",overflow:"hidden",border:`1px solid ${T.border}`}}>
                      <div style={{height:"100%",width:`${progress}%`,background:isComplete?"linear-gradient(90deg,#00d4aa,#00ff88)":ACCENT.gym,borderRadius:"3px",transition:"width 0.5s"}}/>
                    </div>
                    {isComplete&&!ch.completed&&(
                      <button onClick={()=>{
                        setData(prev=>({...prev,realLifeChallenges:(prev.realLifeChallenges||[]).map(c=>c.id===ch.id?{...c,completed:true}:c)}));
                        showNotif("🏆 CHALLENGE COMPLETE! Claim your reward!");
                      }} style={bStyle(ACCENT.steps)}>🏆 MARK COMPLETE + CLAIM REWARD</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* BOSSES */}
          {questsTab==="bosses"&&(
            <div>
              <div style={{...mutedText,marginBottom:"12px"}}>Defeat bosses for big XP and real rewards.</div>
              {BOSS_CHALLENGES.map(boss=>{
                const defeated=data.bossesDefeated?.[boss.id];
                return(
                  <div key={boss.id} style={{...cStyle,border:`2px solid ${defeated?ACCENT.steps+"44":T.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                          <span style={{fontSize:"22px"}}>{boss.icon}</span>
                          <div>
                            <div style={{fontSize:"13px",fontWeight:"bold",color:defeated?ACCENT.steps:T.text}}>{boss.name}</div>
                            <div style={mutedText}>{boss.desc}</div>
                          </div>
                        </div>
                        <div style={{fontSize:"10px",color:ACCENT.gym,marginTop:"4px",fontWeight:"bold"}}>🎁 {boss.reward}</div>
                      </div>
                      <div style={{textAlign:"right",marginLeft:"8px"}}>
                        <div style={{fontSize:"14px",fontWeight:"bold",color:ACCENT.gym}}>+{boss.xp}XP</div>
                        {!defeated
                          ?<button onClick={()=>defeatBoss(boss)} style={{background:ACCENT.boss+"22",border:`2px solid ${ACCENT.boss}44`,borderRadius:"5px",color:ACCENT.boss,fontSize:"9px",cursor:"pointer",padding:"4px 10px",marginTop:"6px",fontFamily:"monospace",fontWeight:"bold"}}>DEFEAT</button>
                          :<div style={{fontSize:"10px",color:ACCENT.steps,marginTop:"6px",fontWeight:"bold"}}>⚔️ SLAIN</div>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Focus timer lives here too */}
              <div style={{...cStyle,border:`2px solid ${ACCENT.cardio}44`,marginTop:"4px"}}>
                <div style={labelStyle}>🎵 STUDIO FOCUS TIMER</div>
                {focusTimer!==null?(
                  <div style={{textAlign:"center",padding:"8px 0"}}>
                    <div style={{fontSize:"9px",color:focusMode==="work"?ACCENT.cardio:ACCENT.steps,letterSpacing:"3px",marginBottom:"4px",fontWeight:"bold"}}>{focusMode==="work"?"🎵 FOCUS":"☕ BREAK"}</div>
                    <div style={{fontSize:"46px",fontWeight:"bold",color:focusMode==="work"?ACCENT.cardio:ACCENT.steps,fontVariantNumeric:"tabular-nums"}}>{Math.floor(focusTimer/60)}:{String(focusTimer%60).padStart(2,"0")}</div>
                    <div style={{...mutedText,marginBottom:"8px"}}>Cycles: {focusCycles}</div>
                    <div style={{background:T.sub,borderRadius:"3px",height:"5px",overflow:"hidden",marginBottom:"10px",border:`1px solid ${T.border}`}}>
                      <div style={{height:"100%",width:`${100-((focusTimer/(focusMode==="work"?25*60:5*60))*100)}%`,background:focusMode==="work"?ACCENT.cardio:ACCENT.steps,transition:"width 1s linear"}}/>
                    </div>
                    <button onClick={()=>{setFocusTimer(null);setFocusMode("work");}} style={{background:"none",border:`2px solid ${T.border}`,borderRadius:"6px",color:T.muted,fontSize:"10px",cursor:"pointer",padding:"6px 20px",fontFamily:"monospace",fontWeight:"bold"}}>STOP</button>
                  </div>
                ):(
                  <button onClick={()=>{setFocusMode("work");setFocusTimer(25*60);}} style={bStyle(ACCENT.cardio)}>START 25MIN FOCUS</button>
                )}
              </div>
            </div>
          )}

          {/* CLASSES */}
          {questsTab==="classes"&&(
            <div>
              <div style={{...mutedText,marginBottom:"12px"}}>Unlock character classes by hitting milestones. Each gives real bonuses.</div>
              {CLASSES.map(cls=>{
                const unlocked=cls.check(data);
                return(
                  <div key={cls.id} style={{...cStyle,border:`2px solid ${unlocked?cls.color+"66":T.border}`,opacity:unlocked?1:0.6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:"16px",fontWeight:"bold",color:unlocked?cls.color:T.text}}>{cls.icon} {cls.name}{unlocked&&" ✓"}</div>
                        <div style={{...mutedText,marginTop:"3px"}}>{cls.desc}</div>
                        <div style={{fontSize:"10px",color:ACCENT.gym,marginTop:"6px",fontWeight:"bold"}}>🎁 {cls.reward}</div>
                      </div>
                      <div style={{fontSize:"28px",marginLeft:"12px"}}>{unlocked?"✅":"🔒"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ CHARTS ══ */}
      {tab==="charts"&&(
        <div>
          {/* Cal vs burn */}
          <div style={cStyle}>
            <div style={labelStyle}>CALORIES VS BURN (7 DAYS)</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"90px"}}>
              {weekLogs.map(({date,day,log})=>{
                const cal=log?.calories||0;const burn=cal>0?1950+(log.steps>=15000?680:log.steps>=10000?510:log.steps>=5000?210:100)+(log.gym?350:0):0;
                const max=2800;const calH=cal>0?Math.max((cal/max)*80,3):3;const burnH=burn>0?Math.max((burn/max)*80,3):3;
                const isToday=date===today;
                return(
                  <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
                    <div style={{width:"100%",display:"flex",gap:"1px",alignItems:"flex-end",height:"80px"}}>
                      <div style={{flex:1,height:`${calH}px`,background:isToday?ACCENT.cal:ACCENT.cal+"66",borderRadius:"2px 2px 0 0"}}/>
                      <div style={{flex:1,height:`${burnH}px`,background:isToday?ACCENT.steps:ACCENT.steps+"44",borderRadius:"2px 2px 0 0"}}/>
                    </div>
                    <div style={{fontSize:"8px",color:isToday?ACCENT.steps:T.muted,fontWeight:isLight?"700":"400"}}>{day}</div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:"14px",marginTop:"8px"}}>
              {[[ACCENT.cal,"Calories"],[ACCENT.steps,"Burn"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:"4px"}}>
                  <div style={{width:"10px",height:"10px",borderRadius:"2px",background:c,border:`1px solid ${T.border}`}}/>
                  <span style={{...mutedText}}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly deficit */}
          <div style={cStyle}>
            <div style={labelStyle}>WEEKLY DEFICIT</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
              <div>
                <div style={{fontSize:"24px",fontWeight:"bold",color:weekLogs.reduce((a,{log})=>{if(!log?.calories)return a;const burn=1950+(log.steps>=15000?680:log.steps>=10000?510:log.steps>=5000?210:100)+(log.gym?350:0);return a+(burn-(log.calories||0));},0)>0?ACCENT.steps:ACCENT.protein}}>
                  {(()=>{const d=weekLogs.reduce((a,{log})=>{if(!log?.calories)return a;const burn=1950+(log.steps>=15000?680:log.steps>=10000?510:log.steps>=5000?210:100)+(log.gym?350:0);return a+(burn-(log.calories||0));},0);return(d>0?"+":"")+d.toLocaleString();})()}
                </div>
                <div style={mutedText}>kcal deficit this week</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"20px",fontWeight:"bold",color:ACCENT.protein}}>
                  ~{Math.abs((weekLogs.reduce((a,{log})=>{if(!log?.calories)return a;const burn=1950+(log.steps>=15000?680:log.steps>=10000?510:log.steps>=5000?210:100)+(log.gym?350:0);return a+(burn-(log.calories||0));},0)/7700).toFixed(2))}kg
                </div>
                <div style={mutedText}>fat lost est.</div>
              </div>
            </div>
          </div>

          {/* Protein consistency */}
          <div style={cStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <div style={labelStyle}>PROTEIN CONSISTENCY</div>
              <div style={{fontSize:"22px",fontWeight:"bold",color:weekLogs.filter(d=>d.log?.protein>=120).length/Math.max(weekLogs.filter(d=>d.log?.calories>0).length,1)>=0.7?ACCENT.steps:ACCENT.gym}}>
                {Math.round((weekLogs.filter(d=>d.log?.protein>=120).length/Math.max(weekLogs.filter(d=>d.log?.calories>0).length,1))*100)}%
              </div>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"50px"}}>
              {weekLogs.map(({date,day,log})=>{
                const prot=log?.protein||0;const h=prot>0?Math.max((prot/160)*50,3):3;const hit=prot>=120;
                return(
                  <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
                    <div style={{width:"100%",height:`${h}px`,background:hit?ACCENT.steps:prot>0?ACCENT.protein+"55":T.sub,borderRadius:"2px 2px 0 0"}}/>
                    <div style={{fontSize:"7px",color:date===today?ACCENT.steps:T.muted,fontWeight:isLight?"700":"400"}}>{day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bench press progress */}
          {Object.entries(data.logs||{}).filter(([,l])=>l.exerciseWeights?.["Bench Press"]).length>1&&(
            <div style={cStyle}>
              <div style={labelStyle}>BENCH PRESS PROGRESSION 📈</div>
              {(()=>{
                const history=Object.entries(data.logs).filter(([,l])=>l.exerciseWeights?.["Bench Press"]).map(([date,l])=>({date,weight:l.exerciseWeights["Bench Press"]})).sort((a,b)=>a.date.localeCompare(b.date)).slice(-10);
                const minW=Math.min(...history.map(e=>e.weight))-5;const maxW=Math.max(...history.map(e=>e.weight))+5;
                return(
                  <div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"70px"}}>
                      {history.map(({date,weight},i)=>{
                        const h=((weight-minW)/(maxW-minW))*60+10;const isLast=i===history.length-1;
                        return(
                          <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
                            <div style={{fontSize:"8px",color:isLast?ACCENT.gym:T.muted,fontWeight:isLast?"bold":"400"}}>{weight}</div>
                            <div style={{width:"100%",height:`${h}px`,background:isLast?"linear-gradient(0deg,#ffd700,#ff6b35)":ACCENT.gym+"44",borderRadius:"2px 2px 0 0"}}/>
                            <div style={{fontSize:"7px",color:T.muted}}>{new Date(date).toLocaleDateString("en-CA",{month:"numeric",day:"numeric"})}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{fontSize:"10px",color:ACCENT.gym,marginTop:"6px",fontWeight:"bold"}}>PR: {data.exercisePRs?.["Bench Press"]||"-"} lbs · +{history.length>1?(history[history.length-1].weight-history[0].weight).toFixed(1):0}lbs total</div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Heatmap */}
          <div style={cStyle}>
            <div style={labelStyle}>28-DAY HEATMAP</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px",marginBottom:"4px"}}>
              {DAYS.map(d=>(<div key={d} style={{textAlign:"center",fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>{d}</div>))}
              {Array.from({length:28},(_,i)=>{
                const d=new Date();d.setDate(d.getDate()-27+i);const key=d.toISOString().split("T")[0];const log=data.logs[key];
                const activity=log?.gym?3:log?.steps>=10000?2:log?.calories>0?1:0;
                const colors=[T.sub,ACCENT.steps+"33",ACCENT.steps+"77",ACCENT.steps];
                return(<div key={key} style={{aspectRatio:"1",borderRadius:"3px",background:colors[activity],border:`1px solid ${T.border}`}}/>);
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ CALENDAR ══ */}
      {tab==="calendar"&&(
        <div>
          {(()=>{
            const monthKey2=`${year}-${String(month+1).padStart(2,"0")}`;
            const monthBarberCount=Object.entries(data.personalTrackers||{}).filter(([d,v])=>d.startsWith(monthKey2)&&v&&v.barber).length;
            const monthResetCount=Object.entries(data.personalTrackers||{}).filter(([d,v])=>d.startsWith(monthKey2)&&v&&v.reset).length;
            const monthRestCount=Object.entries(data.personalTrackers||{}).filter(([d,v])=>d.startsWith(monthKey2)&&v&&v.restDay).length;
            return(
              <div style={{...cStyle,marginBottom:"12px"}}>
                <div style={labelStyle}>THIS MONTH</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px"}}>
                  <div style={{background:T.sub,borderRadius:"8px",padding:"10px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:"18px",fontWeight:"bold",color:ACCENT.reward}}>{monthBarberCount}/2</div>
                    <div style={{fontSize:"9px",color:T.muted,fontWeight:isLight?"700":"400"}}>✂️ BARBER</div>
                  </div>
                  <div style={{background:T.sub,borderRadius:"8px",padding:"10px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:"18px",fontWeight:"bold",color:"#b06aff"}}>{monthResetCount}x</div>
                    <div style={{fontSize:"9px",color:T.muted,fontWeight:isLight?"700":"400"}}>⚡ RESET</div>
                  </div>
                  <div style={{background:T.sub,borderRadius:"8px",padding:"10px",textAlign:"center",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:"18px",fontWeight:"bold",color:ACCENT.sleep}}>{monthRestCount}x</div>
                    <div style={{fontSize:"9px",color:T.muted,fontWeight:isLight?"700":"400"}}>💤 REST</div>
                  </div>
                </div>
              </div>
            );
          })()}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <button onClick={()=>setCalMonth(new Date(year,month-1))} style={{background:"none",border:"none",color:ACCENT.steps,fontSize:"20px",cursor:"pointer",fontWeight:"bold"}}>←</button>
            <div style={{fontSize:"13px",fontWeight:"bold",letterSpacing:"2px",color:T.text}}>{MONTHS[month].toUpperCase()} {year}</div>
            <button onClick={()=>setCalMonth(new Date(year,month+1))} style={{background:"none",border:"none",color:ACCENT.steps,fontSize:"20px",cursor:"pointer",fontWeight:"bold"}}>→</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px",marginBottom:"4px"}}>
            {DAYS.map(d=>(<div key={d} style={{textAlign:"center",fontSize:"9px",color:T.muted,fontWeight:"bold"}}>{d}</div>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px",marginBottom:"10px"}}>
            {Array(firstDay).fill(null).map((_,i)=>(<div key={`e${i}`}/>))}
            {Array(daysInMonth).fill(null).map((_,i)=>{
              const day=i+1;
              const dk=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const log=data.logs[dk];const isToday=dk===today;
              const tracker=(data.personalTrackers||{})[dk]||{};
              return(
                <div key={day} onClick={()=>setCalTrackerDate(calTrackerDate===dk?null:dk)} style={{aspectRatio:"1",borderRadius:"5px",cursor:"pointer",
                  background:isToday?ACCENT.steps+"22":log?.gym?ACCENT.cal+"22":log?.homeGym?ACCENT.home+"22":log?.calories>0?T.card:T.sub,
                  border:`2px solid ${isToday?ACCENT.steps:log?.gym?ACCENT.cal+"88":log?.homeGym?ACCENT.home+"66":T.border}`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:"10px",color:isToday?ACCENT.steps:log?.gym?ACCENT.cal:T.muted,fontWeight:"bold"}}>{day}</div>
                  <div style={{fontSize:"6px",lineHeight:1,display:"flex",gap:"1px",flexWrap:"wrap",justifyContent:"center"}}>
                    {log?.gym&&<span>🏋️</span>}
                    {log?.homeGym&&<span>🏠</span>}
                    {tracker.barber&&<span>✂️</span>}
                    {tracker.reset&&<span>⚡</span>}
                    {tracker.restDay&&<span>💤</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {calTrackerDate&&(
            <div style={{...cStyle,border:`2px solid ${ACCENT.steps}44`,marginBottom:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                <div style={labelStyle}>LOG FOR {calTrackerDate}</div>
                <button onClick={()=>setCalTrackerDate(null)} style={{background:"none",border:"none",color:T.muted,fontSize:"18px",cursor:"pointer"}}>×</button>
              </div>
              {[
                {key:"barber",label:"✂️ Barber / Beard Trim",color:ACCENT.reward},
                {key:"reset",label:"⚡ Reset Session",color:"#b06aff"},
                {key:"restDay",label:"💤 Rest Day",color:ACCENT.sleep},
                {key:"cheatMeal",label:"🍔 Cheat Meal",color:ACCENT.cal},
                {key:"goodSleep",label:"😴 Great Sleep Night",color:ACCENT.sleep},
              ].map(item=>{
                const tracker=(data.personalTrackers||{})[calTrackerDate]||{};
                const isOn=tracker[item.key];
                return(
                  <div key={item.key} onClick={()=>{
                    setData(prev=>{
                      const existing=(prev.personalTrackers||{})[calTrackerDate]||{};
                      return{...prev,personalTrackers:{...prev.personalTrackers,[calTrackerDate]:{...existing,[item.key]:!existing[item.key]}}};
                    });
                  }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:"8px",marginBottom:"6px",cursor:"pointer",background:isOn?item.color+"11":T.sub,border:`2px solid ${isOn?item.color+"66":T.border}`}}>
                    <span style={{fontSize:"12px",fontWeight:"bold",color:isOn?item.color:T.text}}>{item.label}</span>
                    <div style={{width:"22px",height:"22px",borderRadius:"50%",background:isOn?item.color:"transparent",border:`2px solid ${isOn?item.color:T.muted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"bold",color:isOn?"#000":T.muted}}>{isOn?"✓":""}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {[[ACCENT.cal,"Gym"],[ACCENT.home+"66","Home Gym"],["✂️","Barber"],["⚡","Reset"],["💤","Rest"]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:"3px"}}>
                {typeof c==="string"&&c.length>2?<span style={{fontSize:"12px"}}>{c}</span>:<div style={{width:"8px",height:"8px",borderRadius:"2px",background:c}}/>}
                <span style={mutedText}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {tab==="reports"&&(
        <div>
          <div style={{display:"flex",gap:"4px",marginBottom:"12px",background:T.card,borderRadius:"8px",padding:"3px",border:`2px solid ${T.border}`}}>
            {[["weekly","WEEKLY"],["monthly","MONTHLY"]].map(([v,l])=>(
              <button key={v} onClick={()=>setReportView(v)} style={{flex:1,padding:"8px",borderRadius:"6px",border:"none",background:reportView===v?ACCENT.steps:"transparent",color:reportView===v?"#000":T.muted,fontSize:"11px",fontWeight:"bold",cursor:"pointer",fontFamily:"monospace"}}>
                {l}
              </button>
            ))}
          </div>
          {reportView==="weekly"&&(
            <div>
              <div style={labelStyle}>WEEKLY REPORTS</div>
              {(()=>{
                const wk=getMonday(today);
                const wDays=getWeekDays();
                const wLogs=wDays.map(d=>data.logs[d.date]||null).filter(Boolean);
                if(wLogs.length===0) return <div style={{...cStyle,textAlign:"center",padding:"24px"}}><div style={{fontSize:"32px"}}>📊</div><div style={mutedText}>Log meals and activities to see your weekly report</div></div>;
                const avgCal=Math.round(wLogs.reduce((a,l)=>a+(l.calories||0),0)/wLogs.length);
                const avgProt=Math.round(wLogs.reduce((a,l)=>a+(l.protein||0),0)/wLogs.length);
                const avgFiber=Math.round(wLogs.reduce((a,l)=>a+(l.fiber||0),0)/wLogs.length);
                const avgSteps=Math.round(wLogs.reduce((a,l)=>a+(l.steps||0),0)/wLogs.length);
                const gymDays=wLogs.filter(l=>l.gym).length;
                const homeDays=wLogs.filter(l=>l.homeGym).length;
                const protHit=wLogs.filter(l=>(l.protein||0)>=120).length;
                const fiberHit=wLogs.filter(l=>(l.fiber||0)>=25).length;
                const deficit=wLogs.reduce((a,l)=>{if(!l.calories) return a;const burn=1950+(l.steps>=15000?680:l.steps>=10000?510:l.steps>=5000?210:100)+(l.gym?350:0);return a+(burn-(l.calories||0));},0);
                return(
                  <div>
                    <div style={{...cStyle,border:`2px solid ${ACCENT.steps}44`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                        <div><div style={{fontSize:"13px",fontWeight:"bold"}}>Week of {new Date(wk).toLocaleDateString("en-CA",{month:"short",day:"numeric"})}</div><div style={mutedText}>{wLogs.length} days logged</div></div>
                        <div style={{textAlign:"right"}}><div style={{fontSize:"14px",fontWeight:"bold",color:deficit>0?ACCENT.steps:ACCENT.protein}}>{deficit>0?"+":""}{deficit.toLocaleString()}</div><div style={mutedText}>kcal deficit</div></div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
                        {[{l:"AVG CAL",v:avgCal,c:ACCENT.cal},{l:"AVG PROT",v:avgProt+"g",c:ACCENT.protein},{l:"AVG FIBER",v:avgFiber+"g",c:ACCENT.fiber},{l:"AVG STEPS",v:avgSteps>=1000?Math.round(avgSteps/100)/10+"k":avgSteps,c:ACCENT.steps},{l:"GYM DAYS",v:gymDays+"/7",c:ACCENT.gym},{l:"HOME DAYS",v:homeDays+"/7",c:ACCENT.home}].map(s=>(
                          <div key={s.l} style={{background:T.sub,borderRadius:"6px",padding:"8px",textAlign:"center",border:`1px solid ${T.border}`}}>
                            <div style={{fontSize:"14px",fontWeight:"bold",color:s.c}}>{s.v}</div>
                            <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{marginTop:"10px"}}>
                        <div style={{...mutedText,color:protHit>=5?ACCENT.steps:ACCENT.gym,fontWeight:"bold"}}>💪 Protein target: {protHit}/{wLogs.length} days</div>
                        <div style={{...mutedText,color:fiberHit>=5?ACCENT.steps:ACCENT.fiber,fontWeight:"bold",marginTop:"4px"}}>🌾 Fiber target: {fiberHit}/{wLogs.length} days</div>
                      </div>
                    </div>
                    <div style={labelStyle}>7-DAY BREAKDOWN</div>
                    {wDays.map(({date,day})=>{
                      const log=data.logs[date]||null;
                      return(
                        <div key={date} style={{...cStyle,marginBottom:"5px",padding:"10px 12px",border:`1px solid ${date===today?ACCENT.steps+"44":T.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:"11px",fontWeight:"bold",color:date===today?ACCENT.steps:"#888"}}>{day}{date===today&&" ← TODAY"}</span>
                            <div style={{display:"flex",gap:"7px",fontSize:"10px"}}>
                              {log?(<>
                                <span style={{color:ACCENT.cal,fontWeight:"bold"}}>{log.calories||0}</span>
                                <span style={{color:ACCENT.protein,fontWeight:"bold"}}>{log.protein||0}g</span>
                                <span style={{color:ACCENT.fiber,fontWeight:"bold"}}>{log.fiber||0}f</span>
                                <span style={{color:ACCENT.steps}}>{log.steps?(Math.round(log.steps/1000)+"k"):"0"}</span>
                                {log.gym&&<span style={{color:ACCENT.gym}}>🏋️</span>}
                                {log.homeGym&&<span style={{color:ACCENT.home}}>🏠</span>}
                              </>):<span style={{color:"#333"}}>—</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
          {reportView==="monthly"&&(
            <div>
              <div style={labelStyle}>MONTHLY SNAPSHOT</div>
              {(()=>{
                const monthKey3=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
                const monthLogs=Object.entries(data.logs).filter(([d])=>d.startsWith(monthKey3)).map(([,l])=>l);
                if(monthLogs.length===0) return <div style={{...cStyle,textAlign:"center",padding:"24px"}}><div style={{fontSize:"32px"}}>📅</div><div style={mutedText}>Keep logging to see monthly data</div></div>;
                const mAvgCal=Math.round(monthLogs.reduce((a,l)=>a+(l.calories||0),0)/monthLogs.length);
                const mAvgProt=Math.round(monthLogs.reduce((a,l)=>a+(l.protein||0),0)/monthLogs.length);
                const mGym=monthLogs.filter(l=>l.gym).length;
                const mHome=monthLogs.filter(l=>l.homeGym).length;
                const mProtHit=monthLogs.filter(l=>(l.protein||0)>=120).length;
                const mFiberHit=monthLogs.filter(l=>(l.fiber||0)>=25).length;
                const monthName=MONTHS[new Date().getMonth()];
                return(
                  <div style={cStyle}>
                    <div style={{fontSize:"14px",fontWeight:"bold",marginBottom:"10px"}}>{monthName} {new Date().getFullYear()}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
                      {[
                        {l:"GYM SESSIONS",v:mGym,c:ACCENT.gym},
                        {l:"HOME SESSIONS",v:mHome,c:ACCENT.home},
                        {l:"DAYS LOGGED",v:monthLogs.length,c:ACCENT.steps},
                        {l:"AVG CALORIES",v:mAvgCal,c:ACCENT.cal},
                        {l:"AVG PROTEIN",v:mAvgProt+"g",c:ACCENT.protein},
                        {l:"PROTEIN DAYS",v:mProtHit,c:ACCENT.steps},
                        {l:"FIBER DAYS",v:mFiberHit,c:ACCENT.fiber},
                        {l:"KG LOST",v:lostWeight>0?"-"+lostWeight:"-",c:ACCENT.protein},
                        {l:"CURRENT WT",v:currentWeight+"kg",c:ACCENT.gym},
                      ].map(s=>(
                        <div key={s.l} style={{background:T.sub,borderRadius:"6px",padding:"8px",textAlign:"center",border:`1px solid ${T.border}`}}>
                          <div style={{fontSize:"13px",fontWeight:"bold",color:s.c}}>{s.v}</div>
                          <div style={{fontSize:"8px",color:T.muted,fontWeight:isLight?"700":"400"}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ══ STATS ══ */}
      {tab==="stats"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"12px"}}>
            {[
              {l:"AVG CALORIES",v:weekLogs.filter(d=>d.log?.calories>0).reduce((a,b)=>a+(b.log?.calories||0),0)/Math.max(weekLogs.filter(d=>d.log?.calories>0).length,1)|0,c:ACCENT.cal},
              {l:"AVG PROTEIN",v:(weekLogs.filter(d=>d.log?.protein>0).reduce((a,b)=>a+(b.log?.protein||0),0)/Math.max(weekLogs.filter(d=>d.log?.protein>0).length,1)|0)+"g",c:ACCENT.protein},
              {l:"GYM DAYS",v:`${weekGymCount}/7`,c:ACCENT.gym},
              {l:"TOTAL SESSIONS",v:totalSessions,c:ACCENT.steps},
            ].map(s=>(
              <div key={s.l} style={{...cStyle,marginBottom:0,textAlign:"center"}}>
                <div style={{fontSize:"22px",fontWeight:"bold",color:s.c}}>{s.v}</div>
                <div style={{fontSize:"9px",color:T.muted,fontWeight:isLight?"700":"400",letterSpacing:"1px"}}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={labelStyle}>ACHIEVEMENTS {ACHIEVEMENTS.filter(a=>a.check(data)).length}/{ACHIEVEMENTS.length}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"14px"}}>
            {ACHIEVEMENTS.map(ach=>{
              const unlocked=ach.check(data);
              return(
                <div key={ach.id} style={{...cStyle,marginBottom:0,background:unlocked?(isLight?"#e8fff4":ACCENT.steps+"0a"):T.card,border:`2px solid ${unlocked?ACCENT.steps+"66":T.border}`,opacity:unlocked?1:0.4}}>
                  <div style={{fontSize:"20px",marginBottom:"3px"}}>{ach.icon}</div>
                  <div style={{fontSize:"11px",fontWeight:"bold",color:unlocked?ACCENT.steps:T.text}}>{ach.label}{unlocked&&" ✓"}</div>
                  <div style={{fontSize:"9px",color:T.muted,marginTop:"2px",fontWeight:isLight?"600":"400"}}>{ach.desc}</div>
                  {unlocked&&<div style={{fontSize:"8px",color:ACCENT.gym,marginTop:"4px",fontWeight:"bold"}}>🎁 {ach.reward}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ REWARDS ══ */}
      {tab==="rewards"&&(
        <div>
          {/* Goal progress toward beach body */}
          <div style={{...cStyle,border:`2px solid ${ACCENT.reward}44`}}>
            <div style={labelStyle}>🏖️ BEACH BODY JOURNEY</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
              <div>
                <div style={{fontSize:"22px",fontWeight:"bold",color:ACCENT.reward}}>{Math.round(goalProgress)}%</div>
                <div style={mutedText}>to goal weight ({data.goalWeight}kg)</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"18px",fontWeight:"bold",color:ACCENT.steps}}>{lostWeight>0?lostWeight:0}kg</div>
                <div style={mutedText}>lost so far</div>
              </div>
            </div>
            <div style={{background:T.sub,borderRadius:"4px",height:"10px",overflow:"hidden",border:`1px solid ${T.border}`}}>
              <div style={{height:"100%",width:`${goalProgress}%`,background:`linear-gradient(90deg,${ACCENT.protein},${ACCENT.reward},${ACCENT.steps})`,transition:"width 0.5s"}}/>
            </div>
          </div>

          {/* Real life rewards */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <div style={labelStyle}>🎁 REAL LIFE REWARDS</div>
            <button onClick={()=>setShowAddReward(!showAddReward)} style={{background:"none",border:`2px solid ${T.border}`,borderRadius:"6px",color:ACCENT.steps,fontSize:"10px",cursor:"pointer",padding:"4px 10px",fontFamily:"monospace",fontWeight:"bold"}}>
              {showAddReward?"CANCEL":"+ ADD"}
            </button>
          </div>

          {showAddReward&&(
            <div style={{...cStyle,border:`2px solid ${ACCENT.reward}44`}}>
              <div style={labelStyle}>CREATE YOUR OWN REWARD</div>
              <input value={rewardInput.title} onChange={e=>setRewardInput(p=>({...p,title:e.target.value}))} placeholder="e.g. New Jordans 👟" style={{...iStyle,marginBottom:"8px"}}/>
              <select value={rewardInput.category} onChange={e=>setRewardInput(p=>({...p,category:e.target.value}))} style={{...iStyle,marginBottom:"8px"}}>
                {["🎯 Personal","🍔 Food","👟 Gear","🎮 Entertainment","💆 Recovery","👕 Style","🏖️ Experience","🎵 Music"].map(c=>(
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input value={rewardInput.milestone} onChange={e=>setRewardInput(p=>({...p,milestone:e.target.value}))} placeholder="Milestone (e.g. Hit 10 gym sessions)" style={iStyle}/>
              <button onClick={addCustomReward} style={bStyle(ACCENT.reward)}>ADD REWARD</button>
            </div>
          )}

          {/* Suggested rewards */}
          <div style={labelStyle}>SUGGESTED MILESTONES</div>
          {SUGGESTED_REWARDS.map(r=>{
            const unlocked=isRewardUnlocked(r);const claimed=data.claimedRewards?.[r.id];const prog=rewardProgress(r);
            return(
              <div key={r.id} style={{...cStyle,marginBottom:"8px",
                border:`2px solid ${claimed?ACCENT.steps:unlocked?ACCENT.reward:T.border}`,
                background:claimed?(isLight?"#e8fff4":ACCENT.steps+"08"):unlocked?(isLight?"#fff8e8":ACCENT.reward+"08"):T.card}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"9px",color:r.category.includes("Food")?ACCENT.cal:r.category.includes("Gear")||r.category.includes("Style")?ACCENT.steps:ACCENT.reward,fontWeight:"bold",letterSpacing:"1px",marginBottom:"3px"}}>{r.category}</div>
                    <div style={{fontSize:"13px",fontWeight:"bold",color:claimed?ACCENT.steps:unlocked?ACCENT.reward:T.text}}>{r.title}</div>
                    <div style={mutedText}>{r.milestone}</div>
                  </div>
                  {claimed?(
                    <div style={{fontSize:"22px",marginLeft:"8px"}}>✅</div>
                  ):unlocked?(
                    <button onClick={()=>claimReward(r.id)} style={{background:`linear-gradient(135deg,${ACCENT.reward},${ACCENT.gym})`,border:"none",borderRadius:"8px",color:"#000",fontSize:"10px",fontWeight:"bold",cursor:"pointer",padding:"8px 14px",fontFamily:"monospace",letterSpacing:"1px",whiteSpace:"nowrap",marginLeft:"8px"}}>
                      CLAIM 🎁
                    </button>
                  ):(
                    <div style={{textAlign:"right",marginLeft:"8px"}}>
                      <div style={{fontSize:"13px",fontWeight:"bold",color:T.muted}}>{Math.round(prog)}%</div>
                    </div>
                  )}
                </div>
                {!claimed&&(
                  <div>
                    <div style={{background:T.sub,borderRadius:"4px",height:"6px",overflow:"hidden",border:`1px solid ${T.border}`}}>
                      <div style={{height:"100%",width:`${prog}%`,background:unlocked?`linear-gradient(90deg,${ACCENT.reward},${ACCENT.gym})`:T.muted,borderRadius:"4px",transition:"width 0.5s"}}/>
                    </div>
                    {unlocked&&<div style={{fontSize:"9px",color:ACCENT.reward,marginTop:"5px",fontWeight:"bold",letterSpacing:"1px"}}>🔓 UNLOCKED — YOU EARNED THIS!</div>}
                  </div>
                )}
                {claimed&&<div style={{...mutedText,color:ACCENT.steps,fontWeight:"bold"}}>Claimed {new Date(data.claimedRewards[r.id]).toLocaleDateString("en-CA",{month:"short",day:"numeric"})}</div>}
              </div>
            );
          })}

          {/* Custom rewards */}
          {(data.customRewards||[]).length>0&&(
            <div>
              <div style={labelStyle}>YOUR PERSONAL REWARDS</div>
              {data.customRewards.map(r=>{
                const claimed=data.claimedRewards?.[r.id];
                return(
                  <div key={r.id} style={{...cStyle,marginBottom:"8px",border:`2px solid ${claimed?ACCENT.steps:T.border}`,background:claimed?(isLight?"#e8fff4":ACCENT.steps+"08"):T.card}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:"9px",color:ACCENT.reward,fontWeight:"bold",marginBottom:"2px"}}>{r.category}</div>
                        <div style={{fontSize:"13px",fontWeight:"bold",color:claimed?ACCENT.steps:T.text}}>{r.title}</div>
                        <div style={mutedText}>{r.milestone}</div>
                      </div>
                      {!claimed?(
                        <button onClick={()=>claimReward(r.id)} style={{background:ACCENT.reward+"22",border:`2px solid ${ACCENT.reward}44`,borderRadius:"8px",color:ACCENT.reward,fontSize:"10px",fontWeight:"bold",cursor:"pointer",padding:"8px 12px",fontFamily:"monospace",marginLeft:"8px"}}>CLAIM</button>
                      ):<div style={{fontSize:"22px"}}>✅</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* ══ HELP ══ */}
      {tab==="help"&&(
        <div>
          {/* Streak Freeze section */}
          <div style={{...cStyle,border:`2px solid ${ACCENT.water}44`}}>
            <div style={labelStyle}>❄️ STREAK FREEZES — HOW THEY WORK</div>
            <div style={{...mutedText,marginBottom:"12px",lineHeight:"1.8"}}>
              A streak freeze protects your gym streak for one day you miss. Use it on TODAY tab when you can't train.
            </div>
            <div style={labelStyle}>HOW YOU EARN FREEZES</div>
            {[
              {label:"Start",desc:"You begin with 1 freeze",icon:"🎁",color:ACCENT.water},
              {label:"5 day streak",desc:"Awarded when you hit 5 consecutive gym days",icon:"❄️",color:ACCENT.water},
              {label:"7 day streak",desc:"2 more freezes at 7 days (Week Warrior achievement)",icon:"❄️❄️",color:ACCENT.water},
              {label:"14 day streak",desc:"3 more freezes at 14 days (Fortnight Beast achievement)",icon:"❄️❄️❄️",color:ACCENT.steps},
              {label:"Morning Routine",desc:"Every 5 completed morning routines = 1 freeze",icon:"🌅",color:ACCENT.mood},
              {label:"Boss: The Plateau",desc:"Defeat The Plateau boss challenge = 3 freezes",icon:"🗻",color:ACCENT.boss},
              {label:"Boss: Iron Week",desc:"Defeat Iron Week boss = 1 freeze",icon:"⚔️",color:ACCENT.boss},
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:"16px",flexShrink:0}}>{item.icon}</span>
                <div>
                  <div style={{fontSize:"11px",fontWeight:"bold",color:item.color}}>{item.label}</div>
                  <div style={mutedText}>{item.desc}</div>
                </div>
              </div>
            ))}
            <div style={{...mutedText,marginTop:"10px",padding:"8px 10px",background:T.sub,borderRadius:"6px",border:`1px solid ${T.border}`,lineHeight:"1.7"}}>
              💡 Streak resets happen at midnight if you didn't log a gym session OR use a freeze. The streak counter only tracks gym sessions — not meals or steps.
            </div>
          </div>

          {/* What counts as streak */}
          <div style={{...cStyle,border:`2px solid ${ACCENT.gym}44`}}>
            <div style={labelStyle}>🔥 WHAT COUNTS AS A STREAK</div>
            {[
              {label:"✅ Counts",items:["Logging a gym session (any split)","Logging a home gym session","Using a streak freeze","Tapping LOG GYM SESSION on the TODAY tab"]},
              {label:"❌ Does NOT count",items:["Logging meals only","Logging steps only","Logging water, sleep or mood","Completing missions without gym"]},
            ].map((group,i)=>(
              <div key={i} style={{marginBottom:"12px"}}>
                <div style={{fontSize:"11px",fontWeight:"bold",color:i===0?ACCENT.steps:ACCENT.protein,marginBottom:"6px"}}>{group.label}</div>
                {group.items.map((item,j)=>(
                  <div key={j} style={{...mutedText,padding:"4px 0",borderBottom:`1px solid ${T.border}22`}}>· {item}</div>
                ))}
              </div>
            ))}
            <div style={{...mutedText,padding:"8px 10px",background:T.sub,borderRadius:"6px",border:`1px solid ${T.border}`,lineHeight:"1.7"}}>
              💡 XP multiplier: 3+ day streak = 1.2x all XP. 7+ day streak = 1.5x all XP.
            </div>
          </div>

          {/* Feature overview */}
          <div style={cStyle}>
            <div style={labelStyle}>📖 FEATURE GUIDE</div>
            {[
              {icon:"⚡",title:"Energy Score (TODAY)",desc:"0-100 score calculated from protein, steps, sleep, water, mood and training. Self-input buttons let you adjust ±10 based on how you actually feel. The suggestion below tells you if gym is a go or not."},
              {icon:"🌾",title:"Fiber Reminder (TODAY)",desc:"Appears when your protein is high (80g+) but fiber is low. High protein diets need high fiber to stay regular and absorb properly. Target is dynamic — scales with your protein."},
              {icon:"🔥",title:"Calorie Target (LOG → BODY)",desc:"Set your maintenance calories (TDEE) and your daily deficit. Your target = maintenance minus deficit. 500 cal deficit ≈ 0.5kg fat loss per week. Use tdeecalculator.net for your personal TDEE."},
              {icon:"🏋️",title:"Gym Sessions (GYM tab)",desc:"Pick a split (Push/Pull/Legs/Full Body), log sets with weight and reps. PRs are auto-tracked. Rest timer starts automatically after each set. Warmup weights suggested based on your PR."},
              {icon:"🏠",title:"Home Gym (GYM → HOME)",desc:"12 bodyweight exercises. Tap reps (25/50/75/100) for each, log the session. Calories burned estimated per exercise. Counts toward streak."},
              {icon:"🎯",title:"Daily Missions (QUESTS → MISSIONS)",desc:"Pick 3 missions each day. Complete all 3 = +50 bonus XP. Missions refresh daily and are randomised from a pool of 12."},
              {icon:"🔥",title:"Real Life Challenges (QUESTS → CHALLENGES)",desc:"Set your own challenge with a title, reward, and duration. Check in daily. Progress tracked with a bar. Mark complete to claim your reward."},
              {icon:"📊",title:"Reports (REPORTS tab)",desc:"Weekly and monthly summaries auto-generated from your logs. Shows avg calories, protein, fiber, steps, gym days and deficit."},
              {icon:"📅",title:"Calendar Trackers (CAL tab)",desc:"Tap any day to log: Barber/Beard trim, Reset Session, Rest Day, Cheat Meal, Great Sleep. Monthly counts shown at top. Goal: 2 barber visits per month."},
              {icon:"🎁",title:"Real Life Rewards (REWARDS tab)",desc:"Milestone rewards unlock automatically when you hit sessions, weight loss or streak targets. Claim them as motivation. Add your own custom rewards too."},
              {icon:"🍽️",title:"Meal Presets (LOG → MEALS)",desc:"Tap EDIT to remove any preset (built-ins get hidden, custom ones get deleted). Add new presets by tapping CUSTOM → filling details → checking Save as preset. 20 preset limit."},
              {icon:"🎭",title:"Character Classes (QUESTS → CLASSES)",desc:"Unlock by hitting big milestones: 15 gym sessions, 5x 15k step days, 120g protein 10+ days, etc. Each class unlocks bonus themes and XP multipliers."},
            ].map((f,i)=>(
              <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
                  <span style={{fontSize:"18px",flexShrink:0}}>{f.icon}</span>
                  <div>
                    <div style={{fontSize:"12px",fontWeight:"bold",color:T.text,marginBottom:"3px"}}>{f.title}</div>
                    <div style={{...mutedText,lineHeight:"1.7"}}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* XP guide */}
          <div style={{...cStyle,border:`2px solid ${ACCENT.gym}44`}}>
            <div style={labelStyle}>⭐ XP GUIDE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
              {[
                ["Log meal","10 XP"],["Log steps 7k+","30 XP"],["Log steps 10k+","50 XP"],
                ["Gym session","75 XP"],["Home gym","40 XP"],["New PR","25 XP bonus"],
                ["Log sleep 8h","20 XP"],["Log mood","5 XP"],["Mission claim","25-100 XP"],
                ["Morning routine","10 XP/item"],["3+ streak","1.2x mult"],["7+ streak","1.5x mult"],
              ].map(([action,xp],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:T.sub,borderRadius:"5px",margin:"2px 0"}}>
                  <span style={mutedText}>{action}</span>
                  <span style={{fontSize:"10px",fontWeight:"bold",color:ACCENT.gym}}>{xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pop{from{transform:translateX(-50%) scale(0.8);opacity:0}to{transform:translateX(-50%) scale(1);opacity:1}}
        @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-12px)}}
        input:focus,textarea:focus,select:focus{outline:none;border-color:#00d4aa !important;}
        input::placeholder,textarea::placeholder{color:#666688;}
        input[type=range]{-webkit-appearance:none;height:6px;border-radius:3px;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;cursor:pointer;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{border-radius:2px;}
        button:active{transform:scale(0.96);}
        select option{background:#10101c;color:#e8e8f0;}
      `}</style>
    </div>
  );
}