import { motion } from "framer-motion";
import { ArrowUpRight, Code2, Server, Smartphone, Languages, Sparkles, ShieldCheck, Briefcase } from "lucide-react";
import { useI18n, type Key } from "../i18n";
import { projects } from "../data/projects";
import { EMAIL } from "../data/github";
import { scrollToId } from "../lib/util";
const ITEMS = [
  { n: 1, Icon: Code2, ids: ["linkme", "cheese", "fit"] },
  { n: 2, Icon: Server, ids: ["linkme", "ludo"] },
  { n: 3, Icon: Smartphone, ids: ["firdaws", "lastthread", "arcade"] },
  { n: 4, Icon: Languages, ids: ["firdaws", "lastthread", "crime"] },
  { n: 5, Icon: Sparkles, ids: ["lastthread", "arcade", "journal"] },
  { n: 6, Icon: ShieldCheck, ids: ["lastthread", "firdaws", "linkme"] },
] as const;
export function Services() {
  const { t, pick, lang } = useI18n();
  const open = (id: string) => {
    scrollToId("work");
    setTimeout(() => window.dispatchEvent(new CustomEvent("open-project", { detail: id })), 650);
  };
  const ar = lang === "ar";
  const role = `mailto:${EMAIL}?subject=${encodeURIComponent(ar ? "فرصة عمل لوليد سيد — [المسمى الوظيفي]" : "Opportunity for Walid Sayed — [Role]")}&body=${encodeURIComponent(
    ar
      ? "مرحبًا وليد،\n\nنود التحدث معك بخصوص وظيفة:\n- الشركة:\n- المسمى الوظيفي:\n- المكان / عن بُعد:\n- الخطوة التالية:\n\nمع التحية،"
      : "Hi Walid,\n\nWe'd like to talk to you about a role:\n- Company:\n- Role:\n- Location / remote:\n- Next step:\n\nBest regards,",
  )}`;
  const free = `mailto:${EMAIL}?subject=${encodeURIComponent(ar ? "مشروع حر — من موقعك" : "Freelance project — from your portfolio")}&body=${encodeURIComponent(
    ar
      ? "مرحبًا وليد،\n\nعندي مشروع:\n- النوع (ويب / موبايل / لعبة):\n- الهدف:\n- الموعد المطلوب:\n- الميزانية التقريبية:\n\nشكرًا."
      : "Hi Walid,\n\nI have a project:\n- Type (web / mobile / game):\n- Goal:\n- Timeline:\n- Budget range:\n\nThanks.",
  )}`;
  return (
    <section id="services" className="services">
      <div className="wrap">
        <div className="kicker">{t("svc.kicker")}</div>
        <h2 className="h2">{t("svc.title")}</h2>
        <p className="lead">{t("svc.sub")}</p>
        <div className="svc-grid six">
          {ITEMS.map(({ n, Icon, ids }, i) => (
            <motion.article
              key={n}
              className="svc"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="svc-top">
                <span className="svc-ic">
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <span className="svc-n mono">0{n}</span>
              </div>
              <h3>{t(`svc.${n}` as Key)}</h3>
              <p>{t(`svc.${n}d` as Key)}</p>
              <div className="svc-proof">
                <small>{t("svc.proof")}</small>
                {ids.map((id) => {
                  const p = projects.find((x) => x.id === id)!;
                  return (
                    <button key={id} onClick={() => open(id)}>
                      {pick(p.name)}
                    </button>
                  );
                })}
              </div>
            </motion.article>
          ))}
        </div>
        <motion.div className="svc-cta" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span>{t("svc.cta")}</span>
          <div className="svc-cta-btns">
            <a className="btn primary" href={role}>
              <Briefcase size={16} /> {t("svc.cta.btn")} <ArrowUpRight className="arr" />
            </a>
            <a className="btn ghost" href={free}>
              {t("svc.cta.free")}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
