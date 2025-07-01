'use client'

import { useState, useCallback } from 'react';
import { Share2, Copy, Twitter, Facebook, Linkedin, Mail, Link, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { cn, generateQuickShareText } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  url?: string;
  wordLength?: number;
  gameResult?: {
    isWin: boolean;
    attempts: number;
    maxAttempts: number;
    word: string;
    totalTime: number;
    wordLength: number;
    pattern?: string;
  };
}

export function ShareDialog({ 
  isOpen, 
  onClose, 
  title = "Share Wordless Game",
  description = "Challenge your friends with this word puzzle game!",
  url,
  wordLength = 5,
  gameResult 
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.origin : '');

  const generateShareText = useCallback(() => {
    if (gameResult) {
      const { isWin, attempts, maxAttempts, word, totalTime, wordLength, pattern } = gameResult;
      const minutes = Math.floor(totalTime / 60);
      const seconds = totalTime % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      
      return `🎯 Wordless Game Result!\n\n${isWin ? '✅ SUCCESS!' : '❌ Challenge Incomplete'}\n📊 ${attempts}/${maxAttempts} attempts\n⏱️ Time: ${timeStr}\n🔤 ${wordLength}-letter word${isWin ? '' : `: ${word.toUpperCase()}`}\n\n${pattern ? pattern + '\n\n' : ''}🔗 Play Wordless Game: ${shareUrl}\n\n#WordlessGame #WordPuzzle #BrainGame`;
    } else {
      return generateQuickShareText(wordLength);
    }
  }, [gameResult, wordLength, shareUrl]);

  const copyText = useCallback(async () => {
    try {
      const text = generateShareText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy content');
    }
  }, [generateShareText]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Link copied!');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  }, [shareUrl]);

  const shareViaWebAPI = useCallback(async () => {
    if (!navigator.share) {
      copyText();
      return;
    }

    try {
      await navigator.share({
        title: title,
        text: generateShareText(),
        url: shareUrl,
      });
      toast.success('Shared successfully!');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        copyText();
      }
    }
  }, [title, generateShareText, shareUrl, copyText]);

  const shareOnTwitter = useCallback(() => {
    const text = encodeURIComponent(generateShareText());
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }, [generateShareText]);

  const shareOnFacebook = useCallback(() => {
    const url = encodeURIComponent(shareUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'width=580,height=400');
  }, [shareUrl]);

  const shareOnLinkedIn = useCallback(() => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(generateShareText());
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
    window.open(linkedinUrl, '_blank', 'width=520,height=570');
  }, [shareUrl, generateShareText]);

  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent('Check out this word puzzle game!');
    const body = encodeURIComponent(`${generateShareText()}\n\nTry it here: ${shareUrl}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  }, [generateShareText, shareUrl]);

  const shareOptions = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      action: shareOnTwitter,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      action: shareOnFacebook,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      action: shareOnLinkedIn,
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-gray-50 hover:text-gray-700',
      action: shareViaEmail,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 rounded-full">
                <Share2 className="w-4 h-4 text-violet-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                {title}
              </DialogTitle>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/50"
            >
              <X className="w-4 h-4" />
            </Button> */}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            
            <Button
              onClick={shareViaWebAPI}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition-all duration-200"
            >
              <Share2 size={18} />
              Share Now
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={copyText}
                className="flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-gray-50"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              
              <Button
                variant="outline"
                onClick={copyLink}
                className="flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-gray-50"
              >
                {copiedLink ? <Check size={16} className="text-green-600" /> : <Link size={16} />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Share On</h3>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={option.action}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 h-auto rounded-xl border-2 transition-all duration-200",
                    option.color
                  )}
                >
                  <option.icon size={24} />
                  <span className="text-sm font-medium">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <details className="group">
            <summary className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              <span>Preview share content</span>
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-700 whitespace-pre-line border max-h-40 overflow-y-auto">
              {generateShareText()}
            </div>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
} 