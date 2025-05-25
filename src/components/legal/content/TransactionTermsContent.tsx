import React from 'react';

const TransactionTermsContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Transaction Terms</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">1. Payments and Billing</h2>
      <p className="mb-4">
        When you make a purchase or subscribe to a service on TheTribelab, you agree to provide current, complete, and accurate purchase and account information. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">2. Subscriptions</h2>
      <p className="mb-4">
        Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
      </p>
      <p className="mb-4">
        At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or TheTribelab cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting TheTribelab customer support team.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">3. Fee Changes</h2>
      <p className="mb-4">
        TheTribelab, in its sole discretion and at any time, may modify the Subscription fees. Any Subscription fee change will become effective at the end of the then-current Billing Cycle.
      </p>
      <p className="mb-4">
        TheTribelab will provide you with reasonable prior notice of any change in Subscription fees to give you an opportunity to terminate your Subscription before such change becomes effective.
      </p>
      <p className="mb-4">
        Your continued use of the Service after the Subscription fee change comes into effect constitutes your agreement to pay the modified Subscription fee amount.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">4. Refunds</h2>
      <p className="mb-4">
        Except when required by law, paid Subscription fees are non-refundable.
      </p>
      <p className="mb-4">
        Certain refund requests for Subscriptions may be considered by TheTribelab on a case-by-case basis and granted at the sole discretion of TheTribelab.
      </p>
    </div>
  );
};

export default TransactionTermsContent;
