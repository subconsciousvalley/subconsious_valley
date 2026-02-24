"use client";
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { useRouter } from 'next/navigation';
import { uploadToCloudflare } from '@/utils/uploadToCloudflare';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CreateBlogPost() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    tags: '',
    published: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        window.location.href = `/blog?created=${Date.now()}`;
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (file instanceof File) {
      setFormData(prev => ({...prev, featured_image: file.name}));
      setUploading(true);
      try {
        const uploadedUrl = await uploadToCloudflare(file);
        setFormData(prev => ({...prev, featured_image: uploadedUrl}));
      } catch (error) {
        console.error('Error uploading image:', error);
        setFormData(prev => ({...prev, featured_image: ''}));
      } finally {
        setUploading(false);
      }
    } else {
      setFormData(prev => ({...prev, featured_image: file}));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative">
      {saving && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            <span className="text-slate-700">Creating blog post...</span>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Button 
            onClick={() => router.push("/blog")}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Create New Blog Post
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Write and publish a new blog post for your audience
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700 mb-2 block">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Enter blog post title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-sm font-medium text-slate-700 mb-2 block">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="url-friendly-slug"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="featured_image" className="text-sm font-medium text-slate-700 mb-2 block">Featured Image</Label>
                    <FileUpload
                      value={formData.featured_image}
                      onChange={handleImageUpload}
                      accept="image/*"
                      placeholder={uploading ? "Uploading..." : "Enter image URL or upload file"}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    {uploading && (
                      <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Content
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="excerpt" className="text-sm font-medium text-slate-700 mb-2 block">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      rows={3}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Brief description of the blog post..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content" className="text-sm font-medium text-slate-700 mb-2 block">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={20}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 font-mono text-sm"
                      placeholder="Write your blog post content here..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags" className="text-sm font-medium text-slate-700 mb-2 block">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="wellness, meditation, health"
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-end items-center space-x-3">
                  <Button 
                    type="button" 
                    onClick={() => router.push('/blog')} 
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                  >
                    {saving ? 'Creating...' : 'Create Blog Post'}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                Publishing
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <Label htmlFor="published" className="text-sm font-medium text-slate-700">Published Status</Label>
                    <p className="text-xs text-slate-500">Make this post visible to readers</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData({...formData, published: e.target.checked})}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label htmlFor="published" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {formData.featured_image && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-teal-600 rounded-full mr-3"></div>
                  Featured Image Preview
                </h3>
                <Image 
                  src={formData.featured_image} 
                  alt="Featured" 
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg border border-slate-200"
                  quality={85}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}