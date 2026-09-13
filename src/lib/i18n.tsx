import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Language = "en" | "ar";
const words = {
  en: { dashboard:"Dashboard", transactions:"Transactions", accounts:"Accounts", budgets:"Budgets", goals:"Goals & Debts", bills:"Bills & Recurring", reports:"Reports", settings:"Settings", quickAdd:"Quick add", notifications:"Notifications", available:"Available money", netWorth:"Net worth", income:"Income", expenses:"Expenses", recent:"Recent transactions", upcoming:"Upcoming bills", save:"Save", cancel:"Cancel", noData:"Nothing here yet", signOut:"Sign out" },
  ar: { dashboard:"لوحة التحكم", transactions:"المعاملات", accounts:"الحسابات", budgets:"الميزانيات", goals:"الأهداف والديون", bills:"الفواتير والمتكرر", reports:"التقارير", settings:"الإعدادات", quickAdd:"إضافة سريعة", notifications:"الإشعارات", available:"الأموال المتاحة", netWorth:"صافي الثروة", income:"الدخل", expenses:"المصروفات", recent:"أحدث المعاملات", upcoming:"الفواتير القادمة", save:"حفظ", cancel:"إلغاء", noData:"لا توجد بيانات بعد", signOut:"تسجيل الخروج" },
} as const;
type Key = keyof typeof words.en;
const I18nContext = createContext({ language: "en" as Language, setLanguage: (_: Language) => {}, t: (key: Key) => words.en[key] as string });
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => typeof localStorage === "undefined" ? "en" : (localStorage.getItem("managili-language") === "ar" ? "ar" : "en"));
  useEffect(() => { localStorage.setItem("managili-language", language); document.documentElement.lang = language; document.documentElement.dir = language === "ar" ? "rtl" : "ltr"; }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: Key) => words[language][key] }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export const useI18n = () => useContext(I18nContext);
