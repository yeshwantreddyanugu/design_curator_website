import React, { useState } from "react";
import { ArrowLeft, Mail, Phone, MessageCircle, CheckCircle } from "lucide-react";
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
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Back Button */}
        <div className="container mx-auto max-w-4xl px-4 pt-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="container mx-auto max-w-4xl px-4 pb-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We'd love to hear from you. Whether you have questions, need support, 
              or want to learn how AzaArts can help, feel free to reach out.
            </p>
          </div>

          {/* Contact Info Cards - Mobile Friendly */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm">info@azaarts.com</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm">+91 93724 47544</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Support</h3>
              <p className="text-gray-600 text-sm">24/7 Available</p>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Thank you!</h3>
                  <p className="text-gray-600 mb-8">
                    Your message has been sent successfully. We'll get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Get in Touch</h2>
                    <p className="text-gray-600">
                      Share a few details, and we'll get back to you as quickly as possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields - Stack on Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            console.log("First name changed:", e.target.value);
                            setFirstName(e.target.value);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => {
                            console.log("Last name changed:", e.target.value);
                            setLastName(e.target.value);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            console.log("Email changed:", e.target.value);
                            setEmail(e.target.value);
                          }}
                          className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            console.log("Phone changed:", e.target.value);
                            setPhone(e.target.value);
                          }}
                          className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => {
                          console.log("Message changed:", e.target.value);
                          setMessage(e.target.value);
                        }}
                        rows={5}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="How can we help you? Please describe your inquiry..."
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
                      className={`w-full font-medium py-4 px-6 rounded-lg transition-all duration-200 ${
                        isLoading
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Support</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our dedicated support team is available 24/7 to assist you with any questions, 
                concerns, or technical issues you may have.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Feedback & Suggestions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your feedback matters to us. We're constantly striving to improve, and your 
                input plays a vital role in shaping the future of our services.
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              By contacting us, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactUs;