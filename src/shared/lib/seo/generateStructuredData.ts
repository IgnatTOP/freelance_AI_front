/**
 * Генерация структурированных данных (JSON-LD) для SEO
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    contactType: string;
    email?: string;
    telephone?: string;
  };
  sameAs?: string[];
}

export interface WebSiteSchema {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export interface ArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
}

export interface PersonSchema {
  name: string;
  url?: string;
  jobTitle?: string;
  image?: string;
  sameAs?: string[];
}

export interface ServiceSchema {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed?: string;
  serviceType?: string;
}

/**
 * Генерация JSON-LD для организации
 */
export function generateOrganizationSchema(data: OrganizationSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
    ...(data.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: data.contactPoint.contactType,
        ...(data.contactPoint.email && { email: data.contactPoint.email }),
        ...(data.contactPoint.telephone && { telephone: data.contactPoint.telephone }),
      },
    }),
    ...(data.sameAs && { sameAs: data.sameAs }),
  };
}

/**
 * Генерация JSON-LD для веб-сайта
 */
export function generateWebSiteSchema(data: WebSiteSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    ...(data.description && { description: data.description }),
    ...(data.potentialAction && {
      potentialAction: {
        '@type': data.potentialAction['@type'],
        target: {
          '@type': data.potentialAction.target['@type'],
          urlTemplate: data.potentialAction.target.urlTemplate,
        },
        'query-input': data.potentialAction['query-input'],
      },
    }),
  };
}

/**
 * Генерация JSON-LD для хлебных крошек
 */
export function generateBreadcrumbSchema(data: BreadcrumbSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Генерация JSON-LD для статьи
 */
export function generateArticleSchema(data: ArticleSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    ...(data.image && { image: data.image }),
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
    ...(data.author && {
      author: {
        '@type': 'Person',
        name: data.author.name,
        ...(data.author.url && { url: data.author.url }),
      },
    }),
  };
}

/**
 * Генерация JSON-LD для персоны
 */
export function generatePersonSchema(data: PersonSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    ...(data.url && { url: data.url }),
    ...(data.jobTitle && { jobTitle: data.jobTitle }),
    ...(data.image && { image: data.image }),
    ...(data.sameAs && { sameAs: data.sameAs }),
  };
}

/**
 * Генерация JSON-LD для услуги
 */
export function generateServiceSchema(data: ServiceSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    provider: {
      '@type': 'Organization',
      name: data.provider.name,
      url: data.provider.url,
    },
    ...(data.areaServed && { areaServed: data.areaServed }),
    ...(data.serviceType && { serviceType: data.serviceType }),
  };
}

/**
 * Генерация JSON-LD для фриланс-платформы
 */
export function generateFreelancePlatformSchema(baseUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Modern Freelance',
    url: baseUrl,
    description: 'Умная фриланс-биржа с ИИ-ассистентом',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/orders?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

