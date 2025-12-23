import { APP_NAME, APP_URL } from './index'

export const SEO_TEXTS = {
  defaultTitle: `${APP_NAME} - Advanced AI Chat, Content Creator & Website Generator`,

  titleTemplate: `%s | ${APP_NAME} - The All-in-One AI Assistant`,

  ogTitle: `Better than ChatGPT? Meet ${APP_NAME} - Chat, Draw & Build Apps`,
  ogImageAlt: `${APP_NAME} Interface - AI Chat, Image Generation and Code Building`,
  previewImageAlt: `Preview of ${APP_NAME} capabilities`,

  defaultDescription:
    'The ultimate AI assistant for everyone. Chat with advanced AI, generate stunning images, write professional content, and build websites instantly. A powerful alternative to ChatGPT and ChatOn with more features.',

  keywords: [
    'Lummie',
    'Lummie App',
    'AI Assistant',
    'AI Chatbot',

    'AI Content Generator',
    'AI Writer',
    'text generation',
    'smart assistant',
    'natural language processing',

    'AI Image Generator',
    'text to image',
    'create art with AI',

    'text to website',
    'AI app builder',
    'generate websites',
    'code assistant',

    'ChatGPT alternative',
    'ChatOn alternative',
    'Grok AI alternative',
    'Jasper alternative',
    'multimodal AI',
    'all-in-one AI tool',
  ],

  ogLocale: 'en_US',
  ogType: 'website',
  ogImage: {
    url: '/og-image.png',
    width: 1200,
    height: 630,
  },

  twitterCard: 'summary_large_image' as const,
  twitterCreator: '@lummie_app',
}

export const PAGE_SEO = {
  home: {
    title: SEO_TEXTS.defaultTitle,
    description: SEO_TEXTS.defaultDescription,
  },
  about: {
    title: 'About Lummie AI',
    description: `Lummie is a next-generation AI platform combining the best of text, image, and code generation. We aim to provide more features than standard AI chatbots.`,
  },
  pricing: {
    title: 'Pro Plans & Pricing',
    description:
      'Get access to premium AI models, unlimited image generation, and website building features. One subscription replaces 5 different tools.',
  },
  contact: {
    title: 'Contact Support',
    description:
      'Need help using Lummie AI? Contact our support team for assistance with chat, API, or subscription inquiries.',
  },
  enterprise: {
    title: 'Lummie for Business',
    description:
      'Empower your team with an all-in-one AI solution. Secure chat, content generation, and rapid prototyping for enterprises.',
  },
  resources: {
    title: 'AI Prompts & Tutorials',
    description:
      'Learn how to write better prompts for AI chat, generate professional images, and create websites using Lummie.',
  },
  profile: {
    title: 'Your Workspace',
    description:
      'Manage your AI chats, saved images, and generated projects in one dashboard.',
  },
  cookie: {
    title: 'Cookie Policy',
    description: 'How Lummie uses cookies to enhance your AI experience.',
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'We respect your data privacy. Learn how Lummie handles your chat history and generated content.',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using the Lummie AI platform.',
  },
  platformRules: {
    title: 'Content Guidelines',
    description:
      'Guidelines for safe and responsible AI content generation on Lummie.',
  },
}

export const createOpenGraphMetadata = (
  title?: string,
  description?: string,
  url?: string
) => ({
  title: title ? `${title} | ${APP_NAME}` : SEO_TEXTS.ogTitle,
  description: description || SEO_TEXTS.defaultDescription,
  url: url || APP_URL,
  siteName: APP_NAME,
  images: [
    {
      url: SEO_TEXTS.ogImage.url,
      width: SEO_TEXTS.ogImage.width,
      height: SEO_TEXTS.ogImage.height,
      alt: title ? `${APP_NAME} - ${title}` : SEO_TEXTS.ogImageAlt,
    },
  ],
  locale: SEO_TEXTS.ogLocale,
  type: SEO_TEXTS.ogType,
})

export const createTwitterMetadata = (
  title?: string,
  description?: string
) => ({
  card: SEO_TEXTS.twitterCard,
  title: title ? `${title} | ${APP_NAME}` : SEO_TEXTS.ogTitle,
  description: description || SEO_TEXTS.defaultDescription,
  images: [SEO_TEXTS.ogImage.url],
  creator: SEO_TEXTS.twitterCreator,
})
