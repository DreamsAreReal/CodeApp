// How much SRS state fits in Telegram CloudStorage?
// Limits (core.telegram.org/bots/webapps): 1024 keys/user, value 0-4096 chars, key 1-128 chars.
// FSRS per-card state we must persist: due, stability, difficulty, reps, lapses, last_review, state.
const MAX_KEYS = 1024, MAX_VALUE = 4096;

// Compact packing: one card = "id,dueEpochDays,stab,diff,reps,lapses,state" e.g.
const sampleCard = '1734,20180,12.34,5.67,14,2,2';           // ~28 chars + separator
const perCardChars = sampleCard.length + 1;                   // +1 for '|' delimiter
const cardsPerValue = Math.floor(MAX_VALUE / perCardChars);
const maxCardsClientOnly = cardsPerValue * MAX_KEYS;

// JSON-per-card (readable but fat)
const jsonCard = JSON.stringify({id:1734,due:20180,s:12.34,d:5.67,r:14,l:2,st:2});
const jsonPerValue = Math.floor(MAX_VALUE / (jsonCard.length + 1));

console.log('compact per-card chars   :', perCardChars);
console.log('cards per 4096-char value:', cardsPerValue);
console.log('theoretical max cards    :', maxCardsClientOnly.toLocaleString());
console.log('json per-card chars      :', jsonCard.length + 1, '-> cards/value:', jsonPerValue);
console.log('realistic junior corpus  : ~800-2000 cards ->', Math.ceil(2000/cardsPerValue), 'keys (compact)');
