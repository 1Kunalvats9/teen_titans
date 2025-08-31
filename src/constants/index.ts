// AI Tutor Configuration
export const AI_TUTOR_CONFIG = {
  voice: "Alisha - Soft and Engaging", // ElevenLabs voice
  assistant: {
    name: "Alisha",
    role: "AI Learning Assistant",
    personality: "friendly, patient, and encouraging",
    teachingStyle: "adaptive, with clear explanations and relevant examples"
  }
};

// Learning Topics for AI Tutor
export const LEARNING_TOPICS = [
  {
    id: "programming-basics",
    title: "Programming Fundamentals",
    description: "Learn the basics of programming concepts",
    subtopics: ["Variables & Data Types", "Control Structures", "Functions", "Object-Oriented Programming"]
  },
  {
    id: "web-development",
    title: "Web Development",
    description: "Master modern web development technologies",
    subtopics: ["HTML & CSS", "JavaScript", "React", "Node.js", "Databases"]
  },
  {
    id: "data-science",
    title: "Data Science & AI",
    description: "Explore data analysis and artificial intelligence",
    subtopics: ["Python", "Statistics", "Machine Learning", "Data Visualization"]
  },
  {
    id: "mobile-development",
    title: "Mobile App Development",
    description: "Build mobile applications for iOS and Android",
    subtopics: ["React Native", "Flutter", "Mobile UI/UX", "App Store Deployment"]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    description: "Learn about digital security and ethical hacking",
    subtopics: ["Network Security", "Cryptography", "Penetration Testing", "Security Best Practices"]
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing",
    description: "Master cloud platforms and services",
    subtopics: ["AWS", "Azure", "Google Cloud", "DevOps", "Containerization"]
  }
];

// AI Tutor Prompts
export const AI_TUTOR_PROMPTS = {
  welcome: "Hello! I'm Alisha, your AI learning assistant. I'm here to help you learn and understand various topics in technology. I'll explain concepts clearly, provide relevant examples, and answer your questions. What would you like to learn about today?",
  
  topicIntroduction: (topic: string) => `Great choice! Let's explore ${topic}. I'll guide you through this topic step by step, making sure you understand each concept before moving forward. Feel free to ask questions anytime - I'm here to help you learn at your own pace.`,
  
  explanation: "I'll explain this concept in a clear, structured way. Let me break it down for you...",
  
  example: "Here's a practical example to help you understand this better...",
  
  question: "Do you have any questions about what we've covered so far?",
  
  encouragement: "You're doing great! Learning takes time and practice. Don't hesitate to ask me to explain anything again."
};
