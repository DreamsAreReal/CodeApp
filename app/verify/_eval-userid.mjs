import { chromium } from "playwright";
const APP="http://localhost:4173",API="http://localhost:5080",VP={width:390,height:844};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function apiAuth(u){const r=await fetch(API+"/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({devUserId:u})});return r.json();}
async function main(){
  const U=860000+Math.floor(Math.random()*90000);
  await apiAuth(U);
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:VP,deviceScaleFactor:2});
  await ctx.addInitScript((uid)=>{try{localStorage.setItem("codex.devUserId",String(uid));}catch(e){void e;}},U);
  const page=await ctx.newPage();
  await page.goto(APP,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>window.__home?.userId!=null,null,{timeout:15000});
  console.log("intended U =",U);
  console.log("HOME userId (UI) =",await page.evaluate(()=>window.__home.userId));
  console.log("session mode =",await page.evaluate(()=>window.__home.mode));
  // answer then check lastReview itemId userId is implicit; but check /api/progress under UI's own token via app
  await page.click("#heroCta");
  await page.waitForFunction(()=>window.__lesson,null,{timeout:15000});
  await page.evaluate(()=>window.__viz?.forcePlayAll?.());
  await sleep(300);
  await page.fill("#qTyped","x");
  await page.click(".calib-btn");
  await page.click("#qCheck");
  await sleep(300);
  await page.click('.grade-btn[data-g="3"]');
  await sleep(1000);
  await page.click("#btnNext");
  await page.waitForFunction(()=>window.__home?.userId!=null,null,{timeout:15000});
  console.log("AFTER review HOME userId =",await page.evaluate(()=>window.__home.userId),"reviewsTotal=",await page.evaluate(()=>window.__home.reviewsTotal),"state=",await page.evaluate(()=>window.__home.state));
  await browser.close();
}
main().catch(e=>{console.error(e);process.exit(1);});
