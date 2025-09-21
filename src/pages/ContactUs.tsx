import React, { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ContactUs: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚀 Form submit triggered");
    e.preventDefault();

    console.log("📋 Form data:", {
      firstName,
      lastName,
      email,
      phone,
      message
    });

    if (!firstName || !lastName || !email || !message) {
      console.log("❌ Validation failed - missing required fields");
      alert("Please fill in all required fields.");
      return;
    }

    console.log("✅ Validation passed");
    setIsLoading(true);
    console.log("⏳ Loading state set to true");

    const requestData = {
      firstName,
      lastName,
      email,
      phoneNumber: phone,
      message
    };

    console.log("📤 Sending request with data:", requestData);

    try {
      const response = await fetch('https://az.lytortech.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestData)
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseData = await response.json().catch(() => null);
        console.log("✅ Success! Response data:", responseData);

        setSubmitted(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setMessage("");
        console.log("🎉 Form reset and success state set");
      } else {
        const errorData = await response.text();
        console.log("❌ Request failed with status:", response.status);
        console.log("❌ Error response:", errorData);
        alert(`Failed to send message. Status: ${response.status}. Please try again.`);
      }
    } catch (error) {
      console.error("💥 Network error:", error);
      console.error("💥 Error details:", error.message);
      alert("Network error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      console.log("🏁 Loading state set to false");
    }
  };

  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-4">
        {/* Back Button */}
        <div className="container mx-auto max-w-7xl">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 min-h-[600px]">
              {/* Left Column - Contact Information */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-white">
                <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
                <p className="text-slate-300 mb-12 leading-relaxed">
                  We'd love to hear from you. Whether you have questions,
                  need support, or want to learn how AzaArts can help,
                  feel free to reach out by email, phone,
                  or by filling out the form below.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">📧</span>
                    <span className="text-slate-300">info@azaarts.com</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-2xl mr-4">📞</span>
                    <span className="text-slate-300">+91 93724 47544</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🔗</span>
                    <span className="text-slate-300">Customer Support</span>
                  </div>
                </div>

                <div className="mt-16 space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Customer Support</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Our dedicated support team is available 24/7
                      to assist you with any questions, concerns,
                      or technical issues you may have.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Feedback & Suggestions</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Your feedback matters to us. At AzaArts,
                      we're constantly striving to improve, and
                      your input plays a vital role in shaping
                      the future of our services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className="p-12">
                <div className="max-w-md mx-auto">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Get in Touch</h2>
                  <p className="text-gray-600 mb-8">
                    You can reach us anytime by completing the form. Share a
                    few details, and we'll get back to you as quickly as possible.
                  </p>

                  {submitted ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank you!</h3>
                      <p className="text-gray-600">Your message has been sent successfully.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                              console.log("First name changed:", e.target.value);
                              setFirstName(e.target.value);
                            }}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="First name"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                              console.log("Last name changed:", e.target.value);
                              setLastName(e.target.value);
                            }}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Last name"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            console.log("Email changed:", e.target.value);
                            setEmail(e.target.value);
                          }}
                          className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Your email"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <select className="bg-transparent border-none outline-none text-sm text-gray-600">
                            <option>+91</option>
                          </select>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            console.log("Phone changed:", e.target.value);
                            setPhone(e.target.value);
                          }}
                          className="w-full border border-gray-200 rounded-lg pl-20 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Phone number"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <textarea
                          value={message}
                          onChange={(e) => {
                            console.log("Message changed:", e.target.value);
                            setMessage(e.target.value);
                          }}
                          rows={4}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="How can we help?"
                          required
                          maxLength={500}
                        />
                        <div className="text-right text-sm text-gray-400 mt-1">
                          {message.length}/500
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full font-medium py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                      >
                        {isLoading ? 'Sending...' : 'Submit'}
                      </button>

                      {/* Terms */}
                      <p className="text-sm text-gray-500 text-center">
                        By contacting us, you agree to our{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms of service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactUs;