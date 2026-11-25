import { motion } from "framer-motion";
import { ArrowUpRight, BookOpenCheck, Languages, Smartphone, Gamepad2 } from "lucide-react";
import { useI18n, type Key } from "../i18n";
import { projects } from "../data/projects";
import { EMAIL } from "../data/github";
import { scrollToId } from "../lib/util";
const ITEMS = [
  { n: 1, Icon: BookOpenCheck, ids: ["linkme"] },
  { n: 2, Icon: Languages, ids: ["firdaws", "linkme"] },
  { n: 3, Icon: Smartphone, ids: ["firdaws", "cheese", "lastthread"] },
  { n: 4, Icon: Gamepad2, ids: ["lastthread", "cheese"] },
] as const;
export function Services() {
  const { t, pick, lang } = useI18n();
  const open = (id: string) => {
    scrollToId("work");
    setTimeout(() => window.dispatchEvent(new CustomEvent("open-project", { detail: id })), 650);
  };
  const subject = encodeURIComponent(lang === "ar" ? "فكرة مشروع — من موقعك" : "Project idea — from your portfolio");
  const body = encodeURIComponent(
    lang === "ar"
      ? "أهلًا وليد،\n\nعندي فكرة مشروع:\n- النوع (تعليمي / تطبيق / لعبة):\n- الجمهور:\n- الميعاد المطلوب:\n\nشكرًا."
      : "Hi Walid,\n\nI have a project idea:\n- Type (learning / app / game):\n- Audience:\n- Timeline:\n\nThanks.",
  );
  return (
    <section id="services" className="services">
      <div className="wrap">
        <div className="kicker">{t("svc.kicker")}</div>
        <h2 className="h2">{t("svc.title")}</h2>
        <p className="lead">{t("svc.sub")}</p>
        <div className="svc-grid">
          {ITEMS.map(({ n, Icon, ids }, i) => (
            <motion.article
              key={n}
              className="svc"
              initial={{ opacity: 0, y: 36, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.8, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
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
          <a className="btn primary" href={`mailto:${EMAIL}?subject=${subject}&body=${body}`}>
            {t("svc.cta.btn")} <ArrowUpRight className="arr" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
