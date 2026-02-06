import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is DexSeer Alpha?",
    answer:
      "DexSeer Alpha is a powerful trading platform designed to make finding crypto trading opportunities simple and efficient. We provide real-time market screening, pattern detection, and alerts to help traders identify the best entry and exit points. Our intuitive interface combines advanced analytics with ease of use, making professional-grade trading tools accessible to everyone.",
  },
  {
    question: "Who are we?",
    answer:
      "We are a team of experienced traders and crypto professionals who understand the challenges of navigating volatile markets. Our mission is to provide traders with the tools and insights needed to make informed decisions. Built by traders, for traders, DexSeer Alpha reflects our deep understanding of what works in real-world trading scenarios.",
  },
  {
    question: "How are alerts created?",
    answer:
      "Our alerts are generated using a proprietary algorithm that detects market patterns in real-time. The system continuously analyzes price action, volume, and other key indicators across multiple timeframes to identify potential trading opportunities. When a pattern matches our detection criteria, an alert is automatically generated and displayed in your dashboard, giving you instant visibility into market movements.",
  },
  {
    question: "What if I want a feature?",
    answer:
      "We're always looking to improve DexSeer Alpha based on user feedback. If you have a feature request or suggestion, please contact us. We value input from our community and regularly incorporate user suggestions into our development roadmap. Your feedback helps us build a better platform for everyone.",
  },
];

export function FaqAccordion() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqData.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
