"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Code, Database, Globe, Shield, Cloud, Search, Sparkles, Plus, BookMarked, Lightbulb } from "lucide-react"
import { LEARNING_TOPICS } from "@/constants"
import { useQuery } from "@tanstack/react-query"

interface TopicSelectorProps {
  onTopicSelect: (topicId: string, subtopic: string, difficulty: string) => void
  isLoading?: boolean
}

interface Module {
  id: string
  title: string
  description: string
  steps: any[]
}

export default function TopicSelector({ onTopicSelect, isLoading = false }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("beginner")
  const [searchQuery, setSearchQuery] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [activeTab, setActiveTab] = useState("predefined")

  // Fetch user's modules
  const { data: userModules } = useQuery<Module[]>({
    queryKey: ['user-modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules')
      if (!response.ok) throw new Error('Failed to fetch modules')
      return response.json()
    }
  })

  const getTopicIcon = (topicId: string) => {
    switch (topicId) {
      case "programming-basics":
        return <Code className="w-6 h-6" />
      case "web-development":
        return <Globe className="w-6 h-6" />
      case "data-science":
        return <Database className="w-6 h-6" />
      case "mobile-development":
        return <Code className="w-6 h-6" />
      case "cybersecurity":
        return <Shield className="w-6 h-6" />
      case "cloud-computing":
        return <Cloud className="w-6 h-6" />
      default:
        return <BookOpen className="w-6 h-6" />
    }
  }

  const filteredTopics = LEARNING_TOPICS.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.subtopics.some(subtopic => subtopic.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredModules = userModules?.filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const selectedTopicData = LEARNING_TOPICS.find(topic => topic.id === selectedTopic)
  const selectedModuleData = userModules?.find(module => module.id === selectedTopic)

  const handleStartLearning = () => {
    if (activeTab === "custom" && customTopic.trim()) {
      // For custom topics, use the custom topic as both topic and subtopic
      onTopicSelect("custom", customTopic.trim(), difficulty)
    } else if (activeTab === "modules" && selectedTopic) {
      // For modules, use the module ID with prefix and module title as subtopic
      onTopicSelect(`module_${selectedTopic}`, selectedModuleData?.title || "", difficulty)
    } else if (selectedTopic && selectedSubtopic) {
      onTopicSelect(selectedTopic, selectedSubtopic, difficulty)
    }
  }

  const handleModuleSelect = (moduleId: string) => {
    setSelectedTopic(moduleId)
    setSelectedSubtopic("") // Reset subtopic when switching to module
  }

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelect("custom", customTopic.trim(), difficulty)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            AI Learning Assistant
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a topic you'd like to learn about. You can select from predefined topics, your own modules, or enter any custom topic you want to explore.
        </p>
      </div>

      {/* Topic Selection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predefined" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Predefined Topics</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center space-x-2">
            <BookMarked className="w-4 h-4" />
            <span>My Modules</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4" />
            <span>Custom Topic</span>
          </TabsTrigger>
        </TabsList>

        {/* Predefined Topics Tab */}
        <TabsContent value="predefined" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search predefined topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Topic Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic) => (
              <Card
                key={topic.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTopic === topic.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedTopic(topic.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      {getTopicIcon(topic.id)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1">
                    {topic.subtopics.slice(0, 3).map((subtopic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {subtopic}
                      </Badge>
                    ))}
                    {topic.subtopics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{topic.subtopics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Modules Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.length > 0 ? (
              filteredModules.map((module) => (
                <Card
                  key={module.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTopic === module.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleModuleSelect(module.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <BookMarked className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {module.steps?.length || 0} steps
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Your Module
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No modules found</h3>
                <p className="text-muted-foreground">Create some modules first or try the predefined topics.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Custom Topic Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>Learn Any Topic</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-topic">What would you like to learn about?</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="custom-topic"
                    placeholder="e.g., Machine Learning, React Hooks, Python Data Structures..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomTopicSubmit()}
                  />
                  <Button
                    onClick={handleCustomTopicSubmit}
                    disabled={!customTopic.trim()}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Examples of custom topics:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• React Hooks and State Management</div>
                  <div>• Python Data Structures</div>
                  <div>• Machine Learning Basics</div>
                  <div>• Web Security Fundamentals</div>
                  <div>• Docker and Containerization</div>
                  <div>• GraphQL vs REST APIs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Panel */}
      {(selectedTopicData || selectedModuleData || (activeTab === "custom" && customTopic)) && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {activeTab === "custom" ? (
                <Lightbulb className="w-5 h-5" />
              ) : selectedModuleData ? (
                <BookMarked className="w-5 h-5" />
              ) : (
                getTopicIcon(selectedTopicData?.id || "")
              )}
              <span>Learning Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTab !== "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="subtopic">Specific Topic</Label>
                  <Select value={selectedSubtopic} onValueChange={setSelectedSubtopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a specific topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTopicData?.subtopics.map((subtopic, index) => (
                        <SelectItem key={index} value={subtopic}>
                          {subtopic}
                        </SelectItem>
                      ))}
                      {selectedModuleData && (
                        <SelectItem value={selectedModuleData.title}>
                          {selectedModuleData.title}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleStartLearning}
              disabled={!selectedSubtopic && activeTab !== "custom"}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Session...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Start Learning Session</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
