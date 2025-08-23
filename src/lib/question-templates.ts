import { Question, QuestionTemplate, StrategicFocus, QuestionLibraryState } from './types'

const createTemplate = (
  id: string,
  name: string,
  description: string,
  strategicFocus: StrategicFocus,
  questions: Omit<Question, 'order'>[]
): QuestionTemplate => ({
  id,
  name,
  description,
  strategicFocus,
  questions: questions.map((q, index) => ({ ...q, order: index + 1 })),
  createdAt: new Date('2025-01-01'), // Fixed date for default templates
  isDefault: true
})

const strategicAlignmentQuestions: Omit<Question, 'order'>[] = [
  { id: 'vision-clarity', text: 'Our organization has a clear and compelling vision for the future', category: 'Vision & Strategy' },
  { id: 'strategy-execution', text: 'We consistently execute on our strategic priorities', category: 'Vision & Strategy' },
  { id: 'leadership-alignment', text: 'Leadership is aligned on strategic direction and priorities', category: 'Leadership & Culture' },
  { id: 'stakeholder-buyin', text: 'Key stakeholders are committed to our strategic direction', category: 'Vision & Strategy' },
  { id: 'strategic-communication', text: 'Strategic priorities are clearly communicated throughout the organization', category: 'Leadership & Culture' },
  { id: 'resource-allocation', text: 'Resources are allocated effectively to support strategic objectives', category: 'Operations & Performance' },
  { id: 'strategic-metrics', text: 'We have clear metrics to track progress on strategic initiatives', category: 'Operations & Performance' },
  { id: 'strategic-agility', text: 'We can adapt our strategy quickly when circumstances change', category: 'Innovation & Agility' }
]

const innovationGrowthQuestions: Omit<Question, 'order'>[] = [
  { id: 'innovation-capability', text: 'Our organization fosters innovation and adapts quickly to change', category: 'Innovation & Agility' },
  { id: 'market-responsiveness', text: 'We respond quickly to changing market conditions', category: 'Market & Customer' },
  { id: 'growth-mindset', text: 'Our culture embraces experimentation and learning from failure', category: 'Leadership & Culture' },
  { id: 'change-agility', text: 'We manage change effectively throughout the organization', category: 'Innovation & Agility' },
  { id: 'customer-innovation', text: 'We consistently innovate to meet evolving customer needs', category: 'Market & Customer' },
  { id: 'technology-adoption', text: 'We effectively adopt and integrate new technologies', category: 'Innovation & Agility' },
  { id: 'competitive-advantage', text: 'We maintain competitive advantages through innovation', category: 'Market & Customer' },
  { id: 'innovation-investment', text: 'We invest appropriately in research and development', category: 'Operations & Performance' },
  { id: 'creative-environment', text: 'We provide an environment that encourages creative thinking', category: 'Leadership & Culture' },
  { id: 'innovation-execution', text: 'We successfully convert innovative ideas into business results', category: 'Operations & Performance' }
]

const leadershipCultureQuestions: Omit<Question, 'order'>[] = [
  { id: 'leadership-effectiveness', text: 'Leadership provides clear direction and inspiration', category: 'Leadership & Culture' },
  { id: 'team-collaboration', text: 'Teams collaborate effectively across the organization', category: 'Leadership & Culture' },
  { id: 'employee-engagement', text: 'Employees are highly engaged and motivated', category: 'Leadership & Culture' },
  { id: 'cultural-alignment', text: 'Our organizational culture supports our strategic objectives', category: 'Leadership & Culture' },
  { id: 'leadership-development', text: 'We effectively develop leadership capabilities at all levels', category: 'Leadership & Culture' },
  { id: 'communication-effectiveness', text: 'Communication flows effectively throughout the organization', category: 'Leadership & Culture' },
  { id: 'talent-retention', text: 'We retain our top talent and key contributors', category: 'Leadership & Culture' },
  { id: 'performance-culture', text: 'We have a culture of high performance and accountability', category: 'Leadership & Culture' },
  { id: 'diversity-inclusion', text: 'We foster diversity and inclusion throughout the organization', category: 'Leadership & Culture' },
  { id: 'employee-empowerment', text: 'Employees are empowered to make decisions and take ownership', category: 'Leadership & Culture' },
  { id: 'feedback-culture', text: 'We have a culture of constructive feedback and continuous improvement', category: 'Leadership & Culture' },
  { id: 'values-alignment', text: 'Employee behaviors consistently align with our organizational values', category: 'Leadership & Culture' }
]

const operationalExcellenceQuestions: Omit<Question, 'order'>[] = [
  { id: 'operational-efficiency', text: 'Our processes and operations run smoothly and efficiently', category: 'Operations & Performance' },
  { id: 'quality-management', text: 'We consistently deliver high-quality products and services', category: 'Operations & Performance' },
  { id: 'performance-metrics', text: 'We have clear metrics and KPIs to measure operational performance', category: 'Operations & Performance' },
  { id: 'continuous-improvement', text: 'We continuously improve our processes and operations', category: 'Operations & Performance' },
  { id: 'cost-management', text: 'We effectively manage costs while maintaining quality', category: 'Operations & Performance' },
  { id: 'supply-chain', text: 'Our supply chain and vendor relationships are well managed', category: 'Operations & Performance' },
  { id: 'risk-management', text: 'We effectively identify and manage operational risks', category: 'Operations & Performance' },
  { id: 'scalability', text: 'Our operations can scale effectively with business growth', category: 'Operations & Performance' }
]

const performanceResultsQuestions: Omit<Question, 'order'>[] = [
  { id: 'financial-performance', text: 'We consistently meet our financial targets and goals', category: 'Operations & Performance' },
  { id: 'goal-achievement', text: 'We consistently achieve our key business objectives', category: 'Operations & Performance' },
  { id: 'performance-accountability', text: 'There is clear accountability for performance results', category: 'Leadership & Culture' },
  { id: 'measurement-systems', text: 'We have effective systems to measure and track performance', category: 'Operations & Performance' },
  { id: 'performance-transparency', text: 'Performance results are transparently communicated', category: 'Leadership & Culture' },
  { id: 'corrective-action', text: 'We take timely corrective action when performance falls short', category: 'Operations & Performance' }
]

const digitalTransformationQuestions: Omit<Question, 'order'>[] = [
  { id: 'technology-adoption', text: 'We effectively adopt and integrate new technologies', category: 'Innovation & Agility' },
  { id: 'digital-capabilities', text: 'We have strong digital capabilities and competencies', category: 'Innovation & Agility' },
  { id: 'process-digitization', text: 'Our business processes are effectively digitized', category: 'Operations & Performance' },
  { id: 'data-driven-decisions', text: 'We make decisions based on data and analytics', category: 'Operations & Performance' },
  { id: 'digital-customer-experience', text: 'We deliver excellent digital customer experiences', category: 'Market & Customer' },
  { id: 'digital-culture', text: 'Our culture embraces digital ways of working', category: 'Leadership & Culture' },
  { id: 'cybersecurity', text: 'We have robust cybersecurity and data protection measures', category: 'Operations & Performance' },
  { id: 'digital-skills', text: 'Our workforce has the digital skills needed for success', category: 'Leadership & Culture' },
  { id: 'automation', text: 'We effectively automate routine processes and tasks', category: 'Operations & Performance' },
  { id: 'digital-innovation', text: 'We leverage technology to drive innovation and competitive advantage', category: 'Innovation & Agility' }
]

export const DEFAULT_TEMPLATES: QuestionTemplate[] = [
  createTemplate(
    'strategic-alignment',
    'Strategic Alignment Focus',
    'Focus on vision clarity, strategy execution, and organizational alignment',
    'strategic-alignment',
    strategicAlignmentQuestions
  ),
  createTemplate(
    'innovation-growth',
    'Innovation & Growth Focus',
    'Emphasize innovation capability, market responsiveness, and growth mindset',
    'innovation-growth',
    innovationGrowthQuestions
  ),
  createTemplate(
    'leadership-culture',
    'Leadership & Culture Focus',
    'Deep dive into leadership effectiveness and organizational culture',
    'leadership-culture',
    leadershipCultureQuestions
  ),
  createTemplate(
    'operational-excellence',
    'Operational Excellence Focus',
    'Concentrate on process efficiency, quality, and operational performance',
    'operational-excellence',
    operationalExcellenceQuestions
  ),
  createTemplate(
    'performance-results',
    'Performance & Results Focus',
    'Focus on goal achievement, accountability, and performance measurement',
    'performance-results',
    performanceResultsQuestions
  ),
  createTemplate(
    'digital-transformation',
    'Digital Transformation Focus',
    'Evaluate digital capabilities, technology adoption, and digital culture',
    'digital-transformation',
    digitalTransformationQuestions
  )
]

export class QuestionTemplateManager {
  private readonly STORAGE_KEY = 'question-library-v1'

  getDefaultTemplate(): QuestionTemplate {
    return DEFAULT_TEMPLATES.find(t => t.id === 'strategic-alignment')!
  }

  getAllTemplates(): QuestionTemplate[] {
    const customTemplates = this.getCustomTemplates()
    return [...DEFAULT_TEMPLATES, ...customTemplates]
  }

  getCustomTemplates(): QuestionTemplate[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const library: QuestionLibraryState = JSON.parse(stored)
      return library.templates
    } catch (error) {
      console.warn('Failed to load custom templates:', error)
      return []
    }
  }

  saveCustomTemplate(template: Omit<QuestionTemplate, 'id' | 'createdAt' | 'isDefault'>): QuestionTemplate {
    const newTemplate: QuestionTemplate = {
      ...template,
      id: this.generateTemplateId(template.name),
      createdAt: new Date(),
      isDefault: false
    }

    const customTemplates = this.getCustomTemplates()
    const updatedTemplates = [...customTemplates, newTemplate]

    this.saveCustomTemplates(updatedTemplates)
    return newTemplate
  }

  deleteCustomTemplate(templateId: string): void {
    const customTemplates = this.getCustomTemplates()
    const filteredTemplates = customTemplates.filter(t => t.id !== templateId)
    this.saveCustomTemplates(filteredTemplates)
  }

  private saveCustomTemplates(templates: QuestionTemplate[]): void {
    if (typeof window === 'undefined') return

    const library: QuestionLibraryState = {
      templates,
      lastModified: new Date()
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(library))
  }

  private generateTemplateId(name: string): string {
    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)
    
    return `${baseId}-${Date.now()}`
  }
}

export const questionTemplateManager = new QuestionTemplateManager()