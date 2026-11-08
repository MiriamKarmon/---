import React, { useRef, useState } from 'react';

export type ComparisonId = 'offerings' | 'sin';
type Cell = string[] | null;
type Row = { name: string; cells: Cell[]; source?: string; url?: string; extraUrl?: string };
type TablePack = { title: string; columns: string[]; rows: Row[]; notes: string };
const V1 = 'https://www.mechon-mamre.org/i/t/k/k0301.htm';
const V2 = 'https://www.mechon-mamre.org/i/t/k/k0302.htm';
const V3 = 'https://www.mechon-mamre.org/i/t/k/k0303.htm';
const V4 = 'https://www.mechon-mamre.org/i/t/k/k0304.htm';
const V5 = 'https://www.mechon-mamre.org/i/t/k/k0305.htm';
const RASHI2 = 'https://he.wikisource.org/wiki/%D7%A8%D7%A9%22%D7%99_%D7%A2%D7%9C_%D7%95%D7%99%D7%A7%D7%A8%D7%90_%D7%91';
const TABLES: Record<ComparisonId, TablePack> = {
    offerings: {
        title: 'טבלת השוואה בין הקרבנות',
        columns: ['ממה מביאים', 'מין הקרבן', 'חובה או נדבה', 'בשל מה / מאפיין'],
        notes: 'הערה למבחן: בתא מין הקרבן של עולה משלימים "זכר". דין זה מתייחס לעולה מן הבהמה, ולא לעולה מן העוף. בטבלה כל סוג קרבן מופיע בשורה אחת; החומרים הם האפשרויות המותרות, ולא דרישה להביא את כולם יחד. במנחה, מנחת העומר היא מנחת החובה שבדף והיא מן השעורים; מנחות הנדבה כאן מסולת. בחטאת קבועה: כהן משיח והקהל מביאים בקר זכר, נשיא צאן זכר ואדם רגיל צאן נקבה. בעולה ויורד: בעל יכולת מביא כשבה או שעירת עזים (נקבה); אם אינו יכול, שני תורים או שני בני יונה; ואם אינו יכול גם זאת, עשירית האיפה סולת (צומח). מין העוף אינו נבחן כאן.',
        rows: [
            { name: 'קרבן עולה', cells: [['בקר', 'צאן', 'עוף'], ['זכר'], ['נדבה'], ['כליל למזבח (חוץ מהעור)']], source: 'ויקרא א, ג–יז; הסבר הנדבה והעור בדף', url: V1 },
            { name: 'קרבן מנחה', cells: [['סולת', 'שעורים'], ['צומח'], ['נדבה', 'חובה: מנחת העומר'], ['מנחת העומר: שעורים', 'מנחת נדבה: סולת, שמן זית ולבונה']], source: 'ויקרא ב, א; יד–טז; רש״י ב, א; יד', url: V2, extraUrl: RASHI2 },
            { name: 'קרבן שלמים', cells: [['בקר', 'צאן'], ['זכר', 'נקבה'], ['נדבה'], ['להודות ולשבח']], source: 'ויקרא ג, א–יב; סיבת ההודאה בדף', url: V3 },
            { name: 'חטאת קבועה', cells: [['בקר', 'צאן'], ['זכר', 'נקבה'], ['חובה'], ['לא תעשה בשוגג שזדונו כרת']], source: 'ויקרא ד, ג; יד; כג; כח; לב; תנאי כרת בדף', url: V4 },
            { name: 'קרבן עולה ויורד', cells: [['צאן', 'עוף', 'סולת'], ['נקבה', 'צומח'], ['חובה'], ['לפי המצב הכלכלי', 'בעופות: אחד לחטאת ואחד לעולה', 'בסולת: בלי שמן ובלי לבונה']], source: 'ויקרא ה, א–יג; מין העוף אינו נבחן כאן', url: V5 },
            { name: 'אשם מעילות', cells: [['איל מן הצאן'], ['זכר'], ['חובה'], ['הנאה מנכסי המקדש בשגגה']], source: 'ויקרא ה, טו–טז: איל תמים מן הצאן', url: V5 },
            { name: 'אשם תלוי', cells: [['איל מן הצאן'], ['זכר'], ['חובה'], ['ספק אם עבר עבירה', 'כפרה זמנית על הספק']], source: 'ויקרא ה, יז–יט; פירוש הספק והכפרה הזמנית בדף', url: V5 },
            { name: 'אשם גזילות', cells: [['איל מן הצאן'], ['זכר'], ['חובה'], ['גזל או עושק או כפירה בממון', 'שבועת שקר', 'השבת הממון']], source: 'ויקרא ה, כא–כו', url: V5 },
        ],
    },
    sin: {
        title: 'טבלת השוואה בין סוגי החטאת',
        columns: ['מיהו האדם / הגוף', 'ממה מקריבים', 'מין / צומח', 'מאפיין / מה מלמד המקור'],
        notes: 'הזיהוי כהן גדול, סנהדרין, מלך ועם הארץ נלמד מהדף ששלחת. סוג הבהמה והמין הושלמו מהפסוקים. "פר בן בקר" הוא זכר; בחטאת הנשיא כתוב זכר במפורש ובחטאת היחיד נקבה. עולה ויורד מופיע בשורה אחת; בעל יכולת מביא כשבה או שעירת עזים; אם אינו יכול, שני תורים או שני בני יונה; ואם אינו יכול גם זאת, עשירית האיפה סולת. בתא המין "בשה" מתייחס לבהמה, לא לעופות. מין העוף אינו נבחן כאן. אפשרויות כמו כשבה ושעירת עזים הן חלופות מותרות, לא דרישה להביא שתיהן.',
        rows: [
            { name: 'חטאת כהן משיח', cells: [['הכהן הגדול'], ['פר בן בקר'], ['זכר'], ['מובחר בחכמה ובהוראה', 'שליח ה׳']], source: 'ויקרא ד, ג; זיהוי ומאפייני הכהן הגדול בדף', url: V4 },
            { name: 'חטאת הקהל', cells: [['הסנהדרין'], ['פר בן בקר'], ['זכר'], ['עיני הקהל', 'מדריכים את ישראל בדרך התורה']], source: 'ויקרא ד, יג–טו; הזיהוי וההסבר בדף', url: V4 },
            { name: 'חטאת הנשיא', cells: [['המלך'], ['שעיר עזים'], ['זכר'], ['אשרי הדור שנשיאו מודה על האמת']], source: 'ויקרא ד, כב–כג; הזיהוי ודרשת אשרי בדף', url: V4 },
            { name: 'חטאת אדם רגיל', cells: [['כהן הדיוט', 'תלמיד חכם', 'אדם פשוט'], ['שעירת עזים', 'כשבה'], ['נקבה'], ['עם הארץ']], source: 'ויקרא ד, כז–כח; לב; זיהוי עם הארץ בדף', url: V4 },
            { name: 'חטאת עולה ויורד', cells: [['מי שחייב באחת העבירות המפורטות, לפי יכולתו הכלכלית'], ['כשבה', 'שעירת עזים', 'שני תורים או שני בני יונה', 'עשירית האיפה סולת'], ['בשה: נקבה', 'בסולת: צומח'], ['שבועת העדות', 'שבועת ביטוי', 'טומאת מקדש וקודשיו', 'בעופות: אחד לחטאת ואחד לעולה', 'בסולת: בלי שמן ובלי לבונה']], source: 'ויקרא ה, א–יג; סיכום העבירות בדף; מין העוף אינו נבחן כאן', url: V5 },
        ],
    },
};
const EXTRA_BANK = ['דבש', 'אזוב'];
const equal = (a: string[], b: string[]) => a.length === b.length && b.every(x => a.includes(x));

export function ComparisonGame({ id }: { id: ComparisonId }) {
    const pack = TABLES[id];
    const [values, setValues] = useState<Record<string, string[]>>({});
    const [checked, setChecked] = useState(false);
    const [bankColumn, setBankColumn] = useState(0);
    const [chosen, setChosen] = useState<string | null>(null);
    const [ghost, setGhost] = useState<{ word: string; x: number; y: number } | null>(null);
    const start = useRef<{ word: string; x: number; y: number; moved: boolean } | null>(null);
    const words = [...new Set(pack.rows.flatMap(r => r.cells[bankColumn] ?? []).concat(EXTRA_BANK))].sort((a,b)=>a.localeCompare(b,'he'));
    const put = (key: string, word: string) => {
        setValues(prev => ({ ...prev, [key]: (prev[key] ?? []).includes(word) ? prev[key] : [...(prev[key] ?? []), word] }));
        setChecked(false);
        setChosen(null);
    };
    const entries = pack.rows.flatMap((r, ri) => r.cells.flatMap((expected, ci) => expected ? [{ key: `${ri}:${ci}`, expected }] : []));
    const allCorrect = checked && entries.every(e => equal(values[e.key] ?? [], e.expected));
    return <div className="comparison-game" dir="rtl">
        <h2>{pack.title}</h2>
        <p>גררו מילים ממחסן המילים אל התאים. אפשר להכניס כמה מילים לתא, ולהשתמש שוב באותה מילה. אין רמז מראש לכמות התשובות. בודקים רק בלחיצה על בדיקה.</p>
        <p className="file-caption">בטלפון אפשר גם לגעת במילה ואז בתא. להסרת מילה מתא לחצו על × שלידה. בחרו קטגוריה כדי לראות את מחסן המילים שלה.</p>
        {id === 'offerings' && <p className="file-caption">הערה למבחן: "זכר" בקרבן עולה מתייחס לעולה מן הבהמה, ולא לעולה מן העוף.</p>}
        <div className="comparison-bank" aria-label="מחסן מילים לטבלה">
            <div className="comparison-tabs">{pack.columns.map((c, i) => <button key={c} className={i === bankColumn ? 'is-active' : ''} onClick={() => {setBankColumn(i);setChosen(null);}}>{c}</button>)}</div>
            <div className="comparison-words">{words.map(word => <button key={word} className={`table-word${chosen === word ? ' is-selected' : ''}`} aria-pressed={chosen === word}
                onPointerDown={e => { if(e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId);start.current = {word,x:e.clientX,y:e.clientY,moved:false}; }}
                onPointerMove={e => {const s=start.current;if(!s)return;if(Math.hypot(e.clientX-s.x,e.clientY-s.y)>7)s.moved=true;if(s.moved){setGhost({word:s.word,x:e.clientX,y:e.clientY});}}}
                onPointerUp={e => {const s=start.current;start.current=null;setGhost(null);if(!s)return;if(s.moved){const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-table-cell]');const key=el?.getAttribute('data-table-cell');if(key)put(key,s.word);}else setChosen(chosen===s.word?null:s.word);}}
                onPointerCancel={() => {start.current=null;setGhost(null);}}
                onClick={e=>{if(e.detail===0)setChosen(chosen===word?null:word);}}
            >{word}</button>)}</div>
            <p className="comparison-bank-hint" aria-live="polite">{chosen ? `נבחרה: ${chosen}. געו בתא כדי להוסיף.` : 'בחרו מילה או גררו אותה אל תא בטבלה.'}</p>
        </div>
        <div className="comparison-grid" role="table" aria-label={pack.title}>
            <div className="comparison-grid-head" role="row"><strong role="columnheader">הקרבן</strong>{pack.columns.map(c=><strong role="columnheader" key={c}>{c}</strong>)}</div>
            {pack.rows.map((row,ri)=><div className="comparison-grid-row" role="row" key={row.name}>
                <h3 role="rowheader">{row.name}{row.source && <small className="comparison-row-source"><a href={row.url} target="_blank" rel="noreferrer">{row.source}</a>{row.extraUrl && <a href={row.extraUrl} target="_blank" rel="noreferrer">פירוש / הלכה</a>}</small>}</h3>
                {row.cells.map((expected,ci)=>{const key=`${ri}:${ci}`,selected=values[key]??[];const ok=expected && equal(selected,expected);return <div role="cell" key={ci} className={`comparison-cell${expected ? '' : ' is-unavailable'}${checked && expected ? ok?' is-correct':' is-wrong':''}`}>
                    <span className="comparison-mobile-label">{pack.columns[ci]}</span>
                    {expected ? <div className="comparison-drop" data-table-cell={key} role="button" tabIndex={0} aria-label={`${row.name}: ${pack.columns[ci]}`}
                        onClick={e=>{if(chosen && !(e.target as HTMLElement).closest('.remove-table-word'))put(key,chosen);}}
                        onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&chosen){e.preventDefault();put(key,chosen);}}}>
                        {selected.length ? selected.map(word=><span className="placed-word" key={word}>{word}<button className="remove-table-word" aria-label={`הסרת ${word} מתוך ${row.name}: ${pack.columns[ci]}`} onClick={e=>{e.stopPropagation();setValues(v=>({...v,[key]:(v[key]??[]).filter(x=>x!==word)}));setChecked(false);}}>×</button></span>) : <span className="drop-label">הוסיפו מילים כאן</span>}
                    </div> : <span>לא נבחן בתא זה</span>}
                    {checked && expected && <p className="table-cell-feedback">{ok ? '✓ נכון' : `עדיין לא. לפי הדף: ${expected.join(' · ')}`}</p>}
                </div>})}
            </div>)}
        </div>
        <button className="file-button" onClick={()=>setChecked(true)}>בדיקת הטבלה</button>
        {checked && <p className={`table-result${allCorrect?' is-correct':''}`} role="status">{allCorrect ? 'כל התאים להשלמה נכונים! כל הכבוד!' : 'בדקו את התאים המסומנים. אפשר לתקן ולבדוק שוב.'}</p>}
        <p className="file-caption">{pack.notes}</p>
        <p className="file-caption">הטבלה היא תרגול נוסף, ללא שינוי בנקודות של ארבעת השלבים.</p>
        {ghost && <div className="table-drag-ghost" style={{left:ghost.x,top:ghost.y}}>{ghost.word}</div>}
    </div>;
}
