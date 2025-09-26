import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface CustomDesignFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Color Modal Component - MOVED OUTSIDE to prevent re-renders
const ColorModalContent = ({ 
  selectedColorRange, 
  setSelectedColorRange, 
  customColorCount, 
  setCustomColorCount, 
  onClose, 
  onSubmit 
}) => {
  console.log("🎨 ColorModalContent rendering - selectedColorRange:", selectedColorRange, "customColorCount:", customColorCount);
  
  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Select the number of colors you want</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {["1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "1-9", "1-10"].map((range) => (
                <Button
                  key={range}
                  variant={selectedColorRange === range ? "default" : "outline"}
                  onClick={() => {
                    console.log("🔘 Color range selected:", range);
                    setSelectedColorRange(range);
                  }}
                  className="text-sm"
                >
                  {range}
                </Button>
              ))}
            </div>

            <Button
              variant={selectedColorRange === "others" ? "default" : "outline"}
              onClick={() => {
                console.log("🔘 Others option selected");
                setSelectedColorRange("others");
              }}
              className="w-full"
            >
              Others
            </Button>

            {selectedColorRange === "others" && (
              <div className="space-y-2">
                <Label htmlFor="customColors">Enter number of colors:</Label>
                <Input
                  id="customColors"
                  value={customColorCount}
                  onChange={(e) => {
                    console.log("⌨️ Custom color input changed:", e.target.value);
                    setCustomColorCount(e.target.value);
                  }}
                  placeholder="e.g., 12 or 1-15"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  console.log("✅ Color modal submit clicked");
                  onSubmit();
                }}
                disabled={!selectedColorRange || (selectedColorRange === "others" && !customColorCount)}
                className="flex-1"
              >
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("❌ Color modal cancel clicked");
                  onClose();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomDesignForm = ({ isOpen, onClose }: CustomDesignFormProps) => {
  const [formData, setFormData] = useState({
    projectName: "",
    email: "",
    phone: "",
    company: "",
    designType: "",
    colorScheme: "",
    description: "",
    deadline: "",
    budget: "",
    usage: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedColorRange, setSelectedColorRange] = useState("");
  const [customColorCount, setCustomColorCount] = useState("");

  console.log("🔍 CustomDesignForm rendering - isOpen:", isOpen, "showColorModal:", showColorModal);
  console.log("📊 Form data:", formData);
  console.log("🎯 Color modal state - selectedColorRange:", selectedColorRange, "customColorCount:", customColorCount);

  if (!isOpen) return null;

  const handleUsageChange = (usage: string, checked: boolean) => {
    console.log("📋 Usage changed:", usage, "checked:", checked);
    setFormData(prev => ({
      ...prev,
      usage: checked
        ? [...prev.usage, usage]
        : prev.usage.filter(u => u !== usage)
    }));
  };

  const handleColorSchemeChange = (value: string) => {
    console.log("🎨 Color scheme selected in main form:", value);
    if (value === "digitally") {
      console.log("📱 Opening color modal...");
      setShowColorModal(true);
    } else {
      console.log("🎯 Setting color scheme to:", value);
      setFormData(prev => ({ ...prev, colorScheme: value }));
    }
  };

  const handleColorModalSubmit = () => {
    console.log("🚀 Color modal submit handler called");
    let finalColorScheme = "";

    if (selectedColorRange === "others" && customColorCount) {
      finalColorScheme = `digitally/${customColorCount}`;
      console.log("🔧 Custom color scheme:", finalColorScheme);
    } else if (selectedColorRange && selectedColorRange !== "others") {
      finalColorScheme = `digitally/${selectedColorRange}`;
      console.log("🔧 Predefined color scheme:", finalColorScheme);
    }

    if (finalColorScheme) {
      console.log("✅ Setting final color scheme:", finalColorScheme);
      setFormData(prev => ({ ...prev, colorScheme: finalColorScheme }));
      setShowColorModal(false);
      setSelectedColorRange("");
      setCustomColorCount("");
    } else {
      console.log("⚠️ No valid color scheme selected");
    }
  };

  const handleColorModalClose = () => {
    console.log("🚪 Closing color modal");
    setShowColorModal(false);
    setSelectedColorRange("");
    setCustomColorCount("");
  };

  // Get display value for color scheme select
  const getColorSchemeDisplayValue = () => {
    if (formData.colorScheme === "monochromatic") {
      return "Monochromatic";
    } else if (formData.colorScheme.startsWith('digitally/')) {
      return "Digitally";
    }
    return "";
  };

  const handleSubmit = async () => {
    console.log("📤 Form submission started");
    setIsSubmitting(true);

    try {
      // Prepare data for backend according to the required format
      const requestData = {
        designName: formData.projectName,
        category: "Custom Design",
        subcategory: formData.designType || "General",
        quantity: 1,
        details: `Email: ${formData.email}
Phone: ${formData.phone}
Company: ${formData.company}
Design Type: ${formData.designType}
Color Scheme: ${formData.colorScheme}
Intended Usage: ${formData.usage.join(", ")}
Description: ${formData.description}
Deadline: ${formData.deadline}
Budget: ${formData.budget}`,
        status: "PENDING",
        adminNotes: "New custom design request submitted via form"
      };

      console.log("📦 Prepared request data:", requestData);
      console.log("🚀 TOTAL PAYLOAD BEING SENT TO BACKEND:", JSON.stringify(requestData, null, 2));

      // Send data to backend
      const response = await fetch("https://az.lytortech.com/api/custom-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("📨 Backend response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("✅ Backend response data:", responseData);

      // Show success message
      toast({
        title: "Request Submitted",
        description: "Your custom design request has been received. We'll contact you soon.",
      });

      // Close the form
      onClose();

    } catch (error) {
      console.error("❌ Error submitting form:", error);

      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[50] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle className="font-display text-2xl">Custom Design Request</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name*</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => {
                      console.log("📝 Project name changed:", e.target.value);
                      setFormData(prev => ({ ...prev, projectName: e.target.value }));
                    }}
                    placeholder="Enter your project name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      console.log("📧 Email changed:", e.target.value);
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                    }}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      console.log("📞 Phone changed:", e.target.value);
                      setFormData(prev => ({ ...prev, phone: e.target.value }));
                    }}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company/Brand</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => {
                      console.log("🏢 Company changed:", e.target.value);
                      setFormData(prev => ({ ...prev, company: e.target.value }));
                    }}
                    placeholder="Enter company or brand name"
                  />
                </div>
              </div>

              {/* Design Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designType">Design Type*</Label>
                  <Select value={formData.designType} onValueChange={(value) => {
                    console.log("🎨 Design type changed:", value);
                    setFormData(prev => ({ ...prev, designType: value }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select design type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surface-pattern">Surface Pattern</SelectItem>
                      <SelectItem value="textile-design">Textile Design</SelectItem>
                      <SelectItem value="wallpaper">Wallpaper Design</SelectItem>
                      <SelectItem value="packaging">Packaging Design</SelectItem>
                      <SelectItem value="digital-print">Digital Print</SelectItem>
                      <SelectItem value="logo-branding">Logo & Branding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Preferred Color Scheme</Label>
                  <Select value={formData.colorScheme} onValueChange={handleColorSchemeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme">
                        {getColorSchemeDisplayValue()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monochromatic">Monochromatic</SelectItem>
                      <SelectItem value="digitally">Digitally</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.colorScheme && formData.colorScheme.startsWith('digitally/') && (
                    <div className="text-sm text-gray-600 mt-1">
                      Selected: {formData.colorScheme}
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Rights */}
              <div className="space-y-3">
                <Label>Intended Usage (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["Apparel", "Home Textiles", "Packaging", "Digital Media", "Wallpaper", "Stationery"].map((usage) => (
                    <div key={usage} className="flex items-center space-x-2">
                      <Checkbox
                        id={usage}
                        checked={formData.usage.includes(usage)}
                        onCheckedChange={(checked) => handleUsageChange(usage, checked as boolean)}
                      />
                      <Label htmlFor={usage} className="text-sm">{usage}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2">
                <Label htmlFor="description">Design Description & Requirements*</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    console.log("📄 Description changed:", e.target.value);
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                  }}
                  placeholder="Please describe your vision, style preferences, specific elements you'd like to include..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Project Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => {
                      console.log("📅 Deadline changed:", e.target.value);
                      setFormData(prev => ({ ...prev, deadline: e.target.value }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select value={formData.budget} onValueChange={(value) => {
                    console.log("💰 Budget changed:", value);
                    setFormData(prev => ({ ...prev, budget: value }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                      <SelectItem value="1000-2500">₹1,000 - ₹2,500</SelectItem>
                      <SelectItem value="2500-5000">₹2,500 - ₹5,000</SelectItem>
                      <SelectItem value="5000+">₹5,000+</SelectItem>
                      <SelectItem value="discuss">Let's Discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  className="gradient-warm text-white flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color Selection Modal */}
      {showColorModal && (
        <ColorModalContent
          selectedColorRange={selectedColorRange}
          setSelectedColorRange={setSelectedColorRange}
          customColorCount={customColorCount}
          setCustomColorCount={setCustomColorCount}
          onClose={handleColorModalClose}
          onSubmit={handleColorModalSubmit}
        />
      )}
    </>
  );
};

export default CustomDesignForm;