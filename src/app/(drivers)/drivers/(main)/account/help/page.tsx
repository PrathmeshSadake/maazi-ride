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
  Send,
  Download,
  PlayCircle,
  Clock,
  CheckCircle,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Help & Support
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "faq"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "contact"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab("guides")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "guides"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Guides
          </button>
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-500 text-sm">
                Find answers to common questions about using the driver app.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden"
                >
                  <button
                    className="flex justify-between items-center w-full p-4 text-left focus:outline-none hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium text-gray-900 text-sm pr-2">
                      {faq.question}
                    </span>
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {expandedFaq === index ? (
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {expandedFaq === index && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-gray-600 text-sm mt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <HelpCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-blue-800 text-sm mb-1">
                Can't find what you're looking for?
              </h3>
              <p className="text-blue-600 text-xs mb-3">
                Our support team is here to help
              </p>
              <button
                onClick={() => setActiveTab("contact")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {activeTab === "contact" && (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Contact Support
              </h2>
              <p className="text-gray-500 text-sm">
                Need help? Our support team is available 24/7 to assist you.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      Phone Support
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Available 24/7
                    </p>
                    <p className="text-gray-900 font-medium text-sm mt-1">
                      +91 1800-123-4567
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      Email Support
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Response within 24 hours
                    </p>
                    <p className="text-gray-900 font-medium text-sm mt-1">
                      support@maaziride.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        Live Chat
                      </h3>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Available 9 AM to 9 PM
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg font-medium hover:bg-purple-600 active:bg-purple-700 transition-colors">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  Send us a message
                </h3>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Please describe your issue in detail"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    ></textarea>
                  </div>

                  <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === "guides" && (
          <div className="space-y-4 mt-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Driver Guides
              </h2>
              <p className="text-gray-500 text-sm">
                Helpful guides to help you make the most of your driving
                experience.
              </p>
            </div>

            {/* Guide Cards */}
            <div className="space-y-3">
              {[
                {
                  title: "Getting Started Guide",
                  description:
                    "Learn the basics of using the driver app and completing your first ride.",
                  color: "blue",
                  icon: File,
                },
                {
                  title: "Payment & Earnings Guide",
                  description:
                    "Learn how payments work, track your earnings, and maximize your income.",
                  color: "green",
                  icon: File,
                },
                {
                  title: "Safety & Guidelines",
                  description:
                    "Important safety tips and guidelines for a secure driving experience.",
                  color: "yellow",
                  icon: File,
                },
                {
                  title: "Vehicle Maintenance Guide",
                  description:
                    "Tips for keeping your vehicle in top condition for a smooth experience.",
                  color: "purple",
                  icon: File,
                },
              ].map((guide, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div
                        className={`w-10 h-10 bg-${guide.color}-100 rounded-full flex items-center justify-center mr-3 mt-0.5`}
                      >
                        <guide.icon
                          className={`w-5 h-5 text-${guide.color}-600`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {guide.title}
                        </h3>
                        <p className="text-gray-500 text-xs mb-3">
                          {guide.description}
                        </p>
                        <button className="flex items-center text-blue-600 text-xs font-medium hover:text-blue-700">
                          <Download className="w-3 h-3 mr-1" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Tutorials */}
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <PlayCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">
                Video Tutorials
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                Watch our tutorial videos to learn how to use the driver app
                effectively.
              </p>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 active:bg-green-700 transition-colors">
                Watch Tutorials
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
