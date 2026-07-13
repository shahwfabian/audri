import { LegalDocument, LegalSection } from "@/components/LegalDocument";

export default function TermsPage() {
 return (
  <LegalDocument title="Terms of Service">
   <LegalSection title="Using Audri">
    <p>You must provide accurate account information and protect access to your account. You may use Audri only for lawful scholarship planning and writing assistance.</p>
    <p>You must be at least 13 years old. If you are under the age of legal majority where you live, a parent or guardian must approve your use.</p>
   </LegalSection>
   <LegalSection title="Your responsibility">
    <p>AI output can be incomplete or wrong. You are responsible for reviewing every submission and confirming that it reflects your real experience. You are also responsible for following each scholarship provider&apos;s rules on assisted writing.</p>
    <p>Audri does not guarantee eligibility, selection, or an award.</p>
   </LegalSection>
   <LegalSection title="Subscriptions">
    <p>Paid plans renew at the price shown during checkout until canceled. You can manage cancellation through the billing portal. Access continues according to the terms shown by Stripe at cancellation.</p>
   </LegalSection>
   <LegalSection title="Acceptable use">
    <p>Do not use Audri to impersonate another person or submit invented experience as fact. Do not interfere with service operation. Do not attempt to bypass usage limits or access another customer&apos;s information.</p>
   </LegalSection>
   <LegalSection title="Content">
    <p>You retain rights to information you provide and the drafts created for you, subject to applicable law. You permit Audri and its service providers to process that material only as needed to operate the service.</p>
   </LegalSection>
   <LegalSection title="Availability">
    <p>Audri may change or suspend features when needed for maintenance or safety. The service is provided without a guarantee of uninterrupted availability.</p>
   </LegalSection>
   <LegalSection title="Termination">
    <p>You may delete your account from Settings. Audri may suspend access for misuse or a serious violation of these terms.</p>
   </LegalSection>
   <LegalSection title="Contact">
    <p>Questions can be submitted through the support address published with the production service.</p>
   </LegalSection>
  </LegalDocument>
 );
}

