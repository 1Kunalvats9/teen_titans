'use client'

import { useState, useMemo } from 'react'
import { Search, X, BookOpen, Clock, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Module {
  id: string
  title: string
  description: string | null
  createdAt: string
  creator: {
    name: string | null
  } | null
}

export function ModuleSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  // Fetch all modules
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await api.get('/api/modules')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fuzzy search implementation
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    const results = modules
      .filter((module: Module) => {
        const title = module.title.toLowerCase()
        const description = (module.description || '').toLowerCase()
        const creator = (module.creator?.name || '').toLowerCase()
        
        return title.includes(query) || 
               description.includes(query) || 
               creator.includes(query)
      })
      .sort((a: Module, b: Module) => {
        const aTitle = a.title.toLowerCase()
        const bTitle = b.title.toLowerCase()
        
        // Exact title match gets highest priority
        if (aTitle === query) return -1
        if (bTitle === query) return 1
        
        // Title starts with query gets second priority
        if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1
        if (bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1
        
        // Sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 5) // Limit to 5 results
    
    return results
  }, [modules, searchQuery])

  const handleSearchFocus = () => {
    setIsExpanded(true)
  }

  const handleSearchBlur = () => {
    // Delay to allow clicking on results
    setTimeout(() => {
      if (!searchQuery.trim()) {
        setIsExpanded(false)
      }
    }, 200)
  }

  const handleModuleClick = (moduleId: string) => {
    router.push(`/modules/${moduleId}`)
    setSearchQuery('')
    setIsExpanded(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsExpanded(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="pl-10 pr-10 h-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isExpanded && (searchQuery.trim() || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <Card className="shadow-xl border-border/50 bg-background/95 backdrop-blur-md">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Searching...</p>
                    </div>
                  ) : filteredModules.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {filteredModules.map((module: Module, index: number) => (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/20 last:border-b-0 transition-colors duration-150"
                          onClick={() => handleModuleClick(module.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {module.title}
                              </h4>
                              {module.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {module.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(module.createdAt)}</span>
                                </div>
                                {module.creator?.name && (
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>{module.creator.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="p-4 text-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No modules found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try different keywords or create a new module
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
