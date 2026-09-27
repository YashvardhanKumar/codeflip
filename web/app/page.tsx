import type { Metadata } from 'next'
import LandingPageContent from '@/components/landing-page-content'

export const metadata: Metadata = {
  title:
    'CodeFlip - Outpace the Rest | Competitive Coding, Contests & DSA Solutions',
  description:
    'Master algorithms and data structures on CodeFlip. Compete in weekly live coding contests, read in-depth problem editorials, and use AI to write community discussions.',
  alternates: {
    canonical: 'https://www.codeflip.co.in',
  },
  openGraph: {
    title:
      'CodeFlip - Outpace the Rest | Competitive Coding, Contests & DSA Solutions',
    description:
      'Master algorithms and data structures on CodeFlip. Compete in weekly live coding contests, read in-depth problem editorials, and use AI to write community discussions.',
    url: 'https://www.codeflip.co.in',
  },
}

const faqData = [
  {
    question: 'What is CodeFlip and how does it help developers?',
    answer:
      'CodeFlip is a competitive coding and algorithm preparation platform. It helps software engineers master data structures and algorithms (DSA), prepare for technical interviews at top tech companies, and participate in live competitive programming races.',
  },
  {
    question: 'How do live coding contests work on CodeFlip?',
    answer:
      'CodeFlip hosts timed, ranked coding contests where participants solve algorithmic problems under time constraints. Submissions are judged in real-time by sandboxed runners, updating your rating and the global leaderboard dynamically.',
  },
  {
    question: 'What problem editorials and solutions are provided?',
    answer:
      'Every challenge includes step-by-step problem editorials with intuition, mathematical proofs, time and space complexity (Big-O) analysis, and multi-language solutions in Python, C++, Java, and TypeScript.',
  },
  {
    question: 'How does writing discussion using AI work on CodeFlip?',
    answer:
      'CodeFlip integrates an intelligent AI assistant that helps you format discussion posts, generate edge cases, analyze code complexity, and structure explanations with code syntax highlighting and mathematical notation.',
  },
  {
    question: 'Which programming languages can I code in?',
    answer:
      'CodeFlip provides isolated runner environments for C++ (GCC), Python 3, Java, JavaScript (Node.js), and TypeScript with instant execution feedback.',
  },
  {
    question: 'Is CodeFlip free to use?',
    answer:
      'Yes, CodeFlip is completely free to create an account, solve coding challenges, join contests, read editorials, and participate in discussion forums.',
  },
]

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CodeFlip',
  description:
    'Competitive coding platform, live developer contests, problem editorials, and AI-assisted discussions.',
  url: 'https://www.codeflip.co.in',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CodeFlip',
  url: 'https://www.codeflip.co.in',
  logo: 'https://www.codeflip.co.in/logo.svg',
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingPageContent faqData={faqData} />
    </>
  )
}
