import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface GenerateRequest {
  topic: string
  description?: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface GeneratedContent {
  prerequisites: string[]
  outline: { title: string; description: string }[]
  steps: { title: string; content: string }[]
  quiz: QuizQuestion[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body: GenerateRequest = await request.json()
    const { topic, description = '' } = body

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Topic must be at least 3 characters long' },
        { status: 400 }
      )
    }

    // Get user's persona for personalized content
    const persona = user.persona || 'default'
    
    // Generate content using Gemini
    const generatedContent = await generateModuleContent(topic, description, persona)

    // Create module with all related data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('Starting module creation transaction...')
      
      // Create the module
      const moduleData = await tx.module.create({
        data: {
          title: topic,
          description: description || `A comprehensive learning module about ${topic}`,
          creatorId: user.id,
          isPublic: true
        }
      })
      
      console.log('Module created:', moduleData.id)

      // Create steps
      console.log('Creating steps...')
      await Promise.all(
        generatedContent.steps.map((step, index) =>
          tx.step.create({
            data: {
              title: step.title,
              content: step.content,
              order: index + 1,
              moduleId: moduleData.id
            }
          })
        )
      )
      console.log('Steps created successfully')

      // Create quiz
      console.log('Creating quiz...')
      const quiz = await tx.quiz.create({
        data: {
          title: `${topic} Quiz`,
          moduleId: moduleData.id
        }
      })
      console.log('Quiz created:', quiz.id)

      // Create questions and options
      await Promise.all(
        generatedContent.quiz.map(async (quizItem) => {
          const question = await tx.question.create({
            data: {
              text: quizItem.question,
              explanation: quizItem.explanation,
              quizId: quiz.id
            }
          })

          await Promise.all(
            quizItem.options.map((option, index) =>
              tx.option.create({
                data: {
                  text: option,
                  isCorrect: index === quizItem.correctAnswer,
                  questionId: question.id
                }
              })
            )
          )
        })
      )

      return { moduleId: moduleData.id }
    })

    console.log('Module created successfully:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating module:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate module'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

async function generateModuleContent(
  topic: string, 
  description: string, 
  persona: string
): Promise<GeneratedContent> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  // Get persona-specific instructions
  const personaInstructions = getPersonaInstructions(persona)
  
  // Helper function to add delay between API calls
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  // Step 1: Generate prerequisites
  const prerequisitesPrompt = `
You are an expert educator with ${personaInstructions}.
Generate a list of prerequisites for learning "${topic}".
${description ? `Additional context: ${description}` : ''}

Return ONLY a valid JSON array of strings, no markdown formatting, no code blocks, no explanations.
Example: ["Basic programming concepts", "Understanding of variables and functions"]

Requirements:
- Keep prerequisites realistic and achievable
- Focus on foundational knowledge
- Return ONLY the JSON array, nothing else
- Do not use markdown formatting or code blocks
`

  const prerequisitesResult = await model.generateContent(prerequisitesPrompt)
  const prerequisitesText = prerequisitesResult.response.text()
  
  // Clean the response to extract JSON
  let cleanText = prerequisitesText.trim()
  // Remove markdown code blocks if present
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '')
  }
  
  let prerequisites
  try {
    prerequisites = JSON.parse(cleanText)
  } catch (error) {
    console.error('Failed to parse prerequisites JSON:', cleanText)
    // Fallback to basic prerequisites
    prerequisites = ["Basic knowledge of the subject", "Willingness to learn"]
  }

  // Add delay to avoid rate limiting
  await delay(2000)

  // Step 2: Generate module outline
  const outlinePrompt = `
You are an expert educator with ${personaInstructions}.
Create a structured learning outline for "${topic}".
${description ? `Additional context: ${description}` : ''}

Return ONLY a valid JSON array of objects with "title" and "description" fields, no markdown formatting, no code blocks, no explanations.
Example: [
  {
    "title": "Introduction to React Hooks",
    "description": "Understanding what hooks are and why they were introduced"
  }
]

Requirements:
- Create 5-8 logical learning steps
- Each step should build upon the previous
- Make titles clear and descriptive
- Return ONLY the JSON array, nothing else
- Do not use markdown formatting or code blocks
`

  const outlineResult = await model.generateContent(outlinePrompt)
  const outlineText = outlineResult.response.text()
  
  // Clean the response to extract JSON
  let cleanOutlineText = outlineText.trim()
  // Remove markdown code blocks if present
  if (cleanOutlineText.startsWith('```json')) {
    cleanOutlineText = cleanOutlineText.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (cleanOutlineText.startsWith('```')) {
    cleanOutlineText = cleanOutlineText.replace(/^```\n/, '').replace(/\n```$/, '')
  }
  
  let outline
  try {
    outline = JSON.parse(cleanOutlineText)
  } catch (error) {
    console.error('Failed to parse outline JSON:', cleanOutlineText)
    // Fallback to basic outline
    outline = [
      {
        title: `Introduction to ${topic}`,
        description: `Getting started with ${topic}`
      },
      {
        title: `Core Concepts of ${topic}`,
        description: `Understanding the fundamental concepts`
      },
      {
        title: `Advanced Topics in ${topic}`,
        description: `Exploring advanced features and techniques`
      }
    ]
  }

  // Add delay to avoid rate limiting
  await delay(2000)

  // Step 3: Generate detailed content for all steps in one call
  const allStepsPrompt = `
You are an expert educator with ${personaInstructions}.
Create detailed educational content for all steps in learning "${topic}".

${description ? `Additional context: ${description}` : ''}

Steps to create content for:
${outline.map((item: { title: string; description: string }, index: number) => `${index + 1}. ${item.title}`).join('\n')}

Requirements:
- Write in a clear, engaging style that's easy to understand
- Structure content with clear headings using markdown (## for main sections, ### for subsections)
- Include practical examples and real-world applications
- Add "Example:" sections with concrete examples
- Include "Tip:" sections with helpful advice and best practices
- Add "Warning:" sections for common pitfalls or important notes
- Include "Summary:" sections at the end of each step
- Use bullet points and numbered lists for better organization
- Include code examples if relevant with proper formatting:
  * Use \`\`\`language for code blocks (e.g., \`\`\`javascript, \`\`\`python, \`\`\`html)
  * Include proper indentation with spaces (2-4 spaces per level)
  * Add line breaks (\n) for readability
  * Use descriptive variable names and comments
  * Show both simple and complex examples
- Make content comprehensive but digestible
- Use analogies and metaphors to explain complex concepts
- Include interactive elements like "Try this:" suggestions
- Structure from beginner to advanced concepts progressively
- Ensure all text content wraps properly without horizontal scrolling
- Return ONLY a JSON array with this exact format:
[
  {
    "title": "Step Title",
    "content": "## Introduction\n\nClear explanation of the concept...\n\n## Key Concepts\n\n- Point 1\n- Point 2\n- Point 3\n\n## Example\n\nHere's a practical example:\n\n\`\`\`javascript\nfunction example() {\n  // This is a well-formatted code example\n  const result = doSomething();\n  return result;\n}\n\`\`\`\n\n## Tip\n\nPro tip for better understanding...\n\n## Summary\n\nKey takeaways from this step..."
  }
]

Return ONLY the JSON array, no other text, no markdown formatting.
`

  const allStepsResult = await model.generateContent(allStepsPrompt)
  const allStepsText = allStepsResult.response.text()
  
  // Clean the response to extract JSON
  let cleanStepsText = allStepsText.trim()
  if (cleanStepsText.startsWith('```json')) {
    cleanStepsText = cleanStepsText.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (cleanStepsText.startsWith('```')) {
    cleanStepsText = cleanStepsText.replace(/^```\n/, '').replace(/\n```$/, '')
  }
  
  let steps
  try {
    steps = JSON.parse(cleanStepsText)
    // Ensure we have the right number of steps
    if (steps.length !== outline.length) {
      throw new Error('Step count mismatch')
    }
  } catch (error) {
    console.error('Failed to parse steps JSON:', cleanStepsText)
    // Fallback: generate basic content for each step
    steps = outline.map((item: { title: string; description: string }, index: number) => ({
      title: item.title,
      content: `## Introduction to ${item.title}\n\nWelcome to step ${index + 1} of ${outline.length} in your journey to master ${topic}.\n\n${item.description}\n\n## Key Concepts\n\n- Understanding the fundamentals of ${item.title.toLowerCase()}\n- Practical applications in real-world scenarios\n- Best practices and industry standards\n- Common patterns and techniques\n\n## Example\n\nHere's a practical example to help you understand ${item.title.toLowerCase()} better:\n\n\`\`\`javascript\n// Example code demonstration\nfunction demonstrate${item.title.replace(/\s+/g, '')}() {\n  // This is a basic example\n  const example = "Hello, World!";\n  console.log(example);\n  \n  // More advanced usage\n  const advanced = {\n    concept: "${item.title}",\n    level: "beginner",\n    description: "${item.description}"\n  };\n  \n  return advanced;\n}\n\`\`\`\n\n## Tip\n\nPro tip: Start with the basics and gradually build up your understanding. Practice regularly to reinforce your learning.\n\n## Summary\n\nIn this step, you've learned the essential aspects of ${item.title.toLowerCase()}. Remember to practice and apply these concepts in your own projects.`
    }))
  }

  // Add delay to avoid rate limiting
  await delay(2000)

  // Step 4: Generate quiz
  const quizPrompt = `
You are an expert educator with ${personaInstructions}.
Create a multiple-choice quiz for the topic "${topic}".

Based on the content we've created, generate 5 quiz questions that test understanding.

Return ONLY a valid JSON array with this exact format, no markdown formatting, no code blocks, no explanations:
[
  {
    "question": "What is the main purpose of React Hooks?",
    "options": [
      "To make components faster",
      "To use state and other React features in functional components",
      "To replace class components entirely",
      "To improve code readability"
    ],
    "correctAnswer": 1,
    "explanation": "React Hooks allow functional components to use state and other React features that were previously only available in class components."
  }
]

Requirements:
- 5 questions total
- Each question should have 4 options
- correctAnswer should be the 0-based index of the correct option
- Include clear explanations for correct answers
- Questions should test different aspects of the topic
- Return ONLY the JSON array, nothing else
- Do not use markdown formatting or code blocks
`

  const quizResult = await model.generateContent(quizPrompt)
  const quizText = quizResult.response.text()
  
  // Clean the response to extract JSON
  let cleanQuizText = quizText.trim()
  // Remove markdown code blocks if present
  if (cleanQuizText.startsWith('```json')) {
    cleanQuizText = cleanQuizText.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (cleanQuizText.startsWith('```')) {
    cleanQuizText = cleanQuizText.replace(/^```\n/, '').replace(/\n```$/, '')
  }
  
  let quiz
  try {
    quiz = JSON.parse(cleanQuizText)
  } catch (error) {
    console.error('Failed to parse quiz JSON:', cleanQuizText)
    // Fallback to basic quiz
    quiz = [
      {
        question: `What is the main purpose of ${topic}?`,
        options: [
          "To make things easier",
          "To solve specific problems",
          "To improve efficiency",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: `${topic} serves multiple purposes including making things easier, solving problems, and improving efficiency.`
      }
    ]
  }

  return {
    prerequisites,
    outline,
    steps,
    quiz
  }
}

function getPersonaInstructions(persona: string): string {
  const personas: Record<string, string> = {
    'einstein': 'the teaching style of Albert Einstein - making complex concepts simple and intuitive, using thought experiments and analogies',
    'steve-jobs': 'the presentation style of Steve Jobs - focusing on the big picture, storytelling, and making technology feel magical',
    'socrates': 'the Socratic method - asking questions to guide discovery, encouraging critical thinking and self-reflection',
    'default': 'a clear, engaging teaching style that makes complex topics accessible to learners of all levels'
  }
  
  return personas[persona] || personas.default
}
