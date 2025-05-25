import React from 'react';

const TermsAndConditionsContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Terms and Conditions</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
      <p className="mb-4">
        Welcome to TheTribelab ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our website located at [website URL] (together or individually "Service") operated by TheTribelab.
      </p>
      <p className="mb-4">
        Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages. Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound by them.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">2. Communications</h2>
      <p className="mb-4">
        By using our Service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or by emailing us.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">3. Purchases</h2>
      <p className="mb-4">
        If you wish to purchase any product or service made available through Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
      </p>
      <p className="mb-4">
        You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">4. Content</h2>
      <p className="mb-4">
        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through Service, including its legality, reliability, and appropriateness.
      </p>
      <p className="mb-4">
        By posting Content on or through Service, You represent and warrant that: (i) Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity. We reserve the right to terminate the account of anyone found to be infringing on a copyright.
      </p>
    </div>
  );
};

export default TermsAndConditionsContent;
