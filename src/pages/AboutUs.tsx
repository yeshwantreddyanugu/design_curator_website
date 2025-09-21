import React from "react";
import { ArrowLeft, Palette, Eye, Users, Brush, Layers, Frame, Handshake, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleContactUs = () => {
    navigate("/contactUs");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
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
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              About Aza Arts
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Where art meets story, and creativity transforms spaces into meaningful experiences
            </p>
          </div>

          {/* Who We Are Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
                Who We Are
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed text-center mb-8">
                At Aza Arts, we believe art is more than decoration — it's a story. Founded with a passion 
                for nature, patterns, and textures, our studio blends traditional artistry with modern design.
              </p>
              
              {/* Visual divider */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                Our Philosophy
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Creativity First */}
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
                    <Palette className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Creativity First</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every project is unique, and we craft designs that reflect individuality.
                  </p>
                </div>

                {/* Detail & Quality */}
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Detail & Quality</h3>
                  <p className="text-gray-600 leading-relaxed">
                    From brush to print, our focus is on precision and timeless beauty.
                  </p>
                </div>

                {/* Collaboration */}
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Collaboration</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We work closely with clients to turn visions into meaningful artwork.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                Our Services
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12">
                We provide creative design solutions across multiple domains
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original Artwork & Prints */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Brush className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Original Artwork & Prints</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Hand-crafted watercolours, botanical studies, and art prints for personal and professional spaces.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Textile & Surface Design */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Textile & Surface Design</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Customized patterns for home textiles, bedding, wallpapers, and lifestyle products.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Commissioned Projects */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Frame className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Commissioned Projects</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Personalized artwork, murals, or digital designs tailored to your vision.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaborations */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Handshake className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Collaborations</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Working with brands, designers, and studios to bring creative concepts to life.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-xl p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Let's design something beautiful together. Contact us today and bring your creative vision to life.
              </p>
              
              <button
                onClick={handleContactUs}
                className="bg-white text-purple-600 font-semibold px-8 py-4 rounded-xl hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center"
              >
                Contact Us Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Process</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 text-sm font-semibold">1</span>
                  </div>
                  <span>Consultation & Vision Discovery</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 text-sm font-semibold">2</span>
                  </div>
                  <span>Concept Development & Design</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 text-sm font-semibold">3</span>
                  </div>
                  <span>Refinement & Finalization</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 text-sm font-semibold">4</span>
                  </div>
                  <span>Delivery & Support</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Choose Aza Arts?</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Personalized approach to every project</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Traditional artistry meets modern techniques</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Attention to detail and quality craftsmanship</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Collaborative process from concept to completion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutUs;