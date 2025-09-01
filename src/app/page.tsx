import { HeroSection } from "@/components/hero-section"
import { DashboardPreview } from "@/components/dashboard-preview"
import { BentoSection } from "@/components/bento-section"
import { LargeTestimonial } from "@/components/large-testimonial"
import { PricingSection } from "@/components/pricing-section"
import { TestimonialGridSection } from "@/components/testimonial-grid-section"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { AnimatedSection } from "@/components/animated-section"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <div className="relative z-10">
        <main className="w-full mx-auto relative">
          <HeroSection />
          {/* Dashboard Preview Wrapper */}
          <div className="absolute bottom-[-150px] md:bottom-[-400px] left-1/2 transform -translate-x-1/2 z-30">
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </main>
        <div className="max-w-[1320px] mx-auto px-6">
          <AnimatedSection className="relative z-10 mt-[411px] md:mt-[400px]" delay={0.1}>
            <h1></h1>
          </AnimatedSection>
          <AnimatedSection id="features-section" className="relative z-10 mt-16" delay={0.2}>
            <BentoSection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 mt-8 md:mt-16" delay={0.2}>
            <LargeTestimonial />
          </AnimatedSection>
          <AnimatedSection
            id="pricing-section"
            className="relative z-10 mt-8 md:mt-16"
            delay={0.2}
          >
            <PricingSection />
          </AnimatedSection>
          <AnimatedSection
            id="testimonials-section"
            className="relative z-10 mt-8 md:mt-16"
            delay={0.2}
          >
            <TestimonialGridSection />
          </AnimatedSection>
          <AnimatedSection id="faq-section" className="relative z-10 mt-8 md:mt-16" delay={0.2}>
            <FAQSection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 mt-8 md:mt-16" delay={0.2}>
            <CTASection />
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
