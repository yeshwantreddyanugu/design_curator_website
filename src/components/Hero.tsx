





















import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface BannerData {
  id: number;
  bannerImage: string;
  text: string;
  discountText: string;
  isActive: boolean;
}

interface ApiResponse {
  data: BannerData;
  success: boolean;
}

const Hero = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        console.log("Fetching banner data from:", "https://az.lytortech.com/api/banners/current");
        setLoading(true);

        const response = await fetch("https://az.lytortech.com/api/banners/current", {
          headers: {
            'Accept': 'application/json',
          }
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        console.log("Received banner data:", data);

        if (data.success && data.data) {
          setBannerData(data.data);
          console.log("Banner image URL:", data.data.bannerImage);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching banner:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch banner");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  if (loading) {
    console.log("Loading banner...");
    return (
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </section>
    );
  }

  if (error) {
    console.error("Banner error:", error);
    return (
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden flex items-center justify-center">
        <div className="text-white">Error loading banner: {error}</div>
      </section>
    );
  }

  if (!bannerData) {
    console.log("No banner data available");
    return (
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden flex items-center justify-center">
        <div className="text-white">No banner available</div>
      </section>
    );
  }

  console.log("Rendering banner with image:", bannerData.bannerImage);

  return (
    <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bannerData.bannerImage})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4">
            <span className="text-white/90 text-2xl font-medium tracking-wider">
              - {bannerData.discountText || "Trending"} -
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            {bannerData.text || "Tropical Haze"}
          </h1>

          <Link to="/items">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 text-lg shadow-strong transition-smooth"
            >
              EXPLORE & SHOP NOW
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/20 to-transparent" />
    </section>
  );
};

export default Hero;