const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 shadow-lg rounded-lg space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 text-center">
        Privacy Policy
      </h1>

      <p className="text-gray-700">
        CozyBud values your privacy. This policy explains how we collect, use,
        and protect your personal information.
      </p>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          1. Information We Collect
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            Personal details: name, email, phone, billing & shipping addresses
          </li>
          <li>
            Payment information (processed securely via third-party providers)
          </li>
          <li>Usage data: IP address, browser type, pages visited</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>To process orders and deliver products</li>
          <li>
            To communicate order updates, promotions, or customer service
            inquiries
          </li>
          <li>To improve our website and services</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          3. Data Sharing
        </h2>
        <p className="text-gray-700">
          We do not sell your personal data. We may share information with:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Payment processors</li>
          <li>Shipping partners</li>
          <li>Legal authorities when required by law</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          4. Data Security
        </h2>
        <p className="text-gray-700">
          We implement reasonable technical and administrative measures to
          protect your information.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">5. Your Rights</h2>
        <p className="text-gray-700">
          You may request access to your data, corrections, or deletion by
          contacting us at <strong>support@cozybud.ph</strong>.
        </p>
      </section>

      <p className="text-gray-600 text-sm text-center">
        By using CozyBud, you consent to the collection and use of your
        information as described in this Privacy Policy.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
