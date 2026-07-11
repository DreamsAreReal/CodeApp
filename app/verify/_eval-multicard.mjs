import { chromium } from "playwright";
const APP="http://localhost:4173",API="http://localhost:5080",VP={width:390,height:844};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function apiAuth(u){const r=await fetch(API+"/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({devUserId:u})});return r.json();}
async function openBoxingReadCard(page){
  await page.evaluate(()=>window.__app.openLesson("T1.M3.boxing"));
  await page.waitForFunction(()=>window.__lesson,null,{timeout:15000});
  await sleep(300);
  const cardId = await page.evaluate(()=>window.__lastAnswer?.itemId ?? null);
  const qTitle = await page.evaluate(()=>document.querySelector("#mcqCard .q-title")?.textContent?.trim().slice(0,60) ?? null);
  return {qTitle};
}
async function main(){
  const U=890000+Math.floor(Math.random()*9000);
  await apiAuth(U);
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:VP,deviceScaleFactor:2});
  await ctx.addInitScript((uid)=>{try{localStorage.setItem("codex.devUserId",String(uid));}catch(e){void e;}},U);
  const page=await ctx.newPage();
  await page.goto(APP,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>window.__app?.ready,null,{timeout:15000});
  // Which card id does boxing render? Read from #mcqCard (itemId embedded on answer). Instead read the question and the itemId lessonRunner uses = cards[0].id
  const c1 = await openBoxingReadCard(page);
  console.log("OPEN #1 boxing question:", c1.qTitle);
  // answer + grade + home
  await page.evaluate(()=>window.__viz?.forcePlayAll?.());
  await sleep(300);
  if(await page.evaluate(()=>!!document.querySelector("#qTyped"))) await page.fill("#qTyped","x");
  else await page.click("#qOpts .opt");
  await page.click(".calib-btn"); await page.click("#qCheck"); await sleep(300);
  await page.click('.grade-btn[data-g="3"]'); await sleep(900);
  const item1 = await page.evaluate(()=>window.__lastAnswer?.itemId);
  console.log("ANSWERED itemId #1:", item1);
  await page.click("#btnNext");
  await page.waitForFunction(()=>window.__home?.state,null,{timeout:15000});
  // reopen boxing
  const c2 = await openBoxingReadCard(page);
  console.log("OPEN #2 boxing question:", c2.qTitle);
  await page.evaluate(()=>window.__viz?.forcePlayAll?.());
  await sleep(300);
  if(await page.evaluate(()=>!!document.querySelector("#qTyped"))) await page.fill("#qTyped","x");
  else await page.click("#qOpts .opt");
  await page.click(".calib-btn"); await page.click("#qCheck"); await sleep(300);
  const item2 = await page.evaluate(()=>window.__lastAnswer?.itemId);
  console.log("ANSWERED itemId #2:", item2);
  console.log(item1===item2 ? ">>> SAME CARD BOTH TIMES — c2 unreachable" : ">>> different cards, advances");
  await browser.close();
}
main().catch(e=>{console.error(e);process.exit(1);});
