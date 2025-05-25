import React from 'react';

const TheTribelabRulesContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">TheTribelab Rules</h1>
      <p className="mb-4">
        Welcome to our community! To ensure a positive and respectful environment for everyone, please adhere to the following rules:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Be respectful and courteous to all members.</li>
        <li>No spamming, phishing, or distributing malicious software.</li>
        <li>Keep discussions relevant to the topics of the community.</li>
        <li>Do not share personal information of others without their explicit consent.</li>
        <li>No hate speech, bullying, or harassment will be tolerated.</li>
        <li>Content must be appropriate and safe for all ages, unless specifically designated otherwise in a particular section.</li>
        <li>Follow all applicable laws and regulations.</li>
      </ul>
      <p>
        Violation of these rules may result in warnings, temporary suspension, or permanent banning from the community. We reserve the right to remove any content or user that we deem to be in violation of these rules or harmful to the community.
      </p>
    </div>
  );
};

export default TheTribelabRulesContent;
