import type { FC } from "react";

const PrivacyPolicy: FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last Updated: May 29, 2026</p>
      </div>

      <p className="text-gray-700">
        CozyBud values your privacy. This policy explains how we collect, use,
        disclose, and protect your personal information in accordance with the
        <strong> Data Privacy Act of 2012 (RA 10173)</strong> of the Republic of
        the Philippines.
      </p>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>
            <strong>Personal details:</strong> Name, email address, phone
            number, billing, and shipping addresses.
          </li>
          <li>
            <strong>Payment information:</strong> Processed securely via
            third-party providers (CozyBud does not store your raw credit card
            details).
          </li>
          <li>
            <strong>Usage data:</strong> IP address, browser type, device
            information, and pages visited.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>
            To process transactions, fulfill orders, and manage logistics.
          </li>
          <li>
            To communicate order confirmations, delivery tracking updates, and
            customer support inquiries.
          </li>
          <li>
            To send promotional updates or newsletters (only if you opt-in).
          </li>
          <li>
            To optimize website performance and enhance customer experience.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          3. Data Sharing & Third Parties
        </h2>
        <p className="text-gray-700">
          We do not sell, rent, or trade your personal data. We only share
          information with trusted partners essential to running our service:
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>Integrated third-party payment gateways.</li>
          <li>Third-party couriers and fulfillment partners for delivery.</li>
          <li>
            Law enforcement or legal authorities when strictly required by
            Philippine law.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          4. Data Security & Retention
        </h2>
        <p className="text-gray-700">
          We implement appropriate physical, technical, and organizational
          security measures to shield your data from unauthorized access or
          alteration.
        </p>
        <p className="text-gray-700">
          Your personal data is retained only for as long as necessary to
          fulfill your orders, satisfy accounting or tax obligations, or resolve
          legal disputes, after which it is securely deleted.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          5. Your Rights under the Data Privacy Act
        </h2>
        <p className="text-gray-700">
          As a data subject in the Philippines, you are entitled to specific
          rights under RA 10173, including:
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>The right to be informed of data collection and processing.</li>
          <li>
            The right to access, inspect, or request copies of your personal
            information.
          </li>
          <li>The right to correct or update inaccuracies in your data.</li>
          <li>
            The right to suspend, withdraw, or order the erasure/blocking of
            your data from our systems.
          </li>
        </ul>
        <p className="text-gray-700 pt-2">
          To exercise any of these statutory rights, please contact our Data
          Protection Officer at{" "}
          <strong className="text-gray-900">support@cozybud.ph</strong>.
        </p>
      </section>

      <p className="text-gray-600 text-sm text-center pt-4 border-t border-gray-100">
        By using CozyBud, you consent to the collection and use of your
        information as outlined in this Privacy Policy.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
