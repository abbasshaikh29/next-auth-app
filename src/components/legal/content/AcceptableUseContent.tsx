import React from 'react';

const AcceptableUseContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Acceptable Use Policy</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
      <p className="mb-4">
        This Acceptable Use Policy ("Policy") outlines the acceptable use of TheTribelab's services. By using our services, you agree to comply with this Policy.
      </p>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="font-medium">We do not allow any activity or content that promotes or encourages discrimination based on race, sex, religion, nationality, disability, sexual orientation, or age.</p>
        <p className="mt-2">To provide specific examples (though by no means an exhaustive list), you cannot:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Threaten any specific individual</li>
          <li>Incite violence against a specific person, place, or group</li>
          <li>Share private information about a citizen without their permission</li>
        </ul>
      </div>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">2. Prohibited Businesses (for TheTribelab payments)</h2>
      <p className="mb-4">
        The following products and activities are not allowed to be monetized using our payments system. This is almost always because they violate U.S. federal law, they are prohibited by card network rules, or they are restricted by our payment processing partners.
      </p>
      <p className="mb-4">
        This is almost always because they violate U.S. federal law, they are prohibited by card network rules, or they are restricted by our payment processing partners. If you are unsure whether your content is prohibited on TheTribelab, please contact us at <a href="mailto:help@thetribelab.com" className="text-blue-600 hover:underline">help@thetribelab.com</a> with a description or example of the content.
      </p>
      
      <ol className="list-decimal pl-6 space-y-1 mb-6">
        <li>Unlicensed proprietary content</li>
        <li>Food products and ingredients (including consumer packaged goods, livestock, plants, and seeds)</li>
        <li>Airlines</li>
        <li>Bail bonds</li>
        <li>Bankruptcy lawyers</li>
        <li>Bidding fee or penny auctions</li>
        <li>Age or legally restricted products or services</li>
        <li>Sexually-oriented or pornographic content (including but not limited to adult books or video, adult websites or adult membership subscriptions)</li>
      </ol>
      
      <h2 className="text-xl font-semibold mt-6 mb-3">3. Prohibited Activities</h2>
      <p className="mb-4">
        You agree not to engage in any of the following prohibited activities:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Copying, distributing, or disclosing any part of the Service in any medium, including without limitation by any automated or non-automated "scraping"</li>
        <li>Using any automated system, including without limitation "robots," "spiders," "offline readers," etc., to access the Service</li>
        <li>Transmitting spam, chain letters, or other unsolicited email</li>
        <li>Attempting to interfere with, compromise the system integrity or security or decipher any transmissions to or from the servers running the Service</li>
        <li>Taking any action that imposes, or may impose at our sole discretion an unreasonable or disproportionately large load on our infrastructure</li>
        <li>Uploading invalid data, viruses, worms, or other software agents through the Service</li>
        <li>Collecting or harvesting any personally identifiable information, including account names, from the Service</li>
        <li>Using the Service for any commercial solicitation purposes</li>
        <li>Impersonating another person or otherwise misrepresenting your affiliation with a person or entity, conducting fraud, hiding or attempting to hide your identity</li>
        <li>Interfering with the proper working of the Service</li>
      </ul>
    </div>
  );
};

export default AcceptableUseContent;
