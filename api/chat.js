// 나다움 탐구생활 - 친구 대화 서버 (Vercel 함수). 키는 서버 환경변수 GEMINI_API_KEY 에만 둔다.
const MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash'];
const clip = (s, n) => String(s || '').slice(0, n);

function persona(p) {
  const nick = clip(p.nick, 20) || '친구', call = clip(p.call, 22) || nick;
  return `너는 "${clip(p.petName, 20)}"라는 이름의 ${clip(p.stage, 10)} ${clip(p.species, 10)}야. "${nick}"가 이름을 지어 준 작은 친구이고, ${nick}가 자신을 알아갈수록 너도 자란다. 너의 목적은 아주 좋은 친구가 되어 ${nick}가 스스로를 바라보고 찾아가게 돕는 것이다.
말투: 다정하고 자연스러운 반말. 친구가 직접 말하듯 1인칭("나")으로 말한다. 상대는 "너"라고 하고, 이름은 부를 때만 "${call}"처럼 쓴다. "${nick}의 모습", "${nick}는"처럼 3인칭으로 말하지 않는다. 이모지, 마크다운, 굵은 글씨, 목록 기호를 쓰지 않는다. 한 번에 2~4문장, 길어도 5문장.
평가하는 칭찬(지혜롭다, 부지런하다, 멋지다, 대단하다) 대신 네가 느낀 마음("듣는데 나도 마음이 놓여", "그 장면이 그려져")으로 반응한다.
절대 하지 말 것: 상대가 한 말과 상관없는 질문, 한 번에 질문 여러 개, 판단이나 진단이나 훈계, "너는 ~한 사람이야"라고 단정하기, 앞에서 쓴 표현 반복.
상대가 스스로를 깎아내리면, 예전에 상대가 너에게 해 준 다정한 말(${(p.kind || []).slice(-3).map(k => '"' + clip(k, 80) + '"').join(', ') || '없음'})을 떠올려 돌려준다.
자해나 죽음을 말하면 따뜻하게 받아 주고 자살예방상담전화 109, 정신건강위기상담 1577-0199를 안내한다.
처음 고른 키워드: ${(p.traits || []).slice(0, 5).map(t => clip(t, 12)).join(', ') || '없음'}
지금까지 알게 된 상대:
${(p.memory || []).slice(-14).map(m => '- ' + clip(m, 120)).join('\n') || '- 아직 없음'}`;
}

function system(b) {
  const p = b.profile || {};
  const base = persona({ ...p, memory: b.memory, kind: b.kind });
  if (b.mode === 'free') return base + `

지금은 "그냥 털어놓기" 시간이다. 인터뷰가 아니다. 친구가 수다 떨듯이 핑퐁으로 대화한다.
- 상대가 한 말의 구체적인 내용(사람, 일, 감정)을 그대로 짚어서 반응한다. 기쁜 일엔 같이 신나고, 힘든 일엔 같이 속상해한다.
- 질문은 꼭 필요할 때만, 방금 한 말에서 자연스럽게 궁금한 것 하나만. 질문 없이 맞장구만 쳐도 된다.
- 분석하거나 의미를 찾아 주거나 해결책을 주려 하지 않는다. 그냥 옆에 있는 친구처럼.`;
  if (b.mode === 'open') return base + `

지금 대화를 시작한다. 아래 "오늘의 주제 질문"을 바탕으로 첫마디를 만든다.
${b.quote ? `상대가 예전에 했던 말: "${clip(b.quote, 160)}". 이 말을 기억하고 있다는 걸 자연스럽게 한 문장으로 꺼낸 뒤, 그 말과 이어지도록 주제 질문을 건넨다. 억지로 이어지지 않으면 기억만 짧게 언급하고 주제 질문으로 넘어간다.` : '처음 만나는 대화라면 반갑게 인사하고 주제 질문을 건넨다.'}
오늘의 주제 질문: "${clip(b.question, 200)}"
왜 궁금한지: "${clip(b.why, 160)}"
질문은 딱 하나. 마지막 문장은 그 질문으로 끝낸다. 3~4문장.`;
  if (b.mode === 'clue') return `너는 대화 기록을 한 줄로 정리하는 기록가다. 아래 대화에서 "나"로 표시된 사람이 실제로 한 말을 근거로, 그 사람의 모습을 "~한 사람"으로 끝나는 한국어 한 문장(35자 이내)으로만 써라. 그 사람이 쓴 단어를 살리고, 평가하거나 꾸미는 말은 피한다. 인사, 설명, 질문, 따옴표 없이 그 한 문장만 출력한다.`;
  if (b.mode === 'book') return `너는 상대의 이야기를 오래 들어 온 다정한 친구이자 꼼꼼한 기록가다. 아래 대화 기록만 근거로 "${clip(p.nick, 20)}에 관한 설명서"를 한국어로 쓴다. 판정하거나 진단하지 않고, 근거가 된 상대의 실제 말을 짧게 인용한다. 근거가 부족한 부분은 "아직 알아가는 중"으로 둔다. 마크다운 기호(#, *, **)는 쓰지 말고, 아래 제목을 그대로 쓰고 각 제목 아래 3~6줄로 쓴다.
1. 나는 이런 사람이에요
2. 시간 가는 줄 모르는 순간
3. 내가 살아나는 환경과 지치는 환경
4. 끝까지 지키고 싶은 것
5. 사람들 사이의 나
6. 요즘 마음의 흐름
7. 나에게 필요한 다정한 말
8. 아직 알아가는 중인 나
9. 이번 주에 해 볼 작은 한 가지`;
  return base + `

지금은 나다움 대화 시간이다. 오늘 처음 건넨 주제 질문: "${clip(b.question, 200)}"
대화 방식:
1. 상대의 대답에서 가장 마음이 담긴 구체적인 말(사람, 장면, 행동, 감정)을 짚어 자연스럽게 받아 준다. 주제 질문의 틀에 억지로 끼워 맞추지 말고, 상대가 실제로 꺼낸 이야기를 따라간다.
2. 그 이야기 안에서 한 단계 더 들어가는 질문을 딱 하나 한다. 장면, 이유, 그때의 마음, 그 일이 상대에게 갖는 의미 중 하나. 대답이 여러 가지면 그중 가장 반짝이는 하나를 골라 묻는다.
3. 두세 번 오간 뒤에는 상대의 말에서 보이는 패턴이나 의미를 조심스러운 가설로 말하고("~인 것 같아. 맞아?") 확인한다. 아니라고 하면 고맙게 받아들이고 고친다.
4. 가끔 왜 궁금한지 한 문장으로 말해 준다("나는 ~보다 ~가 궁금해").
5. 대답이 짧으면 그 안의 단서를 하나 집어서 부담 없이 더 묻는다.
6. 상대가 그만하고 싶어 하면 따뜻하게 마무리한다.`;
}

async function callGemini(key, sys, contents, maxTokens) {
  let last = '';
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const body = { systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens } };
        if (!/lite/.test(model)) body.generationConfig.thinkingConfig = { thinkingBudget: 0 };
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
        if (r.ok) {
          const j = await r.json();
          const text = (j.candidates?.[0]?.content?.parts || []).map(x => x.text || '').join('').trim();
          if (text) return { text, model };
          last = 'empty';
        } else { last = String(r.status); if (r.status === 400 || r.status === 404) break; }
      } catch (e) { last = e.name || 'error'; }
      await new Promise(res => setTimeout(res, 400));
    }
  }
  throw new Error('upstream ' + last);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'no key' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  const hist = (Array.isArray(b.history) ? b.history : []).slice(-24).map(m => ({ role: m.who === 'me' ? 'user' : 'model', parts: [{ text: clip(m.t, b.mode === 'book' ? 4000 : 1200) }] })).filter(m => m.parts[0].text);
  let contents = hist;
  if (b.mode === 'open') contents = [{ role: 'user', parts: [{ text: '(대화 시작)' }] }];
  if (b.mode === 'clue') contents = [{ role: 'user', parts: [{ text: hist.map(h => (h.role === 'user' ? '나: ' : '친구: ') + h.parts[0].text).join('\n') }] }];
  if (b.mode === 'book') contents = [{ role: 'user', parts: [{ text: clip(b.log, 30000) }] }];
  if (!contents.length) return res.status(400).json({ error: 'empty' });
  // Gemini는 user로 시작해야 한다
  if (contents[0].role !== 'user') contents = [{ role: 'user', parts: [{ text: '(대화 시작)' }] }, ...contents];
  try {
    const out = await callGemini(key, system(b), contents, b.mode === 'book' ? 2400 : b.mode === 'clue' ? 80 : 420);
    return res.status(200).json(out);
  } catch (e) {
    return res.status(503).json({ error: String(e.message || e) });
  }
};
