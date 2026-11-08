import React, { useState, useEffect } from 'react';
import { Callout, Caption, Closing, FileCard, Group, Header, Paragraph, Photos } from './ui';
import { vayikraPack as pack, TYPE_LABELS, qPoints, type Q } from './packs';
import hero from './photos/mishkan-hero.png';
import { ComparisonGame, type ComparisonId } from './comparisons';

function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

const COSTUMES = [
    { points: 30, emoji: '🎩', name: 'כובע קוסם' },
    { points: 80, emoji: '🦺', name: 'חגורת הרפתקן' },
    { points: 150, emoji: '👑', name: 'כתר זהב' },
];
function unlockedCostumes(points: number) { return COSTUMES.filter(c => points >= c.points); }

type Screen = 'home' | 'map' | 'level' | 'done' | 'comparison';

export function App() {
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [stars, setStars] = useState<Record<string, number>>({});

    const [screen, setScreen] = useState<Screen>('home');
    const [level, setLevel] = useState(1);
    const [comparison, setComparison] = useState<ComparisonId>('offerings');
    const [session, setSession] = useState(0);
    const [questions, setQuestions] = useState<Q[]>([]);
    const [qIndex, setQIndex] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [clozeSel, setClozeSel] = useState<string | null>(null);
    const [tableSel, setTableSel] = useState<(number | null)[]>([]);
    const [pick2Sel, setPick2Sel] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [wasCorrect, setWasCorrect] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [doneInfo, setDoneInfo] = useState<{ stars: number; points: number; newCostume: string | null } | null>(null);

    const resetGame = () => {
        setSession(x => x + 1);
        setTotalPoints(0);
        setStars({});
        setScreen('home');
        setLevel(1);
        setQuestions([]);
        setQIndex(0);
        setPicked(null);
        setClozeSel(null);
        setTableSel([]);
        setPick2Sel([]);
        setSubmitted(false);
        setWasCorrect(false);
        setCorrectCount(0);
        setEarnedPoints(0);
        setDoneInfo(null);
    };
    useEffect(() => {
        const onPageHide = () => resetGame();
        const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) resetGame(); };
        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('pageshow', onPageShow);
        return () => {
            window.removeEventListener('pagehide', onPageHide);
            window.removeEventListener('pageshow', onPageShow);
        };
    }, []);

    const starKey = (lv: number) => `${pack.id}:${lv}`;
    const startLevel = (lv: number) => {
        setLevel(lv);
        setQuestions(pack.questions(lv).map(q => {
            if (q.type === 'mc') return { ...q, choices: shuffle(q.choices) };
            if (q.type === 'odd') return { ...q, items: shuffle(q.items) };
            if (q.type === 'cloze') return { ...q, bank: shuffle(q.bank) };
            if (q.type === 'pick2') return { ...q, options: shuffle(q.options) };
            return q;
        }));
        setQIndex(0);
        setPicked(null);
        setClozeSel(null);
        setTableSel([]);
        setPick2Sel([]);
        setSubmitted(false);
        setWasCorrect(false);
        setCorrectCount(0);
        setEarnedPoints(0);
        setScreen('level');
    };

    const current = questions[qIndex];

    const recordAnswer = (correct: boolean) => {
        setSubmitted(true);
        setWasCorrect(correct);
        if (correct) {
            if (current.type !== 'reflect') setCorrectCount(c => c + 1);
            setEarnedPoints(p => p + qPoints(current));
        }
    };
    const answerDirect = (choice: string) => {
        if (submitted || !current) return;
        setPicked(choice);
        const correct = current.type === 'reflect' ? true
            : current.type === 'tf' ? (choice === 'נכון') === current.answer
            : current.type === 'mc' ? choice === current.answer
            : current.type === 'odd' ? choice === current.answer
            : false;
        recordAnswer(correct);
    };
    const checkCloze = () => {
        if (submitted || !current || current.type !== 'cloze' || !clozeSel) return;
        recordAnswer(clozeSel === current.answer);
    };
    const checkTable = () => {
        if (submitted || !current || current.type !== 'table' || tableSel.some(s => s === null)) return;
        recordAnswer(current.correct.every((col, row) => tableSel[row] === col));
    };
    const checkPick2 = () => {
        if (submitted || !current || current.type !== 'pick2' || pick2Sel.length !== 2) return;
        recordAnswer(pick2Sel.every(s => current.answers.includes(s)));
    };
    const next = () => {
        if (qIndex + 1 < questions.length) {
            setQIndex(i => i + 1);
            setPicked(null);
            setClozeSel(null);
            setTableSel([]);
            setPick2Sel([]);
            setSubmitted(false);
            setWasCorrect(false);
        } else {
            const knowledgeTotal = questions.filter(q => q.type !== 'reflect').length;
            const ratio = knowledgeTotal > 0 ? correctCount / knowledgeTotal : 1;
            const newStars = ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.3 ? 1 : 0;
            const before = unlockedCostumes(totalPoints).length;
            const afterPoints = totalPoints + earnedPoints;
            const after = unlockedCostumes(afterPoints);
            const newCostume = after.length > before ? after[after.length - 1].name : null;
            setTotalPoints(afterPoints);
            if (newStars > (stars[starKey(level)] || 0)) setStars({ ...stars, [starKey(level)]: newStars });
            setDoneInfo({ stars: newStars, points: earnedPoints, newCostume });
            setScreen('done');
        }
    };

    const costumeBadges = unlockedCostumes(totalPoints);
    const avatar = <span className="avatar" aria-label="הדמות שלך">
        <span className="avatar-face">🧒</span>
        {costumeBadges.map(c => <span key={c.name} className="avatar-item" title={c.name}>{c.emoji}</span>)}
    </span>;

    return <div dir="rtl" lang="he">
        <FileCard>
            <Header
                title="פרשת ויקרא: משחק חזרה"
                fact="קורבנות"
                intro="לרוני אורה המתוקה שלי! שיהיה לך המון בהצלחה במבחן בתורה!! אוהבת המון המון אמא."
            />

            {screen === 'home' && <>
                <Photos label={pack.worldName} items={[{ src: hero, alt: 'איור של שביל אבנים במדבר המוביל אל המשכן' }]} />
                <Caption>איור להמחשת האווירה בלבד.</Caption>
                <Group label={pack.worldName} heading>
                    <Paragraph>{pack.levels.length} שלבים עם לפחות 15 שאלות בכל שלב, שמכסות את כל שאלות הדף: עולה ומנחה, שלמים, חטאת וסוגיה, עולה ויורד, האשמות ושלבי ההקרבה - כדי להכיר את ההבדלים בין כל הקרבנות.</Paragraph>
                    <button className="file-button" onClick={() => setScreen('map')}>מתחילים לשחק</button>

                </Group>
                <Group label="הדמות שלך">
                    <div className="avatar-row">{avatar}<span className="points-pill">⭐ {totalPoints} נקודות</span></div>
                    <Paragraph>צוברים נקודות על תשובות נכונות ופותחים תלבושות: {COSTUMES.map(c => `${c.name} ב-${c.points} נקודות`).join(', ')}. שאלות רשות עם תשובה נכונה נותנות בונוס כפול; שאלת הרגש נותנת בונוס השתתפות.</Paragraph>
                </Group>
                <Group label="איך הדמו עובד">
                    <Callout title="דף לימוד נכנס, משחק יוצא" tone="success">הזרימה בדמו: שולחים דף למידה בצ'אט, והמשחק מתעדכן בשאלות שנבנות מהדף - כמו שהמשחק הזה נבנה מדף הקרבנות שלך.</Callout>
                    <Callout title="מה עוד לא בדמו" tone="warning">העלאת דף מתוך המשחק עצמו והפקת שאלות אוטומטית עוד לא מיושמות כאן. גם ההתאמה המלאה לגילאי 3–17 היא היעד להמשך - הדמו הזה מותאם לחומר הספציפי ששלחת.</Callout>
                    <Paragraph>בתוכנית המלאה: חומרי לימוד מהמורים, חשבון מהיסוד עד מתקדם וחשיבה, סרטוני הסבר, עולמות נוספים עם משחקים שונים, רמות ועוד תלבושות.</Paragraph>
                </Group>
            </>}

            {screen === 'map' && <>
                <Group label={pack.worldName} heading>
                    <div className="avatar-row">{avatar}<span className="points-pill">⭐ {totalPoints} נקודות</span></div>
                    <div className="level-path">
                        {pack.levels.map(lv => {
                            const earned = stars[starKey(lv.id)] || 0;
                            const locked = lv.id > 1 && !(stars[starKey(lv.id - 1)] > 0);
                            return <button key={lv.id} className={`level-node${locked ? ' is-locked' : ''}`} disabled={locked}
                                onClick={() => startLevel(lv.id)}>
                                <span className="level-icon">{locked ? '🔒' : lv.icon}</span>
                                <span className="level-name">{lv.name}</span>
                                <span className="level-stars">{'★'.repeat(earned)}{'☆'.repeat(3 - earned)}</span>
                            </button>;
                        })}
                    </div>
                    <h3>משחקי טבלאות עם מחסן מילים</h3>
                    <button className="file-button" onClick={() => {setComparison('offerings');setScreen('comparison');}}>השוואה בין כל הקרבנות</button>
                    <button className="file-button" onClick={() => {setComparison('sin');setScreen('comparison');}}>השוואה בין סוגי החטאת</button>
                    <button className="file-button is-compact" data-variant="secondary" onClick={() => setScreen('home')}>חזרה</button>
                </Group>
            </>}

            {screen === 'comparison' && <Group label="תרגול טבלאות">
                <ComparisonGame key={`${session}:${comparison}`} id={comparison} />
                <button className="file-button is-compact" data-variant="secondary" onClick={() => setScreen('map')}>חזרה למפה</button>
            </Group>}

            {screen === 'level' && current && <>
                <Group label={`${pack.levels[level - 1].name} - שאלה ${qIndex + 1} מתוך ${questions.length}`} heading>
                    <div className="q-progress"><div className="q-progress-fill" style={{ width: `${(qIndex / questions.length) * 100}%` }} /></div>
                    <p className="q-type-label">{current.type === 'reflect' ? `שאלת רשות - בונוס השתתפות +${qPoints(current)}` : current.bonus ? `שאלת רשות - בונוס +${qPoints(current)}` : TYPE_LABELS[current.type]}</p>

                    {current.type === 'cloze'
                        ? <p className="q-text">{current.before} <span className={`cloze-blank${clozeSel ? ' is-filled' : ''}`}>{clozeSel ?? '________'}</span> {current.after}</p>
                        : <p className="q-text">{current.q}</p>}

                    {(current.type === 'mc' || current.type === 'odd' || current.type === 'reflect') && <div className="choice-list">
                        {(current.type === 'odd' ? current.items : current.choices).map(choice => {
                            let cls = 'choice-button';
                            if (submitted) {
                                if (current.type === 'reflect') { if (choice === picked) cls += ' is-chosen'; }
                                else if (choice === current.answer) cls += ' is-correct';
                                else if (choice === picked) cls += ' is-wrong';
                            }
                            return <button key={choice} className={cls} disabled={submitted} onClick={() => answerDirect(choice)}>{choice}</button>;
                        })}
                    </div>}

                    {current.type === 'tf' && <div className="tf-row">
                        {(['נכון', 'לא נכון'] as const).map(label => {
                            let cls = 'choice-button';
                            if (submitted) {
                                if ((label === 'נכון') === current.answer) cls += ' is-correct';
                                else if (label === picked) cls += ' is-wrong';
                            }
                            return <button key={label} className={cls} disabled={submitted} onClick={() => answerDirect(label)}>{label}</button>;
                        })}
                    </div>}

                    {current.type === 'pick2' && <>
                        <div className="choice-list">
                            {current.options.map(opt => {
                                let cls = 'choice-button';
                                if (pick2Sel.includes(opt)) cls += ' is-chosen';
                                if (submitted) {
                                    if (current.answers.includes(opt)) cls += ' is-correct';
                                    else if (pick2Sel.includes(opt)) cls += ' is-wrong';
                                }
                                return <button key={opt} className={cls} disabled={submitted}
                                    onClick={() => setPick2Sel(sel => sel.includes(opt) ? sel.filter(x => x !== opt) : sel.length < 2 ? [...sel, opt] : sel)}>{opt}</button>;
                            })}
                        </div>
                        {!submitted && <button className="file-button" disabled={pick2Sel.length !== 2} onClick={checkPick2}>בדיקה</button>}
                    </>}

                    {current.type === 'cloze' && <>
                        <Caption>מחסן מילים: בחרי מילה להשלמת המשפט ואז לחצי בדיקה.</Caption>
                        <div className="bank-row">
                            {current.bank.map(word => {
                                let cls = 'bank-chip';
                                if (submitted && word === current.answer) cls += ' is-correct';
                                else if (submitted && word === clozeSel) cls += ' is-wrong';
                                else if (word === clozeSel) cls += ' is-chosen';
                                return <button key={word} className={cls} disabled={submitted} onClick={() => setClozeSel(word)}>{word}</button>;
                            })}
                        </div>
                        {!submitted && <button className="file-button" disabled={!clozeSel} onClick={checkCloze}>בדיקה</button>}
                    </>}

                    {current.type === 'table' && <>
                        <div className="cmp-table">
                            <div className="cmp-head"><span className="cmp-row-name" />{current.cols.map(c => <span key={c} className="cmp-col">{c}</span>)}</div>
                            {current.rows.map((row, ri) => <div key={row} className="cmp-row">
                                <span className="cmp-row-name">{row}</span>
                                {current.cols.map((col, ci) => {
                                    let cls = 'cmp-cell';
                                    if (tableSel[ri] === ci) cls += ' is-chosen';
                                    if (submitted && tableSel[ri] === ci) cls += ci === current.correct[ri] ? ' is-correct' : ' is-wrong';
                                    if (submitted && tableSel[ri] !== ci && ci === current.correct[ri]) cls += ' is-correct';
                                    return <button key={col} className={cls} disabled={submitted}
                                        onClick={() => setTableSel(sel => current.rows.map((_, i) => i === ri ? ci : (sel[i] ?? null)))}
                                        aria-label={`${row}: ${col}`}>{tableSel[ri] === ci ? '✓' : ''}</button>;
                                })}
                            </div>)}
                        </div>
                        {!submitted && <button className="file-button" disabled={tableSel.length === 0 || tableSel.some(s => s === null)} onClick={checkTable}>בדיקה</button>}
                    </>}

                    {submitted && <>
                        {current.type === 'reflect'
                            ? <Callout title={`תודה ששיתפת! +${qPoints(current)} נקודות`} tone="success">{current.explain}</Callout>
                            : wasCorrect
                            ? <Callout title={`נכון! +${qPoints(current)} נקודות`} tone="success">{current.explain}</Callout>
                            : <Callout title={`לא הפעם - התשובה הנכונה: ${current.type === 'tf' ? (current.answer ? 'נכון' : 'לא נכון') : current.type === 'table' ? current.rows.map((r, i) => `${r} - ${current.cols[current.correct[i]]}`).join(', ') : current.type === 'pick2' ? `כל 2 מבין: ${current.answers.join(', ')}` : current.answer}`} tone="warning">{current.explain}</Callout>}
                        <button className="file-button" onClick={next}>{qIndex + 1 < questions.length ? 'לשאלה הבאה' : 'סיום השלב'}</button>
                    </>}
                </Group>
            </>}

            {screen === 'done' && doneInfo && <>
                <Group label={`${pack.levels[level - 1].name} - סוף השלב`} heading>
                    <p className="done-stars" aria-label={`${doneInfo.stars} כוכבים`}>{'★'.repeat(doneInfo.stars)}{'☆'.repeat(3 - doneInfo.stars)}</p>
                    <Paragraph>השגת {doneInfo.points} נקודות בשלב הזה ({correctCount} מתוך {questions.filter(q => q.type !== 'reflect').length} נכונות). סך הכול: {totalPoints} נקודות.</Paragraph>
                    {doneInfo.newCostume && <Callout title="תלבושת חדשה נפתחה!" tone="success">קיבלת את {doneInfo.newCostume}. אפשר לראות אותה על הדמות במפה.</Callout>}
                    {doneInfo.stars === 0 && <Paragraph>שווה לנסות שוב - בכל תשובה מופיע הסבר שעוזר להתקדם.</Paragraph>}
                    <div className="done-actions">
                        {doneInfo.stars > 0 && level < pack.levels.length
                            ? <button className="file-button" onClick={() => startLevel(level + 1)}>לשלב הבא</button>
                            : null}
                        <button className="file-button is-compact" data-variant="secondary" onClick={() => setScreen('map')}>חזרה למפה</button>
                    </div>
                </Group>
            </>}

            <button className="file-button is-compact reset-game" data-variant="secondary" onClick={resetGame}>יציאה ואיפוס</button>
            <Closing>הנקודות וההתקדמות זמניות בלבד. יציאה ואיפוס, רענון או סגירת המשחק מתחילים משחק חדש מ-0. מעבר למפה אינו מאפס. לשחקן הבא באותו מסך לחצו יציאה ואיפוס.</Closing>
        </FileCard>
    </div>;
}
