# Phase 2 Agents — Archived

הסוכנים בתיקייה הזו אורכבו ב-2026-05-26 לאחר שהתברר שלא הופעלו בעבודת ה-MVP בפועל.

## הסוכנים בארכיון

| Agent | Phase | מתי להחזיר |
|-------|-------|-----------|
| `integrations-engineer.md` | P2+ | כשמתחילים אינטגרציה חיצונית רצינית (PayPlus production, Mailgun/Twilio, EasyShop API) |
| `mobile-engineer.md` | P2 | כשמתחילים לפתח אפליקציית שליחים (Expo/React Native) |
| `ai-ml-engineer.md` | P2-P3 | כשמתחילים פיצ'רי AI (churn prediction, אזילת מזון rule→ML, embeddings) |
| `conversational-designer.md` | P2 | כשמתחילים לבנות זרימות WhatsApp/SMS multi-turn או chatbot |

## איך מחזירים סוכן לפעילות

```bash
git mv agents/_archive/phase-2/<agent>.md agents/disciplines/<agent>.md
# או ל-domain-experts/ עבור conversational-designer
```

ואז:
1. עדכן את `CLAUDE.md` (ספירת disciplines/domain-experts)
2. עדכן את `agents/README.md` (אותה ספירה)
3. עדכן את ה-`activates_when` של הסוכן אם השתנו תנאי ההפעלה

## למה לא נמחקו?

המידע, ההקשר וההחלטות שתועדו בקבצים האלה רלוונטיים כשנגיע ל-Phase 2. מחיקה הייתה הופכת חזרה לכתיבה מחדש.
