import { chromium } from "playwright";
const APP="http://localhost:4173",API="http://localhost:5080",VP={width:390,height:844};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function apiAuth(u){const r=await fetch(API+"/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({devUserId:u})});return r.json();}
async function main(){
  const U=870000+Math.floor(Math.random()*90000);
  await apiAuth(U);
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:VP,deviceScaleFactor:2});
  await ctx.addInitScript((uid)=>{try{localStorage.setItem("codex.devUserId",String(uid));}catch(e){void e;}},U);
  const page=await ctx.newPage();
  const reqs=[];
  page.on("request",r=>{const u=r.url();if(u.includes("/api/")){reqs.push(r.method()+" "+u.replace(API,"")+" auth="+(r.headers()["authorization"]?"Y":"N"));}});
  const resp=[];
  page.on("response",async r=>{const u=r.url();if(u.includes("/api/progress")||u.includes("/api/due")||u.includes("/api/review")){try{const b=await r.json();resp.push({url:u.replace(API,""),status:r.status(),reviewsTotal:b.reviewsTotal,items:b.items?b.items.length:undefined,reps:b.reps});}catch{}}});
  await page.goto(APP,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>window.__home?.userId!=null,null,{timeout:15000});
  await page.click("#heroCta");
  await page.waitForFunction(()=>window.__lesson,null,{timeout:15000});
  await page.evaluate(()=>window.__viz?.forcePlayAll?.());
  await sleep(300);
  await page.fill("#qTyped","x"); await page.click(".calib-btn"); await page.click("#qCheck"); await sleep(300);
  await page.click('.grade-btn[data-g="3"]'); await sleep(1000);
  await page.click("#btnNext");
  await page.waitForFunction(()=>window.__home?.userId!=null,null,{timeout:15000});
  await sleep(400);
  console.log("U =",U);
  console.log("=== API responses seen ===");
  resp.forEach(r=>console.log(JSON.stringify(r)));
  console.log("HOME final reviewsTotal:",await page.evaluate(()=>window.__home.reviewsTotal),"due:",await page.evaluate(()=>window.__home.knownDue));
  await browser.close();
}
main().catch(e=>{console.error(e);process.exit(1);});
