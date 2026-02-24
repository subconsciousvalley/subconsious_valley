"use client"
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import Image from "next/image";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug;
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, currentLanguage } = useLanguage();

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    const loadPost = async () => {
      try {
        const response = await fetch('/api/blog-posts');
        const posts = await response.json();
        const foundPost = posts.find(p => p.slug === slug);
        setPost(foundPost);
      } catch (error) {
        console.error('Error loading blog post:', error);
      }
      setIsLoading(false);
    };

    loadPost();
  }, [slug]);
  
  const getTranslated = (item, field) => {
    if (!item) return "";
    const langField = `${field}_${currentLanguage}`;
    return item[langField] || item[field];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center text-center p-4">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-red-600 mb-4">Post Not Found</h2>
            <p className="text-slate-600 mb-6">The article you are looking for does not exist.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="outline" className="cursor-pointer bg-white text-slate-700 hover:bg-slate-100 border-black">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            {post.featured_image && (
              <CardHeader className="p-0">
                <div className="aspect-video">
                  <Image 
                    src={post.featured_image} 
                    alt={getTranslated(post, 'title')} 
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    priority
                    quality={85}
                  />
                </div>
              </CardHeader>
            )}
            <CardContent className="p-6 md:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                {getTranslated(post, 'title')}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-6">
                 <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Subconscious Valley</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{post?.createdAt ? format(new Date(post.createdAt), "MMMM d, yyyy") : "Recent"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time || 5} {t('min_read')}</span>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className=" text-gray-700 border-black-300">{tag}</Badge>
                  ))}
                </div>
              )}

              <article className="prose prose-lg max-w-none prose-teal">
                <div>
                  {(() => {
                    const lines = getTranslated(post, 'content').split('\n');
                    const elements = [];
                    let currentList = [];
                    
                    lines.forEach((line, index) => {
                      if (line.startsWith('- ')) {
                        const renderText = (text) => {
                          const parts = text.split(/\*\*(.+?)\*\*/);
                          return parts.map((part, i) => 
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                          );
                        };
                        
                        currentList.push(
                          <li key={index} className="mb-2 text-slate-700">
                            {renderText(line.replace('- ', ''))}
                          </li>
                        );
                      } else {
                        if (currentList.length > 0) {
                          elements.push(
                            <ul key={`list-${index}`} className="list-disc pl-6 mb-6 text-slate-700">
                              {currentList}
                            </ul>
                          );
                          currentList = [];
                        }
                        
                        if (line.startsWith('## ')) {
                          elements.push(
                            <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-slate-800">
                              {line.replace('## ', '')}
                            </h2>
                          );
                        } else if (line.startsWith('**') && line.endsWith('**')) {
                          elements.push(
                            <p key={index} className="font-bold mb-4 text-slate-800">
                              {line.replace(/\*\*/g, '')}
                            </p>
                          );
                        } else if (line.trim()) {
                          const renderText = (text) => {
                            const parts = text.split(/\*\*(.+?)\*\*/);
                            return parts.map((part, i) => 
                              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                            );
                          };
                          
                          elements.push(
                            <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                              {renderText(line)}
                            </p>
                          );
                        }
                      }
                    });
                    
                    if (currentList.length > 0) {
                      elements.push(
                        <ul key="final-list" className="list-disc pl-6 mb-6 text-slate-700">
                          {currentList}
                        </ul>
                      );
                    }
                    
                    return elements;
                  })()}
                </div>
              </article>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}