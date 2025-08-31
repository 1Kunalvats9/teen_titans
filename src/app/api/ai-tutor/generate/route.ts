import { NextResponse } from 'next/server'
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LEARNING_TOPICS } from '@/constants'

export async function POST(request: Request) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topicId, subtopic, difficulty = 'beginner' } = await request.json()

    let selectedTopic = null
    let topicTitle = subtopic
    let topicDescription = ""

    // Handle different topic types
    if (topicId === "custom") {
      // Custom topic - use the subtopic as the topic
      selectedTopic = {
        id: "custom",
        title: subtopic,
        description: `Custom learning session about ${subtopic}`
      }
      topicTitle = subtopic
      topicDescription = `A comprehensive learning session about ${subtopic}`
    } else if (topicId.startsWith("module_")) {
      // Module-based topic
      const moduleId = topicId.replace("module_", "")
      const userModule = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { steps: true }
      })
      
      if (!userModule) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }
      
      selectedTopic = {
        id: `module_${moduleId}`,
        title: userModule.title,
        description: userModule.description || `Learning session based on ${userModule.title}`
      }
      topicTitle = userModule.title
      topicDescription = userModule.description || `A comprehensive learning session about ${userModule.title}`
    } else {
      // Predefined topic
      selectedTopic = LEARNING_TOPICS.find(topic => topic.id === topicId)
      if (!selectedTopic) {
        return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })
      }
      topicTitle = selectedTopic.title
      topicDescription = selectedTopic.description
    }

    // Generate learning content using AI
    const { text: learningContent } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Create a comprehensive learning session for ${subtopic || topicTitle}.
        
        The difficulty level is: ${difficulty}
        The topic is: ${topicTitle}
        The topic description is: ${topicDescription}
        The specific subtopic is: ${subtopic || 'General overview'}
        
        Please create a structured learning session that includes:
        1. Introduction to the concept
        2. Key principles and fundamentals
        3. Practical examples and use cases
        4. Common challenges and solutions
        5. Best practices and tips
        6. Interactive questions to test understanding
        
        The content should be:
        - Clear and easy to understand
        - Suitable for ${difficulty} level learners
        - Include real-world examples
        - Encourage active learning
        - Use a friendly, encouraging tone
        - Adapt to the specific topic context
        
        Format the response as a structured learning session that can be delivered by a voice assistant.
        Avoid using special characters that might break voice synthesis.
        
        Return the content in this format:
        {
          "title": "Session Title",
          "introduction": "Introduction text",
          "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
          "examples": ["Example 1", "Example 2"],
          "challenges": ["Challenge 1", "Challenge 2"],
          "bestPractices": ["Practice 1", "Practice 2"],
          "questions": ["Question 1", "Question 2", "Question 3"]
        }
      `,
    })

    // Parse the generated content
    let parsedContent
    try {
      parsedContent = JSON.parse(learningContent)
    } catch (error) {
      // Fallback if JSON parsing fails
      parsedContent = {
        title: `${topicTitle} - ${subtopic || 'Learning Session'}`,
        introduction: learningContent,
        keyConcepts: [],
        examples: [],
        challenges: [],
        bestPractices: [],
        questions: []
      }
    }

    // Create AI conversation in database
    const conversation = await prisma.aiConversation.create({
      data: {
        title: parsedContent.title,
        userId: session.user.id,
        moduleId: topicId.startsWith("module_") ? topicId.replace("module_", "") : null,
        messages: {
          create: [
            {
              role: 'AI',
              content: `Welcome to your learning session on ${parsedContent.title}! I'm Alisha, your AI tutor. Let's begin with an introduction to this topic.`
            }
          ]
        }
      },
      include: {
        messages: true
      }
    })

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      content: parsedContent,
      topic: selectedTopic
    })
  } catch (error) {
    console.error('AI Tutor generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate learning session',
      success: false
    }, { status: 500 })
  }
}
