"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/components/ui/use-toast";

export default function EditSession() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: "",
    description: "",
    category: "",
    languages: [],
    image_url: "",

    is_sample: false,
  });

  const categories = [
    { value: "anxiety", label: "Anxiety" },
    { value: "confidence", label: "Confidence" },
    { value: "sleep", label: "Sleep" },
    { value: "focus", label: "Focus" },
    { value: "healing", label: "Healing" },
    { value: "success", label: "Success" },
  ];

  const availableLanguages = [
    { value: "english", label: "English" },
    { value: "indian_english", label: "Indian English" },
    { value: "hindi", label: "हिंदी" },
    { value: "arabic", label: "العربية" },
    { value: "tagalog", label: "Tagalog" },
    { value: "chinese", label: "中文" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (session && session.user?.role !== "admin") {
      router.push("/");
      return;
    }
    loadSession();
  }, [params.id, session, mounted]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setSessionData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAudioUrlChange = (language, url) => {
    setSessionData((prev) => ({
      ...prev,
      audio_urls: { ...prev.audio_urls, [language]: url },
    }));
  };

  const handleLanguageToggle = (language) => {
    setSessionData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleChildSessionChange = (index, field, value) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) => {
        if (i === index) {
          const updatedChild = { ...child, [field]: value };
          
          // Auto-calculate price when discount percentage changes
          if (field === 'discount_percentage' && updatedChild.original_price) {
            const discountAmount = (updatedChild.original_price * value) / 100;
            updatedChild.price = updatedChild.original_price - discountAmount;
          }
          
          // Auto-calculate discount when price or original_price changes
          if ((field === 'price' || field === 'original_price') && updatedChild.price && updatedChild.original_price) {
            const discount = ((updatedChild.original_price - updatedChild.price) / updatedChild.original_price) * 100;
            updatedChild.discount_percentage = Math.round(discount);
          }
          
          return updatedChild;
        }
        return child;
      }),
    }));
  };

  const handleSubSessionChange = (childIndex, subIndex, field, value) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              sub_sessions: child.sub_sessions?.map((sub, j) =>
                j === subIndex ? { ...sub, [field]: value } : sub
              ) || [],
            }
          : child
      ),
    }));
  };

  const handleSubMaterialChange = (childIndex, subIndex, materialIndex, field, value) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              sub_sessions: child.sub_sessions?.map((sub, j) =>
                j === subIndex
                  ? {
                      ...sub,
                      materials: sub.materials?.map((material, k) =>
                        k === materialIndex ? { ...material, [field]: value } : material
                      ) || [],
                    }
                  : sub
              ) || [],
            }
          : child
      ),
    }));
  };

  const handleSubAudioChange = (childIndex, subIndex, language, url) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              sub_sessions: child.sub_sessions?.map((sub, j) =>
                j === subIndex
                  ? {
                      ...sub,
                      audio_urls: { ...sub.audio_urls, [language]: url },
                    }
                  : sub
              ) || [],
            }
          : child
      ),
    }));
  };

  const handleChildMaterialChange = (
    childIndex,
    materialIndex,
    field,
    value
  ) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              materials: child.materials.map((material, j) =>
                j === materialIndex ? { ...material, [field]: value } : material
              ),
            }
          : child
      ),
    }));
  };

  const addChildMaterial = (childIndex) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              materials: [...(child.materials || []), { name: "", link: "" }],
            }
          : child
      ),
    }));
  };

  const removeChildMaterial = (childIndex, materialIndex) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              materials: child.materials.filter((_, j) => j !== materialIndex),
            }
          : child
      ),
    }));
  };

  const handleChildAudioChange = (index, language, url) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === index
          ? {
              ...child,
              audio_urls: { ...child.audio_urls, [language]: url },
            }
          : child
      ),
    }));
  };

  const childSessionRefs = useRef([]);

  const addChildSession = () => {
    setSessionData((prev) => {
      const newChildSessions = [
        ...(prev.child_sessions || []),
        {
          title: "",
          sub_sessions: [],
        },
      ];

      setTimeout(() => {
        const newIndex = newChildSessions.length - 1;
        childSessionRefs.current[newIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return { ...prev, child_sessions: newChildSessions };
    });
  };

  const addSubSession = (childIndex) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              sub_sessions: [
                ...(child.sub_sessions || []),
                {
                  title: "",
                  description: "",
                  duration: 25,
                  audio_urls: { hindi: "", english: "", arabic: "" },
                  image_url: "",
                  materials: [],
                  order: (child.sub_sessions?.length || 0) + 1,
                },
              ],
            }
          : child
      ),
    }));
  };

  const removeSubSession = (childIndex, subIndex) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              sub_sessions: child.sub_sessions?.filter((_, j) => j !== subIndex) || [],
            }
          : child
      ),
    }));
  };

  const addSubMaterial = (childIndex, subIndex) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              sub_sessions: child.sub_sessions?.map((sub, j) =>
                j === subIndex
                  ? {
                      ...sub,
                      materials: [...(sub.materials || []), { name: "", link: "" }],
                    }
                  : sub
              ) || [],
            }
          : child
      ),
    }));
  };

  const removeSubMaterial = (childIndex, subIndex, materialIndex) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              sub_sessions: child.sub_sessions?.map((sub, j) =>
                j === subIndex
                  ? {
                      ...sub,
                      materials: sub.materials?.filter((_, k) => k !== materialIndex) || [],
                    }
                  : sub
              ) || [],
            }
          : child
      ),
    }));
  };

  const removeChildSession = (index) => {
    setSessionData((prev) => ({
      ...prev,
      child_sessions: prev.child_sessions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!sessionData.title?.trim()) {
      errors.push("Title is required");
    }

    if (!sessionData.category) {
      errors.push("Category is required");
    }





    if (sessionData.child_sessions?.length > 0) {
      sessionData.child_sessions.forEach((child, index) => {
        if (!child.title?.trim()) {
          errors.push(`Child session ${index + 1} title is required`);
        }
        
        // Validate sub-sessions
        if (child.sub_sessions?.length > 0) {
          child.sub_sessions.forEach((sub, subIndex) => {
            if (!sub.title?.trim()) {
              errors.push(`Child ${index + 1} - Sub-session ${subIndex + 1} title is required`);
            }
            if (!sub.duration || sub.duration <= 0) {
              errors.push(`Child ${index + 1} - Sub-session ${subIndex + 1} duration must be greater than 0`);
            }
          });
        }
      });
    }

    return errors;
  };

  const uploadFileToCloudflare = async (file, fileName) => {
    // Clean filename: trim spaces and replace spaces with hyphens
    const cleanFileName = fileName.trim().replace(/\s+/g, '-');
    const fileExtension = file.name.split('.').pop();
    const finalFileName = cleanFileName + '.' + fileExtension;
    
    // Create a new file with the cleaned name
    const renamedFile = new File([file], finalFileName, {
      type: file.type,
    });

    const formData = new FormData();
    formData.append("files", renamedFile);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    return data.url || data.files[0].url;
  };

  const shouldConvertToCDN = (url) => {
    return url && typeof url === 'string' && !url.startsWith('https://cdn.subconsciousvalley.workers.dev/');
  };

  const handleSave = async () => {
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the following errors:\n" + validationErrors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedSessionData = { ...sessionData };

      // Upload main session image if it's a file
      if (sessionData.image_url && sessionData.image_url instanceof File) {
        const imageUrl = await uploadFileToCloudflare(
          sessionData.image_url,
          `session-${params.id}-image`
        );
        updatedSessionData.image_url = imageUrl;
      }



      // Upload child and sub-session files
      if (sessionData.child_sessions) {
        for (let i = 0; i < sessionData.child_sessions.length; i++) {
          const child = sessionData.child_sessions[i];
          
          // Upload child session image
          if (child.image_url && child.image_url instanceof File) {
            const imageUrl = await uploadFileToCloudflare(
              child.image_url,
              `session-${params.id}-child-${i}-image`
            );
            updatedSessionData.child_sessions[i].image_url = imageUrl;
          }
          
          if (child.sub_sessions) {
            for (let k = 0; k < child.sub_sessions.length; k++) {
              const subSession = child.sub_sessions[k];

              // Upload sub-session audio files
              if (subSession.audio_urls) {
                for (const [lang, audioFile] of Object.entries(subSession.audio_urls)) {
                  if (audioFile && audioFile instanceof File) {
                    const audioUrl = await uploadFileToCloudflare(
                      audioFile,
                      `session-${params.id}-child-${i}-sub-${k}-${lang}-audio`
                    );
                    updatedSessionData.child_sessions[i].sub_sessions[k].audio_urls[lang] = audioUrl;
                  } else if (shouldConvertToCDN(audioFile)) {
                    updatedSessionData.child_sessions[i].sub_sessions[k].audio_urls[lang] = `https://cdn.subconsciousvalley.workers.dev/${audioFile.split('/').pop()}`;
                  }
                }
              }

              // Upload sub-session materials
              if (subSession.materials) {
                for (let l = 0; l < subSession.materials.length; l++) {
                  const material = subSession.materials[l];
                  if (material.link && material.link instanceof File) {
                    const materialUrl = await uploadFileToCloudflare(
                      material.link,
                      `session-${params.id}-child-${i}-sub-${k}-material-${l}`
                    );
                    updatedSessionData.child_sessions[i].sub_sessions[k].materials[l].link = materialUrl;
                  } else if (shouldConvertToCDN(material.link)) {
                    updatedSessionData.child_sessions[i].sub_sessions[k].materials[l].link = `https://cdn.subconsciousvalley.workers.dev/${material.link.split('/').pop()}`;
                  }
                }
              }
            }
          }
        }
      }

      const response = await fetch(`/api/sessions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSessionData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session updated successfully.",
        });
        router.push("/sessions");
      } else {
        toast({
          title: "Error",
          description: "Failed to update session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error saving session.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-purple-50 to-pink-50 py-8 relative">
      {isSaving && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            <span className="text-slate-700 font-medium">Saving Changes...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/sessions")}
                className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sessions
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Edit Session
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your session content and settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Primary Content */}
          <div className="lg:col-span-2 space-y-8 lg:pr-4">
            {/* Basic Information */}
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className=" w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    Basic Information
                  </h1>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700"
                    >
                      Session Title *
                    </Label>
                    <Input
                      id="title"
                      value={sessionData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg h-11"
                      placeholder="Enter session title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium text-gray-700"
                    >
                      Category
                    </Label>
                    <Select
                      value={sessionData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={sessionData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg resize-none"
                    placeholder="Describe your session..."
                  />
                </div>


              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Session Image
                  </Label>
                  <FileUpload
                    value={sessionData.image_url}
                    onChange={(value) => handleInputChange("image_url", value)}
                    accept="image/*"
                    placeholder="Upload session image"
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="is_sample"
                    checked={sessionData.is_sample}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_sample", checked)
                    }
                    className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 data-[state=checked]:text-white [&>span>svg]:text-white"
                  />
                  <Label
                    htmlFor="is_sample"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mark as Sample Session
                  </Label>
                </div>
              </CardContent>
            </Card>



            {/* Child Sessions */}
            {sessionData.child_sessions &&
              sessionData.child_sessions.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                        <div className="w-3 h-3 bg-violet-500 rounded-full mr-3"></div>
                        Child Sessions ({sessionData.child_sessions.length})
                      </CardTitle>
                      <Button
                        type="button"
                        onClick={addChildSession}
                        variant="outline"
                        size="sm"
                        className="hover:bg-violet-100 border-violet-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Session
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <Accordion type="multiple" className="space-y-4">
                      {sessionData.child_sessions?.map((child, index) => (
                        <AccordionItem
                          key={index}
                          value={`session-${index}`}
                          className="border border-black rounded-lg"
                          ref={(el) => (childSessionRefs.current[index] = el)}
                        >
                          <div className="flex items-center">
                            <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline cursor-pointer">
                              <span className="font-semibold text-slate-800">
                                Session {index + 1}: {child.title || "Untitled"}
                              </span>
                            </AccordionTrigger>
                            <Button
                              type="button"
                              onClick={() => removeChildSession(index)}
                              variant="destructive"
                              size="sm"
                              className="hover:bg-red-600 mr-4"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <AccordionContent className="px-4 pb-4 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Title
                                </Label>
                                <Input
                                  value={child.title || ""}
                                  onChange={(e) =>
                                    handleChildSessionChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                                  placeholder="Enter child session title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Image
                                </Label>
                                <FileUpload
                                  value={child.image_url || ""}
                                  onChange={(value) =>
                                    handleChildSessionChange(
                                      index,
                                      "image_url",
                                      value
                                    )
                                  }
                                  accept="image/*"
                                  placeholder="Upload child session image"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Description
                              </Label>
                              <Textarea
                                value={child.description || ""}
                                onChange={(e) =>
                                  handleChildSessionChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg resize-none"
                                placeholder="Describe this child session..."
                              />
                            </div>

                            {/* Child Session Pricing */}
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Price (AED)
                                </Label>
                                <Input
                                  type="number"
                                  value={child.price ?? ""}
                                  onChange={(e) =>
                                    handleChildSessionChange(
                                      index,
                                      "price",
                                      e.target.value === "" ? null : Number(e.target.value)
                                    )
                                  }
                                  className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Original Price (AED)
                                </Label>
                                <Input
                                  type="number"
                                  value={child.original_price ?? ""}
                                  onChange={(e) =>
                                    handleChildSessionChange(
                                      index,
                                      "original_price",
                                      e.target.value === "" ? null : Number(e.target.value)
                                    )
                                  }
                                  className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Discount %
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={child.discount_percentage ?? ""}
                                  onChange={(e) =>
                                    handleChildSessionChange(
                                      index,
                                      "discount_percentage",
                                      e.target.value === "" ? null : Number(e.target.value)
                                    )
                                  }
                                  className="border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            {/* Sub-Sessions */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">
                                  Sub-Sessions ({(child.sub_sessions || []).length})
                                </Label>
                                <Button
                                  type="button"
                                  onClick={() => addSubSession(index)}
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-blue-100 border-blue-200"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Sub-Session
                                </Button>
                              </div>
                              
                              {(child.sub_sessions || []).map((subSession, subIndex) => (
                                <div key={subIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h6 className="text-sm font-medium text-gray-800">
                                      Sub-Session {subIndex + 1}: {subSession.title || "Untitled"}
                                    </h6>
                                    <Button
                                      type="button"
                                      onClick={() => removeSubSession(index, subIndex)}
                                      variant="destructive"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium text-gray-600">
                                        Title
                                      </Label>
                                      <Input
                                        value={subSession.title || ""}
                                        onChange={(e) =>
                                          handleSubSessionChange(index, subIndex, "title", e.target.value)
                                        }
                                        className="text-sm"
                                        placeholder="Sub-session title"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium text-gray-600">
                                        Duration (min)
                                      </Label>
                                      <Input
                                        type="number"
                                        value={subSession.duration || 25}
                                        onChange={(e) =>
                                          handleSubSessionChange(index, subIndex, "duration", Number(e.target.value))
                                        }
                                        className="text-sm"
                                        placeholder="25"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium text-gray-600">
                                      Description
                                    </Label>
                                    <Textarea
                                      value={subSession.description || ""}
                                      onChange={(e) =>
                                        handleSubSessionChange(index, subIndex, "description", e.target.value)
                                      }
                                      rows={2}
                                      className="text-sm resize-none"
                                      placeholder="Sub-session description"
                                    />
                                  </div>
                                  
                                  {/* Sub-session Materials */}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-medium text-gray-600">
                                        Materials
                                      </Label>
                                      <Button
                                        type="button"
                                        onClick={() => addSubMaterial(index, subIndex)}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add
                                      </Button>
                                    </div>
                                    {(subSession.materials || []).map((material, materialIndex) => (
                                      <div key={materialIndex} className="p-3 bg-white rounded border space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-medium text-gray-600">
                                            Material {materialIndex + 1}
                                          </span>
                                          <Button
                                            type="button"
                                            onClick={() => removeSubMaterial(index, subIndex, materialIndex)}
                                            variant="destructive"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <Input
                                          value={material.name || ""}
                                          onChange={(e) =>
                                            handleSubMaterialChange(index, subIndex, materialIndex, "name", e.target.value)
                                          }
                                          className="text-xs"
                                          placeholder="Material name"
                                        />
                                        <FileUpload
                                          value={material.link || ""}
                                          onChange={(value) =>
                                            handleSubMaterialChange(index, subIndex, materialIndex, "link", value)
                                          }
                                          accept=".pdf,.doc,.docx,.txt"
                                          placeholder="Upload material"
                                          className="text-xs"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Sub-session Audio Files */}
                                  <div className="space-y-3">
                                    <Label className="text-xs font-medium text-gray-600">
                                      Audio Files
                                    </Label>
                                    <div className="grid grid-cols-1 gap-3">
                                      <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">English</Label>
                                        <FileUpload
                                          value={subSession.audio_urls?.english || ""}
                                          onChange={(value) =>
                                            handleSubAudioChange(index, subIndex, "english", value)
                                          }
                                          accept="audio/*"
                                          placeholder="English audio"
                                          className="text-xs"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Hindi</Label>
                                        <FileUpload
                                          value={subSession.audio_urls?.hindi || ""}
                                          onChange={(value) =>
                                            handleSubAudioChange(index, subIndex, "hindi", value)
                                          }
                                          accept="audio/*"
                                          placeholder="Hindi audio"
                                          className="text-xs"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Arabic</Label>
                                        <FileUpload
                                          value={subSession.audio_urls?.arabic || ""}
                                          onChange={(value) =>
                                            handleSubAudioChange(index, subIndex, "arabic", value)
                                          }
                                          accept="audio/*"
                                          placeholder="Arabic audio"
                                          className="text-xs"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

            {/* Add Child Session Button */}
            {(!sessionData.child_sessions ||
              sessionData.child_sessions.length === 0) && (
              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Button
                    type="button"
                    onClick={addChildSession}
                    variant="outline"
                    className="hover:bg-violet-50 border-violet-200 text-violet-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Child Sessions Collection
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Convert this session into a collection of multiple sessions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Languages Card */}
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-3">
                  {availableLanguages.map((lang) => (
                    <div
                      key={lang.value}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        id={lang.value}
                        checked={sessionData.languages.includes(lang.value)}
                        onCheckedChange={() =>
                          handleLanguageToggle(lang.value)
                        }
                        className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 data-[state=checked]:text-white [&>span>svg]:text-white"
                      />
                      <Label
                        htmlFor={lang.value}
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {lang.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Actions */}
        <div className="mt-8">
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/sessions")}
                  className="border-gray-200 hover:bg-gray-50 px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
