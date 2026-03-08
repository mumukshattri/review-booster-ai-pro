import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the free trial work?",
    a: "You get 14 days of full access to your chosen plan — no credit card required. At the end of the trial, you can upgrade to keep your data and settings, or your account will simply pause.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time from your dashboard. Changes take effect immediately, and we'll prorate the difference.",
  },
  {
    q: "What happens if I hit my monthly request limit?",
    a: "We'll notify you when you're close. You can upgrade your plan instantly to unlock more requests, or wait until your limit resets at the start of the next billing cycle.",
  },
  {
    q: "How does annual billing work?",
    a: "When you choose annual billing, you pay for 12 months upfront and save 20% compared to monthly pricing. You can cancel anytime and keep access until the end of your billing period.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — no contracts, no cancellation fees. Cancel from your dashboard in one click. You'll retain access until the end of your current billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a full refund within the first 7 days of any paid subscription if you're not satisfied. After that, you can cancel to prevent future charges.",
  },
];

interface FAQSectionProps {
  dur: number;
  ease: [number, number, number, number];
}

export function FAQSection({ dur, ease }: FAQSectionProps) {
  return (
    <section className="container mx-auto px-4 pb-16 sm:pb-28 relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: dur * 2, ease }}
        className="text-2xl sm:text-3xl md:text-5xl font-black text-center mb-3 sm:mb-4 tracking-tight"
      >
        Frequently Asked Questions
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ delay: 0.05, duration: dur * 2, ease }}
        className="text-muted-foreground text-center mb-12 sm:mb-16 max-w-xl mx-auto"
      >
        Everything you need to know about ReviewBoost.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: dur * 2.5, ease }}
        className="max-w-2xl mx-auto"
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-card border-border/20 px-6 rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground/90 hover:text-foreground py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
