import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Users, Globe, DollarSign, Shield, Star, Upload, Palette, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SellerApplicationForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessType: string;
  experienceYears: number;
  designCategories: string;
  portfolioUrl: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  termsAccepted: boolean;
}

const BecomeSeller = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SellerApplicationForm>({
    fullName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessType: '',
    experienceYears: 0,
    designCategories: '',
    portfolioUrl: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    termsAccepted: false,
  });

  // Base API URL
  const API_BASE_URL = 'https://az.lytortech.com/api';

  const businessTypes = [
    'Individual Freelancer',
    'Design Studio',
    'Independent Artist',
    'Creative Agency',
    'Art Collective',
    'Textile Designer',
    'Digital Artist',
    'Other'
  ];

  const designCategoryOptions = [
    'Logo Design',
    'Web Design',
    'Branding',
    'Surface Pattern Design',
    'Textile Design',
    'Print Design',
    'Digital Art',
    'Illustration',
    'Packaging Design',
    'Fashion Design',
    'Home Decor Patterns',
    'Wallpaper Design'
  ];

  const stats = [
    { icon: Globe, value: '10M+', label: 'Monthly Pinterest Views' },
    { icon: Users, value: '138K', label: 'Instagram Followers' },
    { icon: TrendingUp, value: '62K+', label: 'Industry Professionals' },
    { icon: Palette, value: '100K+', label: 'Curated Designs' },
  ];

  const features = [
    { icon: DollarSign, title: '50% Commission', description: 'No hidden fees - we even cover PayPal costs' },
    { icon: Shield, title: '100% Anti-AI', description: 'We only accept original, human-made work' },
    { icon: CheckCircle, title: 'No Upfront Fees', description: 'Join our marketplace completely free' },
    { icon: Star, title: 'Quality Curation', description: 'Rigorous review process ensures industry standards' },
  ];

  const handleInputChange = (field: keyof SellerApplicationForm, value: string | number | boolean) => {
    console.log(`📝 [FORM] Field updated - ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    console.log('🔍 [VALIDATION] Starting form validation...');
    
    const requiredFields = [
      'fullName', 'email', 'phoneNumber', 'businessName', 'businessType',
      'designCategories', 'portfolioUrl', 'bio', 'address', 'city', 'state', 'pincode'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof SellerApplicationForm]);
    
    if (missingFields.length > 0) {
      console.log('❌ [VALIDATION] Missing required fields:', missingFields);
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    if (formData.experienceYears < 1) {
      console.log('❌ [VALIDATION] Experience years too low:', formData.experienceYears);
      toast({
        title: "Experience Required",
        description: "Please specify at least 1 year of design experience.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.includes('@')) {
      console.log('❌ [VALIDATION] Invalid email format:', formData.email);
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.portfolioUrl.startsWith('http')) {
      console.log('❌ [VALIDATION] Invalid portfolio URL format:', formData.portfolioUrl);
      toast({
        title: "Invalid Portfolio URL",
        description: "Please enter a valid portfolio URL starting with http:// or https://",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.termsAccepted) {
      console.log('❌ [VALIDATION] Terms not accepted');
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return false;
    }

    console.log('✅ [VALIDATION] Form validation successful');
    return true;
  };

  const submitApplication = async (applicationData: SellerApplicationForm) => {
    console.log('🚀 [SUBMIT] Starting application submission...');
    console.log('🚀 [SUBMIT] ========== REQUEST DATA ==========');
    console.log('📦 [SUBMIT] Application data being sent:', {
      fullName: applicationData.fullName,
      email: applicationData.email,
      phoneNumber: applicationData.phoneNumber,
      businessName: applicationData.businessName,
      businessType: applicationData.businessType,
      experienceYears: applicationData.experienceYears,
      designCategories: applicationData.designCategories,
      portfolioUrl: applicationData.portfolioUrl,
      bioLength: applicationData.bio.length,
      address: applicationData.address,
      city: applicationData.city,
      state: applicationData.state,
      pincode: applicationData.pincode,
      termsAccepted: applicationData.termsAccepted
    });

    const requestBody = JSON.stringify(applicationData);
    console.log('📡 [SUBMIT] API Request Configuration:');
    console.log('  📍 URL:', `${API_BASE_URL}/seller-applications`);
    console.log('  📋 Method: POST');
    console.log('  📄 Content-Type: application/json');
    console.log('  🎯 ngrok-skip-browser-warning: true');
    console.log('📦 [SUBMIT] Request Body Details:');
    console.log('  📦 Body length:', requestBody.length, 'characters');
    console.log('  📦 Full Request Body:', requestBody);
    console.log('🚀 [SUBMIT] =====================================');

    try {
      console.log('🌐 [SUBMIT] Making API call...');
      const requestStartTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/seller-applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: requestBody,
      });

      const requestEndTime = Date.now();
      const responseTime = requestEndTime - requestStartTime;

      console.log('📡 [SUBMIT] ========== RESPONSE DATA ==========');
      console.log('📡 [SUBMIT] Response received in', responseTime, 'ms');
      console.log('  📊 Status Code:', response.status);
      console.log('  📊 Status Text:', response.statusText);
      console.log('  📊 Response OK:', response.ok);
      console.log('  📊 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [SUBMIT] Application submitted successfully!');
        console.log('✅ [SUBMIT] Response body:', result);
        console.log('📡 [SUBMIT] ===================================');
        return { success: true, data: result };
      } else {
        const errorText = await response.text();
        console.error('❌ [SUBMIT] Application submission failed!');
        console.error('❌ [SUBMIT] Error Response Details:');
        console.error('  📊 Status Code:', response.status);
        console.error('  📊 Status Text:', response.statusText);
        console.error('  📄 Error Response Body:', errorText);
        console.error('📡 [SUBMIT] ===================================');
        return { success: false, error: `Failed to submit application: ${errorText}` };
      }
    } catch (error) {
      console.error('💥 [SUBMIT] Exception occurred during API call!');
      console.error('💥 [SUBMIT] Error Details:', error);
      console.error('💥 [SUBMIT] Error Type:', error.constructor.name);
      console.error('💥 [SUBMIT] Error Message:', error.message);
      if (error instanceof TypeError) {
        console.error('  🌐 Network error detected - check internet connection and API availability');
        console.error('  🌐 API URL being called:', `${API_BASE_URL}/seller-applications`);
      }
      console.error('📡 [SUBMIT] ===================================');
      return { success: false, error: `Network error: ${error.message}` };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📋 [FORM] Form submission initiated');

    if (!validateForm()) {
      console.log('❌ [FORM] Form validation failed, submission aborted');
      return;
    }

    setIsSubmitting(true);
    console.log('⏳ [FORM] Setting form to submitting state');

    try {
      console.log('🚀 [FORM] Calling submitApplication...');
      const result = await submitApplication(formData);

      if (result.success) {
        console.log('🎉 [FORM] Application submitted successfully!');
        toast({
          title: "Application Submitted! 🎉",
          description: "Thank you for your interest! We'll review your application and get back to you within 3-5 business days.",
        });

        // Reset form
        console.log('🧹 [FORM] Resetting form data');
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          businessName: '',
          businessType: '',
          experienceYears: 0,
          designCategories: '',
          portfolioUrl: '',
          bio: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          termsAccepted: false,
        });
      } else {
        console.error('❌ [FORM] Application submission failed:', result.error);
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 [FORM] Unexpected error during submission:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log('🏁 [FORM] Form submission completed, removing submitting state');
    }
  };

  console.log('🎨 [RENDER] Rendering BecomeSeller component');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Sell Your Designs on <span className="text-primary">Aza Arts</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            The leading curated marketplace for surface pattern design. Connect with global buyers, 
            enjoy flexible licensing, and maintain full creative control of your work.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Why Designers Choose Aza Arts
                </CardTitle>
                <CardDescription>
                  Built by designers, for designers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Apply to Become a Seller</h4>
                      <p className="text-sm text-muted-foreground">
                        Submit your application with portfolio and sample designs for review.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Upload Your Designs</h4>
                      <p className="text-sm text-muted-foreground">
                        Once approved, start uploading with flexible license options.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Earn Commission</h4>
                      <p className="text-sm text-muted-foreground">
                        Get paid monthly via PayPal with transparent 50% commission.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Licensing Options</CardTitle>
                <CardDescription>
                  Three flexible license types to protect your work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-700">Personal (Non-exclusive)</h4>
                    <p className="text-sm text-muted-foreground">For non-commercial, limited use</p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-700">Commercial (Non-exclusive)</h4>
                    <p className="text-sm text-muted-foreground">For small-batch or unlimited resale use</p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-purple-700">Premium Exclusive</h4>
                    <p className="text-sm text-muted-foreground">One-off license with full ownership transfer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Application Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Apply to Become a Seller
                </CardTitle>
                <CardDescription>
                  Join our curated marketplace and start selling your designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Business Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business/Studio Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="Your business or studio name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select 
                        value={formData.businessType} 
                        onValueChange={(value) => handleInputChange('businessType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">Years of Experience *</Label>
                      <Input
                        id="experienceYears"
                        type="number"
                        min="1"
                        value={formData.experienceYears || ''}
                        onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                        placeholder="3"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Design Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Design Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="designCategories">Design Categories *</Label>
                      <Input
                        id="designCategories"
                        value={formData.designCategories}
                        onChange={(e) => handleInputChange('designCategories', e.target.value)}
                        placeholder="Logo Design, Web Design, Branding"
                        required
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {designCategoryOptions.slice(0, 8).map((category) => (
                          <Badge key={category} variant="outline" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => {
                              const current = formData.designCategories;
                              if (!current.includes(category)) {
                                const newValue = current ? `${current}, ${category}` : category;
                                handleInputChange('designCategories', newValue);
                              }
                            }}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolioUrl">Portfolio URL *</Label>
                      <Input
                        id="portfolioUrl"
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                        placeholder="https://www.yourportfolio.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio *</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about your design experience, style, and what makes your work unique..."
                        rows={4}
                        required
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {formData.bio.length}/500 characters
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Address Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Design Street, Creative Colony"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Hyderabad"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Telangana"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          placeholder="500032"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange('termsAccepted', !!checked)}
                    />
                    <Label htmlFor="termsAccepted" className="text-sm leading-5">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and 
                      <a href="#" className="text-primary hover:underline ml-1">Seller License Agreement</a>. 
                      I confirm that all designs I submit will be 100% original, human-made work.
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeSeller;