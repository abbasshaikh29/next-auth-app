"use client";

import React from "react";
import Header from "@/components/Header";
import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-halloween-purple text-center">
          Legal Information
        </h1>

        <div className="max-w-4xl mx-auto">
          {/* Terms and Conditions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-halloween-purple">
              Terms and Conditions
            </h2>
            <div className="prose max-w-none">
              <p className="mb-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                1. Introduction
              </h3>
              <p>
                Welcome to TheTribelab ("Company", "we", "our", "us")! These
                Terms of Service ("Terms", "Terms of Service") govern your use
                of our website located at [website URL] (together or
                individually "Service") operated by TheTribelab.
              </p>
              <p>
                Our Privacy Policy also governs your use of our Service and
                explains how we collect, safeguard and disclose information that
                results from your use of our web pages. Your agreement with us
                includes these Terms and our Privacy Policy ("Agreements"). You
                acknowledge that you have read and understood Agreements, and
                agree to be bound by them.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                2. Communications
              </h3>
              <p>
                By using our Service, you agree to subscribe to newsletters,
                marketing or promotional materials and other information we may
                send. However, you may opt out of receiving any, or all, of
                these communications from us by following the unsubscribe link
                or by emailing us.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3. Purchases</h3>
              <p>
                If you wish to purchase any product or service made available
                through Service ("Purchase"), you may be asked to supply certain
                information relevant to your Purchase including, without
                limitation, your credit card number, the expiration date of your
                credit card, your billing address, and your shipping
                information.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-halloween-purple">
              Privacy Policy
            </h2>
            <div className="prose max-w-none">
              <p className="mb-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                1. Introduction
              </h3>
              <p>
                TheTribelab ("we", "our", or "us") is committed to protecting
                your privacy. This Privacy Policy explains how your personal
                information is collected, used, and disclosed by TheTribelab.
              </p>
              <p>
                This Privacy Policy applies to our website, and its associated
                subdomains (collectively, our "Service"). By accessing or using
                our Service, you signify that you have read, understood, and
                agree to our collection, storage, use, and disclosure of your
                personal information as described in this Privacy Policy and our
                Terms of Service.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                2. Information We Collect
              </h3>
              <p>
                We collect information from you when you register on our site,
                place an order, subscribe to a newsletter, respond to a survey,
                fill out a form, or enter information on our site.
              </p>
            </div>
          </section>

          {/* Cookie Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-halloween-purple">
              Cookie Policy
            </h2>
            <div className="prose max-w-none">
              <p className="mb-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                1. What Are Cookies
              </h3>
              <p>
                Cookies are small pieces of text sent to your web browser by a
                website you visit. A cookie file is stored in your web browser
                and allows the Service or a third-party to recognize you and
                make your next visit easier and the Service more useful to you.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                2. How We Use Cookies
              </h3>
              <p>
                When you use and access the Service, we may place a number of
                cookie files in your web browser. We use cookies for the
                following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>To enable certain functions of the Service</li>
                <li>To provide analytics</li>
                <li>To store your preferences</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-halloween-purple">
              Acceptable Use Policy
            </h2>
            <div className="prose max-w-none">
              <p className="mb-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                1. Introduction
              </h3>
              <p>
                This Acceptable Use Policy ("Policy") outlines the acceptable
                use of TheTribelab's services. By using our services, you agree
                to comply with this Policy.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                2. Prohibited Activities
              </h3>
              <p>
                You agree not to engage in any of the following prohibited
                activities:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  Copying, distributing, or disclosing any part of the Service
                  in any medium, including without limitation by any automated
                  or non-automated "scraping"
                </li>
                <li>
                  Using any automated system, including without limitation
                  "robots," "spiders," "offline readers," etc., to access the
                  Service
                </li>
                <li>
                  Transmitting spam, chain letters, or other unsolicited email
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
