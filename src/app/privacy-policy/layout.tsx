import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies & Privacy Terms | Royal Mansion Resort Villa",
  description:
    "Review payment terms, cancellation policy, villa facilities guidelines, guest responsibilities, and privacy policy for Royal Mansion Resort Villa Pussallawa.",
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
