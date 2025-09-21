import React, { useState } from "react";
import { ArrowLeft, Shield, FileText, Eye, Cookie, ChevronDown, ChevronUp, Calendar, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LegalPolicies: React.FC = () => {
  const [activeSection, setActiveSection] = useState('licensing');
  const [expandedItems, setExpandedItems] = useState({});

  const handleBack = () => {
    window.location.href = "/";
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const sections = [
    { id: 'licensing', title: 'Licensing', icon: FileText },
    { id: 'privacy', title: 'Privacy Policy', icon: Shield },
    { id: 'terms', title: 'Terms of Service', icon: Eye },
    { id: 'cookies', title: 'Cookie Policy', icon: Cookie }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        {/* Back Button */}
        <div className="container mx-auto max-w-6xl px-4 pt-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="container mx-auto max-w-6xl px-4 pb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Legal Policies
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Important information about licensing, privacy, terms of service, and cookies for Aza Arts
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
              <Calendar className="w-4 h-4 mr-2" />
              Last Updated: December 2024
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <h3 className="font-semibold text-gray-800 mb-4">Navigate to:</h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 mr-3" />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                
                {/* Licensing Section */}
                {activeSection === 'licensing' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <FileText className="w-8 h-8 text-blue-600 mr-4" />
                      <h2 className="text-3xl font-bold text-gray-800">Licensing</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                        <h3 className="text-xl font-semibold text-blue-800 mb-2">License Types</h3>
                        <p className="text-blue-700">
                          Aza Arts offers different licensing options for our designs and artwork to suit various commercial and personal needs.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">Personal License</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Use for personal projects only</li>
                            <li>• No commercial use permitted</li>
                            <li>• Single user license</li>
                            <li>• No redistribution allowed</li>
                          </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">Commercial License</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Commercial use permitted</li>
                            <li>• Use in products for sale</li>
                            <li>• Marketing and advertising use</li>
                            <li>• Extended distribution rights</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">License Restrictions</h4>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <ul className="text-gray-600 space-y-2">
                            <li>• Designs cannot be resold as standalone items</li>
                            <li>• Attribution to Aza Arts is required for commercial use</li>
                            <li>• Modification of original designs requires written permission</li>
                            <li>• Mass production requires extended commercial license</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Policy Section */}
                {activeSection === 'privacy' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <Shield className="w-8 h-8 text-green-600 mr-4" />
                      <h2 className="text-3xl font-bold text-gray-800">Privacy Policy</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                        <p className="text-green-700">
                          Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
                        </p>
                      </div>

                      <div>
                        <button
                          onClick={() => toggleExpanded('data-collection')}
                          className="w-full flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <h4 className="text-lg font-semibold text-gray-800">Data Collection</h4>
                          {expandedItems['data-collection'] ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {expandedItems['data-collection'] && (
                          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                            <h5 className="font-medium text-gray-800 mb-2">Information We Collect:</h5>
                            <ul className="text-gray-600 space-y-1">
                              <li>• Personal information (name, email, phone)</li>
                              <li>• Payment information (processed securely)</li>
                              <li>• Usage data and website analytics</li>
                              <li>• Communication preferences</li>
                            </ul>
                          </div>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={() => toggleExpanded('data-usage')}
                          className="w-full flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <h4 className="text-lg font-semibold text-gray-800">How We Use Your Data</h4>
                          {expandedItems['data-usage'] ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {expandedItems['data-usage'] && (
                          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                            <ul className="text-gray-600 space-y-1">
                              <li>• Process orders and provide services</li>
                              <li>• Communicate about your account and orders</li>
                              <li>• Improve our services and user experience</li>
                              <li>• Send marketing communications (with consent)</li>
                              <li>• Comply with legal obligations</li>
                            </ul>
                          </div>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={() => toggleExpanded('data-protection')}
                          className="w-full flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <h4 className="text-lg font-semibold text-gray-800">Data Protection</h4>
                          {expandedItems['data-protection'] ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {expandedItems['data-protection'] && (
                          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                            <ul className="text-gray-600 space-y-1">
                              <li>• SSL encryption for data transmission</li>
                              <li>• Secure servers and databases</li>
                              <li>• Regular security audits</li>
                              <li>• Limited access to personal data</li>
                              <li>• Data retention policies</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms of Service Section */}
                {activeSection === 'terms' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <Eye className="w-8 h-8 text-purple-600 mr-4" />
                      <h2 className="text-3xl font-bold text-gray-800">Terms of Service</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-r-lg">
                        <p className="text-purple-700">
                          By using our services, you agree to these terms and conditions. Please read them carefully.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Service Usage</h4>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <ul className="text-gray-600 space-y-2">
                            <li>• You must be 18 years or older to use our services</li>
                            <li>• Account information must be accurate and up-to-date</li>
                            <li>• You are responsible for maintaining account security</li>
                            <li>• Prohibited uses include illegal activities or copyright infringement</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Payment Terms</h4>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <ul className="text-gray-600 space-y-2">
                            <li>• Payment is required before service delivery</li>
                            <li>• All prices are in USD unless otherwise specified</li>
                            <li>• Refunds are subject to our refund policy</li>
                            <li>• Additional fees may apply for custom work</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Intellectual Property</h4>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <ul className="text-gray-600 space-y-2">
                            <li>• All designs and artwork remain property of Aza Arts</li>
                            <li>• License grants specific usage rights only</li>
                            <li>• Unauthorized copying or distribution is prohibited</li>
                            <li>• Copyright infringement will be pursued legally</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cookie Policy Section */}
                {activeSection === 'cookies' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <Cookie className="w-8 h-8 text-orange-600 mr-4" />
                      <h2 className="text-3xl font-bold text-gray-800">Cookie Policy</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg">
                        <p className="text-orange-700">
                          We use cookies to improve your experience on our website. This policy explains what cookies are and how we use them.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">What Are Cookies?</h4>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <p className="text-gray-600 mb-3">
                            Cookies are small text files stored on your device when you visit our website. They help us provide you with a better browsing experience.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">Essential Cookies</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Required for website functionality</li>
                            <li>• Remember your login status</li>
                            <li>• Maintain shopping cart contents</li>
                            <li>• Cannot be disabled</li>
                          </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">Analytics Cookies</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Track website usage statistics</li>
                            <li>• Help improve user experience</li>
                            <li>• Monitor website performance</li>
                            <li>• Can be disabled in settings</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Managing Cookies</h4>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <p className="text-gray-600 mb-3">
                            You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect website functionality.
                          </p>
                          <ul className="text-gray-600 space-y-1">
                            <li>• Chrome: Settings → Privacy and Security → Cookies</li>
                            <li>• Firefox: Preferences → Privacy & Security</li>
                            <li>• Safari: Preferences → Privacy</li>
                            <li>• Edge: Settings → Cookies and site permissions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Questions About Our Policies?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about these policies or need clarification, please don't hesitate to contact us.
            </p>
            <div className="flex items-center justify-center text-gray-600">
              <Mail className="w-5 h-5 mr-2" />
              <span>legal@azaarts.com</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LegalPolicies;