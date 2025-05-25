import React from 'react';

const CookiePolicyContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Cookie Policy</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">1. What Are Cookies</h2>
      <p className="mb-4">
        Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Cookies</h2>
      <p className="mb-4">
        When you use and access the Service, we may place a number of cookie files in your web browser. We use cookies for the following purposes:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>To enable certain functions of the Service</li>
        <li>To provide analytics</li>
        <li>To store your preferences</li>
      </ul>
      <p className="mb-4">
        We use both session and persistent cookies on the Service and we use different types of cookies to run the Service:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>Essential cookies. We may use essential cookies to authenticate users and prevent fraudulent use of user accounts.</li>
        <li>Preferences cookies. We may use preferences cookies to remember information that changes the way the Service behaves or looks, such as the "remember me" functionality of a registered user or a user's language preference.</li>
        <li>Analytics cookies. We may use analytics cookies to track information how the Service is used so that we can make improvements. We may also use analytics cookies to test new advertisements, pages, features or new functionality of the Service to see how our users react to them.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">3. Third-Party Cookies</h2>
      <p className="mb-4">
        In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">4. What Are Your Choices Regarding Cookies</h2>
      <p className="mb-4">
        If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser.
      </p>
      <p className="mb-4">
        Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
      </p>
    </div>
  );
};

export default CookiePolicyContent;
