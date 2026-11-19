"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Icon from "@/components/Icon";
import Image from "next/image";
import Link from "next/link";
import bg from "@/app/assets/about-bg.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  FaCreditCard,
  FaCalendarTimes,
  FaShieldAlt,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaBan,
  FaSmokingBan,
  FaVolumeMute,
  FaUserFriends,
  FaPaw,
  FaLeaf,
  FaClock,
  FaFileContract,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaLock,
} from "react-icons/fa";

function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-reveal-delay={delay} className={className}>
      {children}
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      {/* Hero Banner */}
      <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            className="object-cover scale-105"
            src={bg}
            alt="Royal Mansion Resort Villa Pussallawa"
            fill
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
        </div>

        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-tertiary-fixed text-xs font-semibold uppercase tracking-widest mb-4">
            <FaShieldAlt className="text-sm" />
            <span>Resort Guidelines & Terms</span>
          </div> */}
          <h1 className="font-display-lg text-display-lg md:text-[64px] text-white leading-tight mb-4 drop-shadow">
            Policies & Privacy Terms
          </h1>
          <p className="font-body-md text-body-md text-white/90 max-w-2xl mx-auto leading-relaxed">
            Please review our booking policies, payment terms, guest responsibilities, and privacy standards to ensure a seamless and serene stay at Royal Mansion Resort Villa.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="bg-ivory py-16 md:py-24 px-margin-mobile md:px-margin-desktop font-open-sans">
        <div className="max-w-6xl mx-auto">

          {/* Quick Jump Bar */}
          <SectionReveal className="mb-14">
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 md:p-6 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-semibold text-primary">
              <a
                href="#payment-terms"
                className="px-4 py-2 rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-colors"
              >
                Payment Terms
              </a>
              <a
                href="#booking-cancellation"
                className="px-4 py-2 rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-colors"
              >
                Booking & Cancellation
              </a>
              <a
                href="#guest-responsibilities"
                className="px-4 py-2 rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-colors"
              >
                Facilities & Guest Rules
              </a>
              <a
                href="#validity"
                className="px-4 py-2 rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-colors"
              >
                Quotation Validity
              </a>
              <a
                href="#confirmation-receipt"
                className="px-4 py-2 rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-colors"
              >
                Booking Confirmation
              </a>
              <a
                href="#privacy-policy"
                className="px-4 py-2 rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-colors"
              >
                Privacy & Data Protection
              </a>
            </div>
          </SectionReveal>

          <div className="space-y-16">
            {/* 1. Payment Terms */}
            <SectionReveal>
              <section id="payment-terms" className="scroll-mt-32">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center text-xl shrink-0">
                      <FaCreditCard />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold text-tertiary">
                        Section 01
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
                        Payment Terms
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                        50%
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-lg mb-1">
                          Advance Payment
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed">
                          50% advance payment is required to secure and confirm the booking for your requested dates.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                        50%
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-lg mb-1">
                          Remaining Balance
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed">
                          Remaining 50% balance must be paid at least 24 hours before check-in via our secure online gateway or verified bank transfer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </SectionReveal>

            {/* 2. Booking & Cancellation Policy */}
            <SectionReveal delay={100}>
              <section id="booking-cancellation" className="scroll-mt-32">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                      <FaCalendarTimes />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold text-tertiary">
                        Section 02
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
                        Booking & Cancellation Policy
                      </h2>
                    </div>
                  </div>

                  <div className="mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                    <FaClock className="text-primary text-xl shrink-0" />
                    <p className="text-primary font-medium">
                      <strong className="font-bold">Advance Notice:</strong> Bookings must be confirmed at least 7 days prior to arrival.
                    </p>
                  </div>

                  <h3 className="text-lg font-bold text-primary mb-4">
                    Cancellation Schedule & Refunds
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-3">
                          100% Refundable
                        </span>
                        <h4 className="font-bold text-emerald-950 text-lg mb-2">
                          Up to 5 Days Before
                        </h4>
                        <p className="text-emerald-900/80 text-sm leading-relaxed">
                          Free cancellation up to 5 days before check-in. Full advance payment will be returned.
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <FaCheckCircle /> Zero cancellation fee
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-3">
                          50% Fee
                        </span>
                        <h4 className="font-bold text-amber-950 text-lg mb-2">
                          3–5 Days Before
                        </h4>
                        <p className="text-amber-900/80 text-sm leading-relaxed">
                          50% cancellation fee applies if cancelled 3 to 5 days prior to arrival date.
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-amber-200/60 flex items-center gap-2 text-xs font-semibold text-amber-800">
                        <FaExclamationTriangle /> Partial refund
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-3">
                          Non-Refundable
                        </span>
                        <h4 className="font-bold text-rose-950 text-lg mb-2">
                          Within 2 Days
                        </h4>
                        <p className="text-rose-900/80 text-sm leading-relaxed">
                          No refund for cancellations made within 2 days of check-in or for early departures.
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-rose-200/60 flex items-center gap-2 text-xs font-semibold text-rose-800">
                        <FaBan /> No refund
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </SectionReveal>

            {/* 3. Included Facilities & Guest Responsibilities */}
            <SectionReveal delay={150}>
              <section id="guest-responsibilities" className="scroll-mt-32">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center text-xl shrink-0">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold text-tertiary">
                        Section 03
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
                        Included Facilities & Guest Responsibilities
                      </h2>
                    </div>
                  </div>

                  <p className="text-on-surface-variant mb-8 leading-relaxed">
                    To maintain our serene atmosphere and preserve the pristine beauty of Royal Mansion Resort Villa, all staying guests and visitors kindly agree to observe the following standards:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Item 1 */}
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 mt-0.5">
                        <FaShieldAlt />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">
                          Property & Furniture Care
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Please do not damage any property, furniture, or fixtures. Any loss or damage will be evaluated and charged accordingly.
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 mt-0.5">
                        <FaSmokingBan />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">
                          No Smoking Indoors
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          No smoking inside rooms and indoor villa facilities. Dedicated outdoor smoking areas are available.
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 mt-0.5">
                        <FaVolumeMute />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">
                          Quiet Hours (10:00 PM)
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          No loud music or disturbances to neighbours after 10 PM to ensure tranquillity across our valley community.
                        </p>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 mt-0.5">
                        <FaUserFriends />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">
                          Prior Approval for Visitors
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Visitors not included in the original booking confirmation must be requested and approved in advance by management.
                        </p>
                      </div>
                    </div>

                    {/* Item 5 */}
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 mt-0.5">
                        <FaPaw />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">
                          Pet Policy
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          No pets are allowed on premises unless explicitly confirmed in writing at the time of booking.
                        </p>
                      </div>
                    </div>

                    {/* Item 6 */}
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 mt-0.5">
                        <FaLeaf />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">
                          Cleanliness & Resource Care
                        </h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Maintain cleanliness throughout your stay, and kindly use electricity and water responsibly to protect the surrounding environment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </SectionReveal>

            {/* 4. Validity & Confirmation Deliverables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Validity */}
              <SectionReveal delay={200}>
                <section id="validity" className="h-full scroll-mt-32">
                  <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-black/5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center text-xl shrink-0">
                          <FaFileContract />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-widest font-bold text-tertiary">
                            Section 04
                          </span>
                          <h2 className="text-2xl font-bold text-primary font-headline-lg">
                            Quotation Validity
                          </h2>
                        </div>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed mb-6">
                        Any customized quotation, seasonal rate offer, or package proposal issued by Royal Mansion Resort Villa is valid for:
                      </p>
                      <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5 flex items-center gap-4">
                        <FaClock className="text-3xl text-tertiary shrink-0" />
                        <div>
                          <p className="text-2xl font-bold text-primary">10 Days</p>
                          <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                            From the date of issue
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* <p className="text-xs text-on-surface-variant/70 mt-6 italic">
                      Dates and promotional rates cannot be reserved beyond this period without receipt of the 50% advance confirmation payment.
                    </p> */}
                  </div>
                </section>
              </SectionReveal>

              {/* Confirmation Deliverables */}
              <SectionReveal delay={250}>
                <section id="confirmation-receipt" className="h-full scroll-mt-32">
                  <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-black/5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                          <FaFileInvoiceDollar />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-widest font-bold text-tertiary">
                            Section 05
                          </span>
                          <h2 className="text-2xl font-bold text-primary font-headline-lg">
                            Upon Booking Confirmation
                          </h2>
                        </div>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed mb-6">
                        Once your booking has been confirmed and verified, our team will promptly issue and dispatch the following official documents:
                      </p>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low border border-black/5">
                          <FaCheckCircle className="text-primary shrink-0" />
                          <span className="font-semibold text-primary">Official invoice</span>
                        </li>
                        <li className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low border border-black/5">
                          <FaCheckCircle className="text-primary shrink-0" />
                          <span className="font-semibold text-primary">Confirmation receipt</span>
                        </li>
                        <li className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low border border-black/5">
                          <FaCheckCircle className="text-primary shrink-0" />
                          <span className="font-semibold text-primary">Check-in details and villa policies</span>
                        </li>
                      </ul>
                    </div>
                    {/* <p className="text-xs text-on-surface-variant/70 mt-6 italic">
                      Please retain these documents on your mobile device or in print for check-in verification upon arrival.
                    </p> */}
                  </div>
                </section>
              </SectionReveal>
            </div>

            {/* 5. Privacy & Data Protection */}
            <SectionReveal delay={300}>
              <section id="privacy-policy" className="scroll-mt-32">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed/30 text-tertiary flex items-center justify-center text-xl shrink-0">
                      <FaLock />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold text-tertiary">
                        Section 06
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
                        Privacy & Data Protection Policy
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6 text-on-surface-variant leading-relaxed">
                    <p>
                      Royal Mansion Resort Villa is committed to safeguarding the privacy and confidentiality of our guests and website visitors. This section outlines how we collect, handle, and protect your personal information.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5">
                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                          <FaShieldAlt className="text-tertiary text-sm" /> Information We Collect
                        </h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          We collect essential information required to process reservations, including guest names, telephone contact numbers, email addresses, national identity or passport details (for statutory hotel guest registers), and stay preferences.
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5">
                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                          <FaShieldAlt className="text-tertiary text-sm" /> How We Use Your Data
                        </h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          Your information is used exclusively to facilitate your stay, verify payment transactions, provide personalized hospitality services, communicate check-in instructions, and comply with Sri Lankan hospitality and tax regulations.
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5">
                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                          <FaLock className="text-tertiary text-sm" /> Payment Security
                        </h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          Electronic payment details are processed through encrypted, PCI-DSS compliant payment gateways (e.g., PayHere) or direct verified banking channels. Royal Mansion Resort Villa does not store your full debit or credit card credentials.
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-surface-container-low border border-black/5">
                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                          <FaLock className="text-tertiary text-sm" /> Non-Disclosure Guarantee
                        </h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          We do not sell, rent, or lease guest information to third-party marketing companies. Data is only shared with trusted service partners directly involved in fulfilling your stay requirements or when legally required by law enforcement authorities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </SectionReveal>

            {/* Assistance & Inquiries Card */}
            <SectionReveal delay={350}>
              <div className="bg-primary text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7">
                    <span className="text-tertiary-fixed text-xs uppercase tracking-widest font-bold mb-2 block">
                      We are here to help
                    </span>
                    <h3 className="font-display-lg text-2xl md:text-3xl text-white mb-3">
                      Have Questions About Our Policies?
                    </h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">
                      Our  team is available to assist you with booking amendments, special requirements, or questions regarding our terms and policies.
                    </p>
                  </div>

                  <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-4">
                    <a
                      href="tel:+94764001245"
                      className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-primary font-bold hover:bg-tertiary-fixed transition-colors shadow-sm"
                    >
                      <FaPhoneAlt /> Call Us
                    </a>
                    {/* <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/20"
                    >
                      <FaEnvelope /> Contact Us Online
                    </Link> */}
                  </div>
                </div>
              </div>
            </SectionReveal>

          </div>
        </div>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
}
