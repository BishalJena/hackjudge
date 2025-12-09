/**
 * HackJudge AI - Landing Page
 * Terminal-styled entry point with GitHub OAuth and repo URL input
 */
import { LandingPageClient } from './landing-client';

export const metadata = {
  title: 'HackJudge AI - Autonomous Hackathon Review Agent',
  description: 'Get instant, holistic feedback on your hackathon projects. AI-powered code review, UX analysis, and performance auditing.',
};

export default function LandingPage() {
  return <LandingPageClient />;
}
