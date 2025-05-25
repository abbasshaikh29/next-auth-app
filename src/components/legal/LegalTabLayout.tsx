"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LegalTabNavigation from './LegalTabNavigation';
import Header from '@/components/Header';

// Import content components
import TheTribelabRulesContent from './content/SkoolRulesContent';
import PrivacyPolicyContent from './content/PrivacyPolicyContent';
import TermsAndConditionsContent from './content/TermsAndConditionsContent';
import CookiePolicyContent from './content/CookiePolicyContent';
import TransactionTermsContent from './content/TransactionTermsContent';
import AcceptableUseContent from './content/AcceptableUseContent';

// Define tabs
const legalTabs = [
  { id: 'thetribelab-rules', label: 'TheTribelab rules' },
  { id: 'privacy-policy', label: 'Privacy policy' },
  { id: 'terms-and-conditions', label: 'Terms and conditions' },
  { id: 'cookie-policy', label: 'Cookie policy' },
  { id: 'transaction-terms', label: 'Transaction terms' },
  { id: 'acceptable-use', label: 'Acceptable use' },
];

// Map tab IDs to their content components
const contentMap: Record<string, React.ReactNode> = {
  'thetribelab-rules': <TheTribelabRulesContent />,
  'privacy-policy': <PrivacyPolicyContent />,
  'terms-and-conditions': <TermsAndConditionsContent />,
  'cookie-policy': <CookiePolicyContent />,
  'transaction-terms': <TransactionTermsContent />,
  'acceptable-use': <AcceptableUseContent />,
};

const LegalTabLayout: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'skool-rules');

  // Update active tab when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && legalTabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      // If no tab param, set to default and update URL
      const defaultTabId = 'thetribelab-rules';
      setActiveTab(defaultTabId);
      router.replace(`/legal?tab=${defaultTabId}`, { scroll: false });
    }
  }, [searchParams, router]);

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/legal?tab=${tabId}`, { scroll: false });
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}>
          {/* Tab Navigation */}
          <LegalTabNavigation 
            tabs={legalTabs} 
            activeTab={activeTab} 
            onTabClick={handleTabClick} 
          />
          
          {/* Content Area */}
          <div className="w-full md:w-3/4 p-6 md:p-8 prose max-w-none">
            {contentMap[activeTab] || (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800">Content not found</h2>
                <p className="mt-2 text-gray-600">The requested section could not be found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LegalTabLayout;
