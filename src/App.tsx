import React, { useState } from 'react';
import { Callout, Caption, Closing, FileCard, Group, Header, Paragraph, Photos, useLocalState } from './ui';
import { vayikraPack as pack, TYPE_LABELS, qPoints, type Q } from './packs';
import hero from './photos/mishkan-hero.png';

function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

const COSTUMES = [
    { points: 30, emoji: '馃帺', name: '讻讜讘注 拽讜住诐' },
    { points: 80, emoji: '馃', name: '讞讙讜专转 讛专驻转拽谉' },
    { points: 150, emoji: '馃憫', name: '讻转专 讝讛讘' },
];
function unlockedCostumes(points: number) { return COSTUMES.filter(c => points >= c.points); }

type Screen = 'home' | 'map' | 'level' | 'done';

export function App() {
    const [totalPoints, setTotalPoints, pointsSaved] = useLocalState<number>('torah-game.points.v2', 0);
    const [stars, setStars, starsSaved] = useLocalState<Record<string, number>>('torah-game.stars.v2', {});
    const storageReady = pointsSaved.ready && starsSaved.ready;

    const [screen, setScreen] = useState<Screen>('home');
    const [level, setLevel] = useState(1);
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
            : current.type === 'tf' ? (choice === '谞讻讜谉') === current.answer
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
            if (storageReady) {
                setTotalPoints(afterPoints);
                if (newStars > (stars[starKey(level)] || 0)) setStars({ ...stars, [starKey(level)]: newStars });
            }
            setDoneInfo({ stars: newStars, points: earnedPoints, newCostume });
            setScreen('done');
        }
    };

    const costumeBadges = unlockedCostumes(totalPoints);
    const avatar = <span className="avatar" aria-label="讛讚诪讜转 砖诇讱">
        <span className="avatar-face">馃</span>
        {costumeBadges.map(c => <span key={c.name} className="avatar-item" title={c.name}>{c.emoji}</span>)}
    </span>;

    return <div dir="rtl" lang="he">
        <FileCard>
            <Header
                title="驻专砖转 讜讬拽专讗: 诪砖讞拽 讞讝专讛"
                fact="讚诪讜 专讗砖讜谉, 谞讘谞讛 诪讚祝 讛诇讬诪讜讚 砖砖诇讞转"
                intro="讻诇 讛砖讗诇讜转 讻讗谉 谞讘谞讜 诪讚祝 讛讞讝专讛 注诇 驻专砖转 讜讬拽专讗 砖砖诇讞转 讘爪'讗讟, 讘住讜讙讬 讛转专讙讬诇讬诐 砖讘讚祝: 砖讗诇讜转 讗诪专讬拽讗讬讜转, 谞讻讜谉 讗讜 诇讗 谞讻讜谉, 讛拽驻转 讬讜爪讗 讚讜驻谉, 讛砖诇诪讛 注诐 诪讞住谉 诪讬诇讬诐, 讟讘诇转 讛砖讜讜讗讛 讜砖讗诇讜转 专砖讜转 诇讘讜谞讜住. 注讜讘专讬诐 砖诇讘讬诐 讘注讜诇诐 讛拽专讘谞讜转, 爪讜讘专讬诐 谞拽讜讚讜转 讜驻讜转讞讬诐 转诇讘讜砖讜转 - 讜讻诇 转砖讜讘讛 诪诇讜讜讛 讘讛住讘专 诪讛讞讜诪专."
            />

            {screen === 'home' && <>
                <Photos label={pack.worldName} items={[{ src: hero, alt: '讗讬讜专 砖诇 砖讘讬诇 讗讘谞讬诐 讘诪讚讘专 讛诪讜讘讬诇 讗诇 讛诪砖讻谉' }]} />
                <Caption>讗讬讜专 诇讛诪讞砖转 讛讗讜讜讬专讛 讘诇讘讚.</Caption>
                <Group label={pack.worldName} heading>
                    <Paragraph>{pack.levels.length} 砖诇讘讬诐 砖诪讻住讬诐 讗转 讻诇 砖讗诇讜转 讛讚祝: 注讜诇讛 讜诪谞讞讛, 砖诇诪讬诐, 讞讟讗转 讜住讜讙讬讛, 注讜诇讛 讜讬讜专讚, 讛讗砖诪讜转 讜砖诇讘讬 讛讛拽专讘讛 - 讻讚讬 诇讛讻讬专 讗转 讛讛讘讚诇讬诐 讘讬谉 讻诇 讛拽专讘谞讜转.</Paragraph>
                    <button className="file-button" disabled={!storageReady} onClick={() => setScreen('map')}>诪转讞讬诇讬诐 诇砖讞拽</button>
                    <Caption>{pointsSaved.message || starsSaved.message}</Caption>
                </Group>
                <Group label="讛讚诪讜转 砖诇讱">
                    <div className="avatar-row">{avatar}<span className="points-pill">猸?{totalPoints} 谞拽讜讚讜转</span></div>
                    <Paragraph>爪讜讘专讬诐 谞拽讜讚讜转 注诇 转砖讜讘讜转 谞讻讜谞讜转 讜驻讜转讞讬诐 转诇讘讜砖讜转: {COSTUMES.map(c => `${c.name} 讘-${c.points} 谞拽讜讚讜转`).join(', ')}. 砖讗诇讜转 专砖讜转 谞讜转谞讜转 讘讜谞讜住 讻驻讜诇.</Paragraph>
                </Group>
                <Group label="讗讬讱 讛讚诪讜 注讜讘讚">
                    <Callout title="讚祝 诇讬诪讜讚 谞讻谞住, 诪砖讞拽 讬讜爪讗" tone="success">讛讝专讬诪讛 讘讚诪讜: 砖讜诇讞讬诐 讚祝 诇诪讬讚讛 讘爪'讗讟, 讜讛诪砖讞拽 诪转注讚讻谉 讘砖讗诇讜转 砖谞讘谞讜转 诪讛讚祝 - 讻诪讜 砖讛诪砖讞拽 讛讝讛 谞讘谞讛 诪讚祝 讛拽专讘谞讜转 砖诇讱.</Callout>
                    <Callout title="诪讛 注讜讚 诇讗 讘讚诪讜" tone="warning">讛注诇讗转 讚祝 诪转讜讱 讛诪砖讞拽 注爪诪讜 讜讛驻拽转 砖讗诇讜转 讗讜讟讜诪讟讬转 注讜讚 诇讗 诪讬讜砖诪讜转 讻讗谉. 讙诐 讛讛转讗诪讛 讛诪诇讗讛 诇讙讬诇讗讬 3鈥?7 讛讬讗 讛讬注讚 诇讛诪砖讱 - 讛讚诪讜 讛讝讛 诪讜转讗诐 诇讞讜诪专 讛住驻爪讬驻讬 砖砖诇讞转.</Callout>
                    <Paragraph>讘转讜讻谞讬转 讛诪诇讗讛: 讞讜诪专讬 诇讬诪讜讚 诪讛诪讜专讬诐, 讞砖讘讜谉 诪讛讬住讜讚 注讚 诪转拽讚诐 讜讞砖讬讘讛, 住专讟讜谞讬 讛住讘专, 注讜诇诪讜转 谞讜住驻讬诐 注诐 诪砖讞拽讬诐 砖讜谞讬诐, 专诪讜转 讜注讜讚 转诇讘讜砖讜转.</Paragraph>
                </Group>
            </>}

            {screen === 'map' && <>
                <Group label={pack.worldName} heading>
                    <div className="avatar-row">{avatar}<span className="points-pill">猸?{totalPoints} 谞拽讜讚讜转</span></div>
                    <div className="level-path">
                        {pack.levels.map(lv => {
                            const earned = stars[starKey(lv.id)] || 0;
                            const locked = lv.id > 1 && !(stars[starKey(lv.id - 1)] > 0);
                            return <button key={lv.id} className={`level-node${locked ? ' is-locked' : ''}`} disabled={locked}
                                onClick={() => startLevel(lv.id)}>
                                <span className="level-icon">{locked ? '馃敀' : lv.icon}</span>
                                <span className="level-name">{lv.name}</span>
                                <span className="level-stars">{'鈽?.repeat(earned)}{'鈽?.repeat(3 - earned)}</span>
                            </button>;
                        })}
                    </div>
                    <button className="file-button is-compact" data-variant="secondary" onClick={() => setScreen('home')}>讞讝专讛</button>
                </Group>
            </>}

            {screen === 'level' && current && <>
                <Group label={`${pack.levels[level - 1].name} - 砖讗诇讛 ${qIndex + 1} 诪转讜讱 ${questions.length}`} heading>
                    <div className="q-progress"><div className="q-progress-fill" style={{ width: `${(qIndex / questions.length) * 100}%` }} /></div>
                    <p className="q-type-label">{current.type === 'reflect' ? `砖讗诇转 专砖讜转 - 讘讜谞讜住 讛砖转转驻讜转 +${qPoints(current)}` : current.bonus ? `砖讗诇转 专砖讜转 - 讘讜谞讜住 +${qPoints(current)}` : TYPE_LABELS[current.type]}</p>

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
                        {(['谞讻讜谉', '诇讗 谞讻讜谉'] as const).map(label => {
                            let cls = 'choice-button';
                            if (submitted) {
                                if ((label === '谞讻讜谉') === current.answer) cls += ' is-correct';
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
                        {!submitted && <button className="file-button" disabled={pick2Sel.length !== 2} onClick={checkPick2}>讘讚讬拽讛</button>}
                    </>}

                    {current.type === 'cloze' && <>
                        <div className="bank-row">
                            {current.bank.map(word => {
                                let cls = 'bank-chip';
                                if (submitted && word === current.answer) cls += ' is-correct';
                                else if (submitted && word === clozeSel) cls += ' is-wrong';
                                else if (word === clozeSel) cls += ' is-chosen';
                                return <button key={word} className={cls} disabled={submitted} onClick={() => setClozeSel(word)}>{word}</button>;
                            })}
                        </div>
                        {!submitted && <button className="file-button" disabled={!clozeSel} onClick={checkCloze}>讘讚讬拽讛</button>}
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
                                        aria-label={`${row}: ${col}`}>{tableSel[ri] === ci ? '鉁? : ''}</button>;
                                })}
                            </div>)}
                        </div>
                        {!submitted && <button className="file-button" disabled={tableSel.length === 0 || tableSel.some(s => s === null)} onClick={checkTable}>讘讚讬拽讛</button>}
                    </>}

                    {submitted && <>
                        {current.type === 'reflect'
                            ? <Callout title={`转讜讚讛 砖砖讬转驻转! +${qPoints(current)} 谞拽讜讚讜转`} tone="success">{current.explain}</Callout>
                            : wasCorrect
                            ? <Callout title={`谞讻讜谉! +${qPoints(current)} 谞拽讜讚讜转`} tone="success">{current.explain}</Callout>
                            : <Callout title={`诇讗 讛驻注诐 - 讛转砖讜讘讛 讛谞讻讜谞讛: ${current.type === 'tf' ? (current.answer ? '谞讻讜谉' : '诇讗 谞讻讜谉') : current.type === 'table' ? current.rows.map((r, i) => `${r} - ${current.cols[current.correct[i]]}`).join(', ') : current.type === 'pick2' ? `讻诇 2 诪讘讬谉: ${current.answers.join(', ')}` : (current.type === 'reflect' ? '' : current.answer)}`} tone="warning">{current.explain}</Callout>}
                        <button className="file-button" onClick={next}>{qIndex + 1 < questions.length ? '诇砖讗诇讛 讛讘讗讛' : '住讬讜诐 讛砖诇讘'}</button>
                    </>}
                </Group>
            </>}

            {screen === 'done' && doneInfo && <>
                <Group label={`${pack.levels[level - 1].name} - 住讜祝 讛砖诇讘`} heading>
                    <p className="done-stars" aria-label={`${doneInfo.stars} 讻讜讻讘讬诐`}>{'鈽?.repeat(doneInfo.stars)}{'鈽?.repeat(3 - doneInfo.stars)}</p>
                    <Paragraph>讛砖讙转 {doneInfo.points} 谞拽讜讚讜转 讘砖诇讘 讛讝讛 ({correctCount} 诪转讜讱 {questions.filter(q => q.type !== 'reflect').length} 谞讻讜谞讜转). 住讱 讛讻讜诇: {totalPoints} 谞拽讜讚讜转.</Paragraph>
                    {doneInfo.newCostume && <Callout title="转诇讘讜砖转 讞讚砖讛 谞驻转讞讛!" tone="success">拽讬讘诇转 讗转 {doneInfo.newCostume}. 讗驻砖专 诇专讗讜转 讗讜转讛 注诇 讛讚诪讜转 讘诪驻讛.</Callout>}
                    {doneInfo.stars === 0 && <Paragraph>砖讜讜讛 诇谞住讜转 砖讜讘 - 讘讻诇 转砖讜讘讛 诪讜驻讬注 讛住讘专 砖注讜讝专 诇讛转拽讚诐.</Paragraph>}
                    <div className="done-actions">
                        {doneInfo.stars > 0 && level < pack.levels.length
                            ? <button className="file-button" onClick={() => startLevel(level + 1)}>诇砖诇讘 讛讘讗</button>
                            : null}
                        <button className="file-button is-compact" data-variant="secondary" onClick={() => setScreen('map')}>讞讝专讛 诇诪驻讛</button>
                    </div>
                </Group>
            </>}

            <Closing>讚诪讜 驻专讟讬 - 讛讛转拽讚诪讜转 谞砖诪专转 专拽 讘诪讻砖讬专 讛讝讛. 专讜爪讬诐 诪砖讞拽 诪讚祝 讗讞专? 砖讜诇讞讬诐 讚祝 谞讜住祝 讘爪'讗讟.</Closing>
        </FileCard>
    </div>;
}
