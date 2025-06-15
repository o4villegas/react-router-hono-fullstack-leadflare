import { useState } from "react";
import { Link, Form, redirect, useActionData } from "react-router";
import type { Route } from "./+types/campaign-wizard";
import { 
  Target, 
  Brain, 
  Users, 
  Calendar, 
  Zap, 
  Sparkles,
  MessageSquare,
  Eye
} from 'lucide-react';

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const campaignData = {
    name: formData.get('name'),
    objective: formData.get('objective'),
    industry: formData.get('industry'),
    targetAudience: formData.get('targetAudience'),
    budget: formData.get('budget')
  };

  try {
    // Create campaign via API
    const response = await fetch(`${context.cloudflare.env.API_URL || ''}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData)
    });

    if (response.ok) {
      const campaign = await response.json();
      return redirect(`/campaign/${campaign.id}`);
    } else {
      return { error: 'Failed to create campaign' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export default function CampaignWizard() {
  const actionData = useActionData<typeof action>();
  const [step, setStep] = useState(1);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    headlines: [] as string[],
    descriptions: [] as string[],
    images: [] as string[]
  });
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: '',
    industry: '',
    targetAudience: '',
    budget: '',
    selectedContent: {
      headline: '',
      description: '',
      image: ''
    }
  });

  const steps = [
    { id: 1, name: 'Campaign Setup', icon: Target },
    { id: 2, name: 'AI Creative Generation', icon: Brain },
    { id: 3, name: 'Meta Audience Targeting', icon: Users },
    { id: 4, name: 'Budget & Schedule', icon: Calendar },
    { id: 5, name: 'Review & Launch', icon: Zap }
  ];

  const generateAIContent = async () => {
    setIsGeneratingContent(true);
    try {
      const [headlinesRes, descriptionsRes, imagesRes] = await Promise.all([
        fetch('/api/ai/generate/headlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: campaignData.industry,
            targetAudience: campaignData.targetAudience,
            objective: campaignData.objective
          })
        }),
        fetch('/api/ai/generate/descriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: campaignData.industry,
            targetAudience: campaignData.targetAudience,
            objective: campaignData.objective
          })
        }),
        fetch('/api/ai/generate/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: campaignData.industry,
            targetAudience: campaignData.targetAudience,
            style: 'professional B2B'
          })
        })
      ]);

      const [headlines, descriptions, images] = await Promise.all([
        headlinesRes.json(),
        descriptionsRes.json(),
        imagesRes.json()
      ]);

      setGeneratedContent({
        headlines: headlines.headlines || [],
        descriptions: descriptions.descriptions || [],
        images: images.images || []
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      // Fallback content for demo
      setGeneratedContent({
        headlines: [
          "Transform Your B2B Sales Pipeline with AI-Powered Lead Generation",
          "Unlock Hidden Revenue: Advanced B2B Marketing Automation",
          "Scale Your Enterprise Sales with Intelligent Lead Scoring"
        ],
        descriptions: [
          "Drive qualified leads and accelerate your sales cycle with our AI-powered B2B marketing platform. Integrate seamlessly with your existing workflow.",
          "Leverage advanced analytics and machine learning to identify high-value prospects and optimize your marketing spend for maximum ROI.",
          "Transform your lead generation strategy with intelligent automation that learns and adapts to your industry's unique patterns."
        ],
        images: [
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop"
        ]
      });
    }
    setIsGeneratingContent(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/dashboard"
          className="text-green-400 hover:text-green-300 mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">Create AI-Powered Campaign</h1>
        <p className="text-gray-400">Advanced campaign creation with AI optimization in 5 steps</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.id;
            const isCompleted = step > stepItem.id;
            
            return (
              <div key={stepItem.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  isActive ? 'bg-green-500 text-black border-green-500' : 
                  isCompleted ? 'bg-green-500/20 text-green-400 border-green-500' : 
                  'bg-gray-700 text-gray-400 border-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-green-400' : 
                  isCompleted ? 'text-green-400' : 
                  'text-gray-500'
                }`}>
                  {stepItem.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-16 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Campaign Setup</h2>
            {actionData?.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
                {actionData.error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                  placeholder="e.g., Tech Leaders Q4 Outreach"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campaign Objective
                </label>
                <select
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData({...campaignData, objective: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                >
                  <option value="">Select objective...</option>
                  <option value="lead_generation">Lead Generation</option>
                  <option value="brand_awareness">Brand Awareness</option>
                  <option value="conversions">Conversions</option>
                  <option value="traffic">Website Traffic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Industry
                </label>
                <select
                  value={campaignData.industry}
                  onChange={(e) => setCampaignData({...campaignData, industry: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                >
                  <option value="">Select industry...</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Financial Services</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={campaignData.targetAudience}
                  onChange={(e) => setCampaignData({...campaignData, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                  placeholder="e.g., CTOs, IT Directors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget ($)
                </label>
                <input
                  type="number"
                  value={campaignData.budget}
                  onChange={(e) => setCampaignData({...campaignData, budget: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">AI Creative Generation</h2>
              <button
                onClick={generateAIContent}
                disabled={isGeneratingContent || !campaignData.industry || !campaignData.objective}
                className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGeneratingContent ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            </div>

            {!generatedContent.headlines.length && !isGeneratingContent && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg text-center">
                <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold text-blue-400 mb-2">Ready to Generate AI Content</h3>
                <p className="text-gray-300 mb-4">
                  Using Cloudflare AI, OpenAI, and Anthropic to create optimized content for your {campaignData.industry} campaign targeting {campaignData.targetAudience}.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-gray-800/50 border border-gray-700 p-4 rounded">
                    <h4 className="font-medium text-white mb-2">Smart Ad Copy</h4>
                    <p className="text-sm text-gray-400">Headlines, descriptions, and CTAs optimized for Meta's B2B targeting</p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 p-4 rounded">
                    <h4 className="font-medium text-white mb-2">Email Sequences</h4>
                    <p className="text-sm text-gray-400">Personalized outreach templates with lead nurturing workflows</p>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 p-4 rounded">
                    <h4 className="font-medium text-white mb-2">Visual Assets</h4>
                    <p className="text-sm text-gray-400">AI-generated images and graphics for professional B2B campaigns</p>
                  </div>
                </div>
              </div>
            )}

            {generatedContent.headlines.length > 0 && (
              <div className="space-y-6">
                {/* Headlines */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    AI-Generated Headlines
                  </h3>
                  <div className="grid gap-3">
                    {generatedContent.headlines.map((headline, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          campaignData.selectedContent.headline === headline
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setCampaignData({
                          ...campaignData,
                          selectedContent: { ...campaignData.selectedContent, headline }
                        })}
                      >
                        <p className="text-white font-medium">{headline}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span className="bg-gray-700 px-2 py-1 rounded mr-2">AI Generated</span>
                          <span>Optimized for {campaignData.industry}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                    AI-Generated Descriptions
                  </h3>
                  <div className="grid gap-3">
                    {generatedContent.descriptions.map((description, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          campaignData.selectedContent.description === description
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setCampaignData({
                          ...campaignData,
                          selectedContent: { ...campaignData.selectedContent, description }
                        })}
                      >
                        <p className="text-gray-300">{description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span className="bg-gray-700 px-2 py-1 rounded mr-2">Multi-AI Generated</span>
                          <span>B2B Optimized</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-purple-400" />
                    AI-Generated Visuals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {generatedContent.images.map((image, index) => (
                      <div 
                        key={index}
                        className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          campaignData.selectedContent.image === image
                            ? 'border-purple-500'
                            : 'border-transparent hover:border-gray-500'
                        }`}
                        onClick={() => setCampaignData({
                          ...campaignData,
                          selectedContent: { ...campaignData.selectedContent, image }
                        })}
                      >
                        <img src={image} alt={`AI Generated ${index + 1}`} className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                          <span className="text-white text-xs bg-purple-600 px-2 py-1 rounded">AI Generated</span>
                        </div>
                        {campaignData.selectedContent.image === image && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {step === 5 ? (
            <Form method="post">
              <input type="hidden" name="name" value={campaignData.name} />
              <input type="hidden" name="objective" value={campaignData.objective} />
              <input type="hidden" name="industry" value={campaignData.industry} />
              <input type="hidden" name="targetAudience" value={campaignData.targetAudience} />
              <input type="hidden" name="budget" value={campaignData.budget} />
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-medium"
              >
                Launch Campaign
              </button>
            </Form>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-medium"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}