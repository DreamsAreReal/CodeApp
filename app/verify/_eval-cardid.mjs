import { chromium } from "playwright";
const APP="http://localhost:4173",API="http://localhost:5080",VP={width:390,height:844};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function apiAuth(u){const r=await fetch(API+"/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({devUserId:u})});return r.json();}
async function boxingCardId(page){
  await page.evaluate(()=>window.__app.openLesson("T1.M3.boxing"));
  await page.waitForFunction(()=>window.__lesson,null,{timeout:15000});
  await sleep(300);
  // The itemId that will be posted = `${lesson.id}/${card.id}` where card = lesson.cards[0].
  // Read it from the module's data via the question text mapping is brittle; instead trigger a
  // dry check: answer wrong quickly to populate __lastAnswer.itemId, without grading.
  await page.evaluate(()=>window.__viz?.forcePlayAll?.());
  await sleep(200);
  const typed = await page.evaluate(()=>!!document.querySelector("#qTyped"));
  if(typed){ await page.fill("#qTyped","zzz"); } else { await page.click("#qOpts .opt"); }
  await page.click(".calib-btn"); await page.click("#qCheck"); await sleep(250);
  const id = await page.evaluate(()=>window.__lastAnswer?.itemId);
  return id;
}
async function main(){
  const U=895000+Math.floor(Math.random()*4000);
  await apiAuth(U);
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:VP,deviceScaleFactor:2});
  await ctx.addInitScript((uid)=>{try{localStorage.setItem("codex.devUserId",String(uid));}catch(e){void e;}},U);
  const page=await ctx.newPage();
  await page.goto(APP,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>window.__app?.ready,null,{timeout:15000});
  const id1 = await boxingCardId(page);
  // grade + home
  await page.click('.grade-btn[data-g="3"]'); await sleep(800);
  await page.click("#btnNext"); await page.waitForFunction(()=>window.__home?.state,null,{timeout:15000});
  const id2 = await boxingCardId(page);
  console.log("boxing itemId open#1:",id1);
  console.log("boxing itemId open#2:",id2);
  console.log(id1===id2 ? "RESULT: SAME card both opens -> boxing/c2 UNREACHABLE via UI" : "RESULT: advances to next due card");
  await browser.close();
}
main().catch(e=>{console.error(e);process.exit(1);});
