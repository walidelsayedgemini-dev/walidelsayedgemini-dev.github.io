import { motion } from "framer-motion";
import { useI18n } from "../i18n";
import { extra, hasJourney } from "../data/extra";

const rise = (d = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8%" },
  transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function Journey() {
  const { t, pick } = useI18n();
  if (!hasJourney) return null;
  const col = (title: string, list: typeof extra.education) =>
    list.length > 0 && (
      <div className="jr-col">
        <h3>{title}</h3>
        <ol>
          {list.map((e, i) => (
            <motion.li key={i} {...rise(i * 0.08)}>
              <span className="jr-period ltr">{pick(e.period)}</span>
              <b>{pick(e.title)}</b>
              <span>{pick(e.place)}</span>
              {e.note && <p>{pick(e.note)}</p>}
            </motion.li>
          ))}
        </ol>
      </div>
    );
  return (
    <section className="journey" id="journey">
      <div className="wrap">
        <motion.div className="kicker" {...rise()}>
          {t("journey.kicker")}
        </motion.div>
        <motion.h2 className="h2" {...rise(0.05)}>
          {t("journey.title")}
        </motion.h2>
        <div className="jr-grid">
          {col(t("journey.edu"), extra.education)}
          {col(t("journey.exp"), extra.experience)}
        </div>
        {extra.testimonials.length > 0 && (
          <>
            <h3 className="jr-say">{t("journey.say")}</h3>
            <div className="jr-quotes">
              {extra.testimonials.map((q, i) => (
                <motion.blockquote key={i} {...rise(i * 0.08)}>
                  <p>{pick(q.text)}</p>
                  <footer>
                    <b>{pick(q.name)}</b>
                    {q.role && <span> · {pick(q.role)}</span>}
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
