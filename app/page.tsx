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
