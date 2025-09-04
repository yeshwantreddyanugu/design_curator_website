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

  if (!isOpen) return null;

  const handleUsageChange = (usage: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      usage: checked 
        ? [...prev.usage, usage]
        : prev.usage.filter(u => u !== usage)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log("📤 Form submission started:", formData);
    
    try {
      // Prepare data for backend according to the required format
      const requestData = {
        designName: formData.projectName,
        category: "Custom Design", // You can customize this based on designType
        subcategory: formData.designType || "General",
        quantity: 1, // Default quantity, can be adjusted based on your requirements
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="font-display text-2xl">Custom Design Request</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name*</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company/Brand</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>

            {/* Design Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designType">Design Type*</Label>
                <Select value={formData.designType} onValueChange={(value) => setFormData(prev => ({ ...prev, designType: value }))}>
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
                <Select value={formData.colorScheme} onValueChange={(value) => setFormData(prev => ({ ...prev, colorScheme: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tropical">Tropical Colors</SelectItem>
                    <SelectItem value="monochromatic">Monochromatic</SelectItem>
                    <SelectItem value="pastel">Pastel Tones</SelectItem>
                    <SelectItem value="bold-bright">Bold & Bright</SelectItem>
                    <SelectItem value="earth-tones">Earth Tones</SelectItem>
                    <SelectItem value="custom">Custom Palette</SelectItem>
                  </SelectContent>
                </Select>
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
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000+">$5,000+</SelectItem>
                    <SelectItem value="discuss">Let's Discuss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="gradient-warm text-white flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDesignForm;