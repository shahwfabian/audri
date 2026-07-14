import { LegalDocument, LegalSection } from "@/components/LegalDocument";

export default function PrivacyPage() {
 return (
  <LegalDocument title="Privacy Policy">
   <LegalSection title="Scope">
    <p>This policy explains how Audri handles information when you use the scholarship planning and writing service.</p>
   </LegalSection>
   <LegalSection title="Information Audri processes">
    <p>Account information includes your name and email address. Your password is stored as a one-way hash.</p>
    <p>Student information may include education details, scholarship preferences, achievements, personal stories, essay drafts, and saved applications. Profile and workspace records are encrypted before storage.</p>
    <p>Audri also processes basic security logs and billing identifiers. Full payment-card details are handled by Stripe and are not stored by Audri.</p>
   </LegalSection>
   <LegalSection title="How information is used">
    <p>Audri uses account information to provide the service and protect customer access. Student information is used to generate requested scholarship guidance. It is also used to save work across signed-in devices.</p>
   </LegalSection>
   <LegalSection title="Service providers">
    <p>Audri uses service providers only where needed to operate the product.</p>
    <ul className="list-disc pl-5 space-y-2">
     <li>An AI model provider processes prompts and generated responses for requested writing features.</li>
     <li>Stripe processes subscription payments.</li>
     <li>Supabase hosts production database records when configured.</li>
     <li>A transactional email provider delivers account security messages when configured.</li>
    </ul>
    <p>AI requests are sent through Audri&apos;s protected server routes. Customers do not provide or store provider credentials in the browser.</p>
   </LegalSection>
   <LegalSection title="Retention and control">
    <p>Account data is retained while your account remains active. You can download your stored data or delete the account from Settings. Backup copies may persist for a limited recovery period after deletion.</p>
   </LegalSection>
   <LegalSection title="Security">
    <p>Audri uses access controls, encryption at rest for student records, and authenticated server routes. No online service can guarantee absolute security.</p>
   </LegalSection>
   <LegalSection title="Children">
    <p>Audri is not directed to children under 13. Do not create an account for a child under 13. A parent or guardian should review use of the service by a minor.</p>
   </LegalSection>
   <LegalSection title="Contact">
    <p>Privacy requests can be submitted through the support address published with the production service.</p>
   </LegalSection>
  </LegalDocument>
 );
}
