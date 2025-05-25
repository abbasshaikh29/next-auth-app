import React from 'react';

const PrivacyPolicyContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Privacy Policy</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
      <p className="mb-4">
        TheTribelab ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by TheTribelab.
      </p>
      <p className="mb-4">
        This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service"). By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
      <p className="mb-4">
        We collect information from you when you register on our site, place an order, subscribe to a newsletter, respond to a survey, fill out a form, or enter information on our site.
      </p>
      <p className="mb-4">
        The personal information that we collect depends on the context of your interactions with us and the Service, the choices you make, and the products and features you use. The personal information we collect may include the following:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>Name and contact data. We collect your first and last name, email address, postal address, phone number, and other similar contact data.</li>
        <li>Credentials. We collect passwords, password hints, and similar security information used for authentication and account access.</li>
        <li>Payment data. We collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
      <p className="mb-4">
        We use the information we collect in various ways, including to:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>Provide, operate, and maintain our website</li>
        <li>Improve, personalize, and expand our website</li>
        <li>Understand and analyze how you use our website</li>
        <li>Develop new products, services, features, and functionality</li>
        <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
        <li>Send you emails</li>
        <li>Find and prevent fraud</li>
      </ul>
    </div>
  );
};

export default PrivacyPolicyContent;
