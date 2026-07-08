// Spike: prove Telegram Mini App initData HMAC-SHA256 validation mechanism.
// No real bot token / no network. Self-consistency: we SIGN synthetic initData
// with a fake token exactly the way Telegram's client does, then VERIFY it the
// way a backend must, and prove tamper detection.
// Refs: https://core.telegram.org/bots/webapps (Validating data received via the Mini App)
import crypto from 'node:crypto';

const FAKE_BOT_TOKEN = '123456:FAKE_TOKEN_FOR_SPIKE_ONLY';

// 1) Build a data_check_string: all fields except `hash`, sorted by key,
//    each as "key=value", joined by "\n".
function buildDataCheckString(params) {
  return Object.keys(params)
    .filter((k) => k !== 'hash' && k !== 'signature')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('\n');
}

// 2) Telegram signing (client side, done by Telegram itself):
//    secret_key = HMAC_SHA256(key="WebAppData", message=bot_token)
//    hash       = hex(HMAC_SHA256(key=secret_key, message=data_check_string))
function sign(params, botToken) {
  const dcs = buildDataCheckString(params);
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  return crypto.createHmac('sha256', secretKey).update(dcs).digest('hex');
}

// 3) Backend verification: recompute and constant-time compare; check freshness.
function verify(params, botToken, maxAgeSeconds = 86400) {
  const expected = sign(params, botToken);
  const got = String(params.hash || '');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(got, 'hex');
  const hashOk = a.length === b.length && crypto.timingSafeEqual(a, b);
  const age = Math.floor(Date.now() / 1000) - Number(params.auth_date);
  const fresh = age >= 0 && age <= maxAgeSeconds;
  return { hashOk, fresh, age };
}

// --- Synthetic launch payload (shape mirrors real WebAppInitData) ---
const initData = {
  query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
  user: JSON.stringify({ id: 279058397, first_name: 'Jun', username: 'csharp_jun', language_code: 'ru' }),
  auth_date: String(Math.floor(Date.now() / 1000)),
};
initData.hash = sign(initData, FAKE_BOT_TOKEN);

console.log('data_check_string:\n' + buildDataCheckString(initData));
console.log('\ncomputed hash:', initData.hash);

// Case A: valid
console.log('\n[A] genuine payload         ->', JSON.stringify(verify(initData, FAKE_BOT_TOKEN)));

// Case B: tampered user id (privilege escalation attempt)
const tampered = { ...initData, user: JSON.stringify({ id: 1, first_name: 'Attacker' }) };
console.log('[B] tampered user field     ->', JSON.stringify(verify(tampered, FAKE_BOT_TOKEN)));

// Case C: wrong bot token (forged by third party without the secret)
console.log('[C] wrong bot token         ->', JSON.stringify(verify(initData, '999:OTHER')));

// Case D: stale auth_date (replay of old init data)
const stale = { ...initData };
stale.auth_date = String(Math.floor(Date.now() / 1000) - 90000);
stale.hash = sign(stale, FAKE_BOT_TOKEN);
console.log('[D] stale (25h old) payload ->', JSON.stringify(verify(stale, FAKE_BOT_TOKEN)));

const pass =
  verify(initData, FAKE_BOT_TOKEN).hashOk === true &&
  verify(tampered, FAKE_BOT_TOKEN).hashOk === false &&
  verify(initData, '999:OTHER').hashOk === false &&
  verify(stale, FAKE_BOT_TOKEN).fresh === false;
console.log('\nSPIKE RESULT:', pass ? 'PASS (auth mechanism behaves as spec)' : 'FAIL');
process.exit(pass ? 0 : 1);
