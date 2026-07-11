import { chromium } from "playwright";
const APP = "http://localhost:4173";
const API = "http://localhost:5080";
const OUT = "/private/tmp/claude-501/-Users-admin-Desktop-test5/0afe0c40-608b-4a2d-9bd0-9ddac2f6878c/scratchpad/flow";
const VP = { width: 390, height: 844 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiAuth(u){const r=await fetch(API+"/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({devUserId:u})});return r.json();}

async function main(){
  const U = 850000 + Math.floor(Math.random()*90000);
  await apiAuth(U);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport:VP,deviceScaleFactor:2});
  await ctx.addInitScript((uid)=>{try{localStorage.setItem("codex.devUserId",String(uid));}catch(e){void e;}},U);
  const page = await ctx.newPage();
  await page.goto(APP,{waitUntil:"networkidle"});
  await page.waitForFunction(()=>window.__home?.state,null,{timeout:15000});
  console.log("BOOT:",JSON.stringify(await page.evaluate(()=>({state:window.__home.state,due:window.__home.knownDue,rev:window.__home.reviewsTotal,onboarded:window.__home.onboarded}))));

  // Open first lesson, force-play, answer the typed card CORRECTLY using the revealed expected.
  await page.click("#heroCta");
  await page.waitForFunction(()=>window.__lesson,null,{timeout:15000});
  await page.evaluate(()=>window.__viz?.forcePlayAll?.());
  await sleep(400);
  const isTyped = await page.evaluate(()=>!!document.querySelector("#qTyped"));
  console.log("card typed?",isTyped);
  if(isTyped){
    // Type a wrong value first to reveal expected, but better: read expected from the card data via a wrong submit then re-open. Simpler: answer wrong, grade Again(1).
    await page.fill("#qTyped","___wrong___");
  } else {
    await page.click("#qOpts .opt");
  }
  await page.click(".calib-btn");
  await page.click("#qCheck");
  await sleep(400);
  await page.click('.grade-btn[data-g="3"]');
  await sleep(1200);
  const lastReview = await page.evaluate(()=>window.__lastReview ?? null);
  console.log("UI __lastReview:",JSON.stringify(lastReview));
  // verify server independently for THIS user
  const auth = await apiAuth(U);
  const prog = await (await fetch(API+"/api/progress",{headers:{Authorization:"Bearer "+auth.token}})).json();
  console.log("SERVER after UI answer: reviewsTotal=",prog.reviewsTotal,"segmentsViewed=",prog.segmentsViewed);
  // now go home
  await page.click("#btnNext");
  await page.waitForFunction(()=>window.__home?.state,null,{timeout:15000});
  console.log("HOME after:",JSON.stringify(await page.evaluate(()=>({state:window.__home.state,due:window.__home.knownDue,rev:window.__home.reviewsTotal,today:window.__home.todayCount,onboarded:window.__home.onboarded}))));
  await page.screenshot({path:OUT+"/loop-home-after.png"});
  await browser.close();
}
main().catch(e=>{console.error("FAIL",e);process.exit(1);});
