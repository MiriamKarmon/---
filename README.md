# פרשת ויקרא: משחק חזרה - קוד המשחק

משחק חזרה בעברית לילדים, שנבנה מדף הלימוד "שאלות חזרה פרשת ויקרא".
ארבעה שלבים בעולם הקרבנות, 48 שאלות בששה סוגי תרגילים (שאלות אמריקאיות,
נכון/לא נכון, הקפת יוצא דופן, השלמה עם מחסן מילים, טבלת השוואה ושאלות
רשות לבונוס), הסבר לכל תשובה, נקודות, כוכבים ותלבושות לדמות.

## דרישות

- Node.js גרסה 18 ומעלה (כולל npm)

## הרצה במחשב

```bash
npm install
npm run dev
```

ואז פותחים בדפדפן את הכתובת שמופיעה (בדרך כלל http://localhost:5173).

## בניית גרסה סטטית להעלאה לאתר

```bash
npm run build
```

התוצרים נוצרים בתיקיית `dist/` - אפשר להעלות אותם לכל אירוח סטטי.
לצפייה מקומית בתוצרים: `npm run preview`.

## מבנה הקוד

| קובץ | מה יש בו |
| --- | --- |
| `src/packs.ts` | כל תוכן המשחק: רשימת השלבים וכל השאלות, התשובות וההסברים, מחולקות לפי שלבים |
| `src/App.tsx` | לוגיקת המשחק: מסכים (בית, מפה, שאלה, סוף שלב), ניקוד, כוכבים, תלבושות |
| `src/ui.tsx` | רכיבי תצוגה בסיסיים (כרטיס, כותרת, קבוצה, הסבר מודגש) ושמירת התקדמות ב-localStorage של הדפדפן |
| `src/style.css` | כל העיצוב |
| `src/photos/mishkan-hero.png` | איור הפתיחה |

## עריכת שאלות

כל השאלות מרוכזות ב-`src/packs.ts` תחת `QUESTIONS`, מחולקות לפי מספר שלב
(1 עד 4). כל שאלה היא אובייקט אחד לפי הסוג:

- `mc(שאלה, תשובה נכונה, [מסיחים], הסבר)` - שאלה אמריקאית. פרמטר חמישי
  אופציונלי `true` הופך אותה לשאלת רשות שווה בונוס כפול (20 נקודות).
- `tf(משפט, true/false, הסבר)` - נכון או לא נכון.
- `odd(שאלה, [פריטים], הפריט יוצא הדופן, הסבר)` - הקפת יוצא דופן.
- `cloze(טקסט לפני החסר, טקסט אחרי, [מחסן מילים], המילה הנכונה, הסבר)` - השלמה.
- `table(שאלה, [שורות], [עמודות], [אינדקס נכון לכל שורה], הסבר)` - טבלת השוואה.
- `pick2(שאלה, [אפשרויות], [כל התשובות הנכונות], הסבר)` - בחירת 2 תשובות
  נכונות מתוך הרשימה.
- שאלת רשות להשתתפות (reflection) מוגדרת ישירות כאובייקט
  `{ type: 'reflect', q, choices, explain }` - כל בחירה מקבלת, בלי ציון נכון/לא נכון.

אחרי עריכה מריצים שוב `npm run dev` או `npm run build`.

## שמירת התקדמות

הניקוד והכוכבים נשמרים ב-localStorage של הדפדפן במכשיר שמשחקים בו
(מפתחות `torah-game.points.v2` ו-`torah-game.stars.v2`). אין שרת ואין
חשבון משתמש; ניקוי נתוני הדפדפן מאפס את ההתקדמות.

## פרסום המשחק עם קישור פתוח (GitHub Pages)

גיטהאב שומר את הקוד; כדי שאנשים יוכלו לשחק צריך גם אירוח (hosting).
GitHub Pages נותן את שניהם יחד, והוא זמין בתוכנית החינמית של גיטהאב
כאשר המאגר ציבורי - כך כתוב בתיעוד הרשמי (הקישורים למטה).

לשים לב לפרטיות: מאגר ציבורי פירושו שהקוד ותוכן השאלות גלויים לכל אחד
באינטרנט, ואתר GitHub Pages פתוח לכל בעל הקישור, בלי התחברות. אם לא
מתאים שהקוד יהיה גלוי, אפשר במקום זאת לארח ב-Netlify עם מאגר פרטי;
גם אז המשחק עצמו פתוח לכל מי שמקבל את הקישור.

צעדים:

1. נרשמים או מתחברים ב-github.com ויוצרים מאגר חדש (New repository),
   ציבורי (Public).
2. במאגר: Settings ← Pages, ותחת Build and deployment ← Source בוחרים
   GitHub Actions. לפי התיעוד הרשמי צריך לאפשר את זה כדי שהפרסום
   האוטומטי יעבוד.
3. מעלים את הקבצים: Add file ← Upload files וגוררים את תוכן התיקייה
   מה-ZIP. אחרי ההעלאה בודקים שברשימת הקבצים מופיעה התיקייה `.github` -
   היא זו שמפעילה את הפרסום האוטומטי. אם היא לא מופיעה, יוצרים אותה
   ידנית: Add file ← Create new file, בשם הקובץ כותבים
   `.github/workflows/deploy.yml` ומדביקים את התוכן שבסוף המדריך.
4. ההעלאה מפעילה בנייה אוטומטית. בלשונית Actions אפשר לעקוב אחרי
   ההתקדמות, וכשהיא מסתיימת מופיעה שם הכתובת של המשחק (בדרך כלל
   https://<שם-המשתמש>.github.io/<שם-המאגר>/). אם הבנייה רצה לפני
   שבוצע שלב 2 והאתר עדיין לא באוויר, נכנסים ללשונית Actions, בוחרים
   את הריצה ומפעילים Re-run jobs.

מקורות רשמיים של גיטהאב:

- GitHub Pages זמין במאגר ציבורי בתוכנית החינמית, ובמאגר פרטי רק
  בתוכניות בתשלום:
  https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- אתרי GitHub Pages פתוחים לכולם באינטרנט, גם כשהמאגר פרטי:
  https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- הפעלת פרסום דרך GitHub Actions:
  https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- העלאת קבצים דרך הדפדפן:
  https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

### תוכן הקובץ .github/workflows/deploy.yml (אם צריך ליצור ידנית)

```yaml
name: Publish the game to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
