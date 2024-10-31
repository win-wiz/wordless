import { Mail } from 'lucide-react';

const emailUrl = "support@wordless.online";

interface EmailLinkProps {
  email?: string;
  subject?: string;
  body?: string;
  className?: string;
  children: React.ReactNode;
}

export function EmailLink({ 
  email = emailUrl,
  subject = "Feedback for Wordless Game",
  body = "Hi, I would like to provide feedback about the Wordless game:\n\n",
  className = "inline-flex items-center gap-2 text-zinc-600 hover:text-violet-500 transition-colors underline leading-5 relative top-0.5",
  children 
}: EmailLinkProps) {
  // 构建 mailto URL，直接使用空格而不是编码
  const buildMailtoUrl = () => {
    const subjectParam = subject ? `subject=${subject}` : '';
    const bodyParam = body ? `body=${body}` : '';
    const params = [subjectParam, bodyParam].filter(Boolean).join('&');
    
    // 直接构建 URL，不使用 URLSearchParams
    return `mailto:${email}${params ? '?' + params : ''}`;
  };

  return (
    <a 
      href={buildMailtoUrl()}
      className={className}
    >
      <Mail className="w-4 h-4" />
      {children}
    </a>
  );
}

// 预设的反馈链接组件
export function FeedbackLink() {
  const feedbackBody = `Hi Wordless team,

    I found an issue while playing the game:

    Browser: ${typeof window !== 'undefined' ? window.navigator.userAgent : ''}
    Time: ${new Date().toLocaleString()}

    Issue details:
  `;

  return (
    <EmailLink
      email={emailUrl}
      subject="Bug Report - Wordless Game"
      body={feedbackBody}
    >
      Report an Issue
    </EmailLink>
  );
}

// 预设的支持链接组件
export function SupportLink() {
  return (
    <EmailLink
      email={emailUrl}
      subject="Support Request - Wordless Game"
      body="Hi, I need help with the Wordless game."
    >
      Contact Support
    </EmailLink>
  );
} 