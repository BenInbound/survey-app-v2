import { QuestionTemplateManager, DEFAULT_TEMPLATES } from '../question-templates'
import { QuestionTemplate, StrategicFocus } from '../types'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('QuestionTemplateManager', () => {
  let templateManager: QuestionTemplateManager
  
  beforeEach(() => {
    mockLocalStorage.clear()
    templateManager = new QuestionTemplateManager()
  })

  describe('DEFAULT_TEMPLATES', () => {
    it('should contain all strategic focus templates', () => {
      expect(DEFAULT_TEMPLATES).toHaveLength(6)
      
      const expectedFocuses: StrategicFocus[] = [
        'strategic-alignment',
        'innovation-growth', 
        'leadership-culture',
        'operational-excellence',
        'performance-results',
        'digital-transformation'
      ]
      
      expectedFocuses.forEach(focus => {
        const template = DEFAULT_TEMPLATES.find(t => t.strategicFocus === focus)
        expect(template).toBeDefined()
        expect(template!.isDefault).toBe(true)
      })
    })

    it('should have properly ordered questions in each template', () => {
      DEFAULT_TEMPLATES.forEach(template => {
        template.questions.forEach((question, index) => {
          expect(question.order).toBe(index + 1)
        })
      })
    })

    it('should have strategic alignment as default template', () => {
      const defaultTemplate = templateManager.getDefaultTemplate()
      expect(defaultTemplate.id).toBe('strategic-alignment')
      expect(defaultTemplate.strategicFocus).toBe('strategic-alignment')
    })
  })

  describe('getAllTemplates', () => {
    it('should return default templates when no custom templates exist', () => {
      const templates = templateManager.getAllTemplates()
      expect(templates).toEqual(DEFAULT_TEMPLATES)
    })

    it('should include custom templates with default templates', () => {
      const customTemplate: Omit<QuestionTemplate, 'id' | 'createdAt' | 'isDefault'> = {
        name: 'Custom Strategy Template',
        description: 'Custom strategic assessment',
        strategicFocus: 'custom',
        questions: [
          { id: 'custom-1', text: 'Custom question 1', category: 'Custom', order: 1 },
          { id: 'custom-2', text: 'Custom question 2', category: 'Custom', order: 2 }
        ]
      }
      
      templateManager.saveCustomTemplate(customTemplate)
      
      const allTemplates = templateManager.getAllTemplates()
      expect(allTemplates.length).toBe(DEFAULT_TEMPLATES.length + 1)
      expect(allTemplates.find(t => t.name === 'Custom Strategy Template')).toBeDefined()
    })
  })

  describe('getCustomTemplates', () => {
    it('should return empty array when no custom templates exist', () => {
      const customTemplates = templateManager.getCustomTemplates()
      expect(customTemplates).toEqual([])
    })

    it('should return custom templates when they exist', () => {
      const customTemplate: Omit<QuestionTemplate, 'id' | 'createdAt' | 'isDefault'> = {
        name: 'Marketing Focus',
        description: 'Marketing strategic assessment',
        strategicFocus: 'custom',
        questions: [
          { id: 'marketing-1', text: 'Marketing question 1', category: 'Marketing', order: 1 }
        ]
      }
      
      templateManager.saveCustomTemplate(customTemplate)
      
      const customTemplates = templateManager.getCustomTemplates()
      expect(customTemplates).toHaveLength(1)
      expect(customTemplates[0].name).toBe('Marketing Focus')
    })
  })

  describe('saveCustomTemplate', () => {
    it('should save a new custom template with generated ID', () => {
      const templateData: Omit<QuestionTemplate, 'id' | 'createdAt' | 'isDefault'> = {
        name: 'Sales Excellence',
        description: 'Sales focused assessment',
        strategicFocus: 'custom',
        questions: [
          { id: 'sales-1', text: 'Sales performance question', category: 'Sales', order: 1 }
        ]
      }
      
      const savedTemplate = templateManager.saveCustomTemplate(templateData)
      
      expect(savedTemplate.id).toBeDefined()
      expect(savedTemplate.name).toBe('Sales Excellence')
      expect(savedTemplate.isDefault).toBe(false)
      expect(savedTemplate.createdAt).toBeInstanceOf(Date)
    })

    it('should persist custom template to localStorage', () => {
      const templateData: Omit<QuestionTemplate, 'id' | 'createdAt' | 'isDefault'> = {
        name: 'HR Focus',
        description: 'Human resources assessment',
        strategicFocus: 'leadership-culture',
        questions: [
          { id: 'hr-1', text: 'HR question', category: 'HR', order: 1 }
        ]
      }
      
      templateManager.saveCustomTemplate(templateData)
      
      const customTemplates = templateManager.getCustomTemplates()
      expect(customTemplates).toHaveLength(1)
      expect(customTemplates[0].name).toBe('HR Focus')
    })

    it('should generate unique IDs for templates', () => {
      const template1 = templateManager.saveCustomTemplate({
        name: 'Template 1',
        description: 'First template',
        strategicFocus: 'custom',
        questions: []
      })
      
      const template2 = templateManager.saveCustomTemplate({
        name: 'Template 2', 
        description: 'Second template',
        strategicFocus: 'custom',
        questions: []
      })
      
      expect(template1.id).not.toBe(template2.id)
    })
  })

  describe('deleteCustomTemplate', () => {
    it('should delete an existing custom template', () => {
      const savedTemplate = templateManager.saveCustomTemplate({
        name: 'To Delete',
        description: 'Will be deleted',
        strategicFocus: 'custom',
        questions: []
      })
      
      expect(templateManager.getCustomTemplates()).toHaveLength(1)
      
      templateManager.deleteCustomTemplate(savedTemplate.id)
      
      expect(templateManager.getCustomTemplates()).toHaveLength(0)
    })

    it('should not affect other custom templates when deleting one', () => {
      const template1 = templateManager.saveCustomTemplate({
        name: 'Keep This',
        description: 'Keep this one',
        strategicFocus: 'custom',
        questions: []
      })
      
      const template2 = templateManager.saveCustomTemplate({
        name: 'Delete This',
        description: 'Delete this one',
        strategicFocus: 'custom',
        questions: []
      })
      
      templateManager.deleteCustomTemplate(template2.id)
      
      const remaining = templateManager.getCustomTemplates()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].name).toBe('Keep This')
    })
  })

  describe('template structure validation', () => {
    it('should have proper question categories in strategic alignment template', () => {
      const strategicTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'strategic-alignment')!
      
      const categories = Array.from(new Set(strategicTemplate.questions.map(q => q.category)))
      expect(categories).toContain('Vision & Strategy')
      expect(categories).toContain('Leadership & Culture')
      expect(categories).toContain('Operations & Performance')
    })

    it('should have appropriate number of questions per template', () => {
      const expectedCounts = {
        'strategic-alignment': 8,
        'innovation-growth': 10, 
        'leadership-culture': 12,
        'operational-excellence': 8,
        'performance-results': 6,
        'digital-transformation': 10
      }
      
      Object.entries(expectedCounts).forEach(([templateId, expectedCount]) => {
        const template = DEFAULT_TEMPLATES.find(t => t.id === templateId)!
        expect(template.questions).toHaveLength(expectedCount)
      })
    })

    it('should have valid question IDs in all templates', () => {
      DEFAULT_TEMPLATES.forEach(template => {
        template.questions.forEach(question => {
          expect(question.id).toBeTruthy()
          expect(typeof question.id).toBe('string')
          expect(question.id.length).toBeGreaterThan(0)
        })
      })
    })
  })
})