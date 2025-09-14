import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrendingCollections from "@/components/TrendingCollections";
import NewArrivals from "@/components/NewArrivals";
import PremiumSection from "@/components/PremiumSection";
import CategoryShowcase from "@/components/CategoryShowcase";
import LatestProducts from "@/components/LatestProducts";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="space-y-8 sm:space-y-12">
        <Hero />
        <TrendingCollections />
        <NewArrivals />
        <PremiumSection />
        {/* <CategoryShowcase /> */}
        <LatestProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
