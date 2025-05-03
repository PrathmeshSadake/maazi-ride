"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  File,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("faq");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Sample FAQs - in a real app these would come from an API or CMS
  const faqs: FAQ[] = [
    {
      question: "How do I update my vehicle information?",
      answer:
        "You can update your vehicle information by going to Account > My Vehicle, and clicking on the 'Update Vehicle Information' button. There you can edit your vehicle details including make, model, year, color, and license plate number.",
    },
    {
      question: "When and how do I get paid?",
      answer:
        "Payments are processed weekly, every Monday for the previous week's rides. The earnings are transferred directly to your bank account or UPI ID that you've registered with us. You can check your payment history and details in the 'Earnings' section.",
    },
    {
      question: "What documents do I need to provide?",
      answer:
        "You need to provide three main documents: 1) A valid driving license, 2) Vehicle registration certificate (RC), and 3) Vehicle insurance. You can upload these documents in the 'Documents & Verification' section of your account.",
    },
    {
      question: "How is my driver rating calculated?",
      answer:
        "Your driver rating is calculated based on the ratings given by passengers after each ride. Ratings are on a scale of 1 to 5 stars. The system calculates your average rating across all your rides. You can view your ratings and reviews in the 'Ratings & Reviews' section.",
    },
    {
      question: "What happens if I need to cancel a ride?",
      answer:
        "If you need to cancel an accepted ride, you should do so as early as possible. Go to the 'Bookings' section, select the ride, and click the 'Cancel' button. Frequent cancellations may affect your rating and status on the platform.",
    },
    {
      question: "How do I report issues with a passenger?",
      answer:
        "If you encounter any issues with a passenger, you can report it through the 'Help & Support' section. Click on 'Contact Support', select 'Report an Issue', and provide details about the incident. Our support team will review and respond to your report.",
    },
  ];

  // Toggle FAQ
  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("faq")}
          className={`px-4 py-2 ${
            activeTab === "faq"
              ? "border-b-2 border-green-500 font-medium text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 ${
            activeTab === "contact"
              ? "border-b-2 border-green-500 font-medium text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Contact Support
        </button>
        <button
          onClick={() => setActiveTab("guides")}
          className={`px-4 py-2 ${
            activeTab === "guides"
              ? "border-b-2 border-green-500 font-medium text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Guides
        </button>
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm">
              Find answers to common questions about using the driver app.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronDown size={20} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-500" />
                  )}
                </button>

                {expandedFaq === index && (
                  <div className="p-4 pt-0 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 mb-2">
              Can't find what you're looking for?
            </p>
            <button
              onClick={() => setActiveTab("contact")}
              className="text-green-600 font-medium hover:text-green-700"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {/* Contact Support Tab */}
      {activeTab === "contact" && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Contact Support</h2>
            <p className="text-gray-500">
              Need help? Our support team is available 24/7 to assist you.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Phone className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium">Phone Support</h3>
                  <p className="text-gray-500 text-sm">Available 24/7</p>
                  <p className="mt-1 font-medium">+91 1800-123-4567</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Mail className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-gray-500 text-sm">
                    Response within 24 hours
                  </p>
                  <p className="mt-1 font-medium">support@maaziride.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <MessageSquare className="text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium">Live Chat</h3>
                  <p className="text-gray-500 text-sm">
                    Available 9 AM to 9 PM
                  </p>
                  <button className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Send us a message</h3>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a topic</option>
                  <option value="account">Account Issues</option>
                  <option value="payment">Payment Queries</option>
                  <option value="ride">Ride Issues</option>
                  <option value="vehicle">Vehicle Information</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Please describe your issue in detail"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>

              <div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guides Tab */}
      {activeTab === "guides" && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Driver Guides</h2>
            <p className="text-gray-500">
              Helpful guides to help you make the most of your driving
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-32 bg-blue-50 flex items-center justify-center">
                <File size={48} className="text-blue-500" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Getting Started Guide</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Learn the basics of using the driver app and completing your
                  first ride.
                </p>
                <a
                  href="#"
                  className="text-green-600 font-medium text-sm hover:text-green-700"
                >
                  Download PDF
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-32 bg-green-50 flex items-center justify-center">
                <File size={48} className="text-green-500" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Payment & Earnings Guide</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Learn how payments work, track your earnings, and maximize
                  your income.
                </p>
                <a
                  href="#"
                  className="text-green-600 font-medium text-sm hover:text-green-700"
                >
                  Download PDF
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-32 bg-yellow-50 flex items-center justify-center">
                <File size={48} className="text-yellow-500" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Safety & Guidelines</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Important safety tips and guidelines for a secure driving
                  experience.
                </p>
                <a
                  href="#"
                  className="text-green-600 font-medium text-sm hover:text-green-700"
                >
                  Download PDF
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-32 bg-purple-50 flex items-center justify-center">
                <File size={48} className="text-purple-500" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Vehicle Maintenance Guide</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Tips for keeping your vehicle in top condition for a smooth
                  experience.
                </p>
                <a
                  href="#"
                  className="text-green-600 font-medium text-sm hover:text-green-700"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-4 text-center">
            <HelpCircle size={32} className="mx-auto text-green-500 mb-2" />
            <h3 className="font-medium mb-1">Video Tutorials</h3>
            <p className="text-sm text-gray-500 mb-3">
              Watch our tutorial videos to learn how to use the driver app
              effectively.
            </p>
            <a
              href="#"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Watch Tutorials
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
