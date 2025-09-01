// AI Tutor Types

export interface LearningTopic {
  id: string
  title: string
  description: string
  subtopics: string[]
}

export interface AiTutorConfig {
  voice: string
  assistant: {
    name: string
    role: string
    personality: string
    teachingStyle: string
  }
}

export interface AiTutorPrompts {
  welcome: string
  topicIntroduction: (topic: string) => string
  explanation: string
  example: string
  question: string
  encouragement: string
}

export interface LearningSession {
  title: string
  introduction: string
  keyConcepts: string[]
  examples: string[]
  challenges: string[]
  bestPractices: string[]
  questions: string[]
}

export interface AiConversation {
  id: string
  title: string
  userId: string
  moduleId?: string
  createdAt: Date
  updatedAt: Date
  messages: AiMessage[]
}

export interface AiMessage {
  id: string
  role: 'USER' | 'AI'
  content: string
  conversationId: string
  createdAt: Date
}

export interface SavedMessage {
  role: 'user' | 'system' | 'assistant'
  content: string
}

export interface CallStatus {
  INACTIVE: 'INACTIVE'
  CONNECTING: 'CONNECTING'
  ACTIVE: 'ACTIVE'
  FINISHED: 'FINISHED'
}

export interface AiTutorAgentProps {
  userName: string
  userId: string
  conversationId: string
  topic?: string
  onMessageUpdate?: (messages: SavedMessage[]) => void
}

export interface TopicSelectorProps {
  onTopicSelect: (topicId: string, subtopic: string, difficulty: string) => void
  isLoading?: boolean
}
