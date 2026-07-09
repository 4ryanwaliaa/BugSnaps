import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/sections/hero";
import { Explainer } from "@/components/sections/explainer";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { ReportPreview } from "@/components/sections/report-preview";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[60] focus-visible:rounded-full focus-visible:bg-primary focus-visible:px-5 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Explainer />
        <Services />
        <Process />
        <ReportPreview />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
