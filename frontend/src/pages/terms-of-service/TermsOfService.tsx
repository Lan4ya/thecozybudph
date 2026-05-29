import { type FC } from "react";

const TOS: FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last Updated: May 29, 2026</p>
      </div>

      <p className="text-gray-700">
        Welcome to CozyBud! By using our website and services, you agree to
        comply with these Terms of Service. Please read carefully.
      </p>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">1. General</h2>
        <p className="text-gray-700">
          CozyBud is an e-commerce platform providing floral and home decor
          products. These Terms govern your use of our website and services.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          2. Account Responsibilities
        </h2>
        <p className="text-gray-700">
          You must provide accurate information when creating an account. You
          are responsible for maintaining the confidentiality of your account
          and password.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          3. Orders & Payments
        </h2>
        <p className="text-gray-700">
          All orders are subject to availability. Payments are processed
          securely through our payment providers. Prices are in Philippine Peso
          (PHP) and may change without notice.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          4. Shipping & Delivery
        </h2>
        <p className="text-gray-700">
          Delivery times are estimates only. CozyBud is not responsible for
          delays caused by couriers, weather, or unforeseen circumstances.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          5. Returns & Refunds
        </h2>
        <p className="text-gray-700">
          Due to the delicate and perishable nature of our floral products,{" "}
          <strong>all sales are final</strong>. Returns, replacements, or
          refunds are not accepted for change-of-mind purchases. In compliance
          with the Consumer Act of the Philippines, exceptions apply solely to
          products that arrive inherently defective or damaged, provided they
          are reported with proof within 24 hours of delivery.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          6. Intellectual Property
        </h2>
        <p className="text-gray-700">
          All content on this website, including images, text, and designs, are
          the property of CozyBud or our licensors. Unauthorized use is
          prohibited.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          7. Limitation of Liability
        </h2>
        <p className="text-gray-700">
          CozyBud is not liable for indirect, incidental, or consequential
          damages arising from the use of our website or services.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          8. Governing Law
        </h2>
        <p className="text-gray-700">
          These Terms are governed by and construed in accordance with the laws
          of the Republic of the Philippines.
        </p>
      </section>

      <p className="text-gray-600 text-sm text-center pt-4 border-t border-gray-100">
        By using our services, you agree to these Terms of Service. Please check
        this page periodically for updates.
      </p>
    </div>
  );
};

export default TOS;
