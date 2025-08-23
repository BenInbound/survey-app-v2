import OpenAI from 'openai'
import { CategoryAverage } from '@/components/ui/SpiderChart'
import { OrganizationalAssessment, ComparativeAnalysis } from './types'

interface SummaryContext {
  categoryAverages: CategoryAverage[]
  overallAverage: number
  totalResponses: number
  department?: string
}

export function formatSummaryPrompt(context: SummaryContext): string {
  const { categoryAverages, overallAverage, totalResponses, department } = context
  
  const categoryScores = categoryAverages
    .map(cat => `- ${cat.category}: ${cat.average}/10 (based on ${cat.responses} question${cat.responses !== 1 ? 's' : ''})`)
    .join('\n')

  return `You are analyzing results from a strategic organizational assessment survey. Please provide a concise business summary (2-3 paragraphs maximum) of the following results:

SURVEY RESULTS:
- Overall Average Score: ${overallAverage}/10
- Total Questions Answered: ${totalResponses}
${department ? `- Department: ${department}` : ''}

CATEGORY BREAKDOWN:
${categoryScores}

Please provide:
1. A brief interpretation of the overall performance
2. Key strengths (highest scoring categories)
3. Areas for improvement (lowest scoring categories)
4. 2-3 specific strategic recommendations

Keep the tone professional and actionable for business leadership. Focus on insights that would help guide strategic decision-making.`
}

export async function generateSummary(context: SummaryContext): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const prompt = formatSummaryPrompt(context)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    const summary = completion.choices[0]?.message?.content
    
    if (!summary) {
      throw new Error('No summary generated from OpenAI API')
    }

    return summary.trim()
  } catch (error) {
    console.error('Error generating AI summary:', error)
    throw new Error('Failed to generate summary. Please try again later.')
  }
}

export function getSummaryStatistics(categoryAverages: CategoryAverage[], overallAverage: number) {
  const highestCategory = categoryAverages.reduce((max, cat) => 
    cat.average > max.average ? cat : max
  )
  
  const lowestCategory = categoryAverages.reduce((min, cat) => 
    cat.average < min.average ? cat : min
  )

  const scoreDistribution = {
    excellent: categoryAverages.filter(cat => cat.average >= 8).length,
    good: categoryAverages.filter(cat => cat.average >= 6 && cat.average < 8).length,
    needs_improvement: categoryAverages.filter(cat => cat.average < 6).length,
  }

  return {
    highestCategory,
    lowestCategory,
    scoreDistribution,
    overallPerformance: overallAverage >= 7 ? 'strong' : overallAverage >= 5 ? 'moderate' : 'needs_attention'
  }
}

export async function generateOrganizationalSummary(
  assessment: OrganizationalAssessment,
  comparativeAnalysis: ComparativeAnalysis
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.')
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })

  const prompt = `You are a strategic management consultant analyzing organizational assessment data for ${assessment.organizationName}. 

ASSESSMENT DATA:
- Management responses: ${assessment.responseCount.management} participants
- Employee responses: ${assessment.responseCount.employee} participants
- Overall alignment score: ${comparativeAnalysis.overallAlignment.toFixed(1)}%

DETAILED GAP ANALYSIS:
${comparativeAnalysis.gapAnalysis.map(gap => 
  `${gap.category}: Management ${gap.managementScore.toFixed(1)}, Employee ${gap.employeeScore.toFixed(1)}, Gap: ${gap.gap.toFixed(1)} (${gap.significance} significance)`
).join('\n')}

CRITICAL GAPS:
${comparativeAnalysis.criticalGaps.length > 0 ? comparativeAnalysis.criticalGaps.join(', ') : 'None identified'}

Please provide a comprehensive strategic analysis that includes:

1. EXECUTIVE SUMMARY (2-3 sentences)
   - Overall organizational health assessment
   - Key finding about management-employee alignment

2. CRITICAL INSIGHTS (3-4 key points)
   - Most significant perception gaps and their implications
   - Areas where alignment is strong
   - Strategic risks from misalignment

3. STRATEGIC RECOMMENDATIONS (4-5 actionable items)
   - Immediate actions to address critical gaps
   - Communication strategies to improve alignment  
   - Long-term organizational development priorities

4. IMPLEMENTATION PRIORITIES
   - What to tackle first and why
   - Success metrics to track progress

Format your response in clear sections with headers. Focus on actionable insights that leadership can immediately implement. Be specific about the business impact of perception gaps.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert organizational development consultant specializing in strategic alignment analysis. Provide actionable, business-focused insights.'
        },
        {
          role: 'user', 
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })

    const summary = completion.choices[0]?.message?.content

    if (!summary) {
      throw new Error('No summary generated from OpenAI API')
    }

    return summary.trim()
  } catch (error) {
    console.error('Error generating organizational summary:', error)
    throw new Error('Failed to generate organizational insights. Please try again later.')
  }
}