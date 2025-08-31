'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  User, 
  Search, 
  Grid,
  List,
  Sparkles,
  Trash2,
  MoreVertical,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/ui/back-button'
import { CreateModuleForm } from '@/components/dashboard/CreateModuleForm'
import { AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useModules, useDeleteModule, useDebugModules, useDeletedModules, useRestoreModule } from '@/hooks/queries/use-modules'
import { toast } from 'sonner'
import { ConfirmationModal, useConfirmationModal } from '@/components/ui/confirmation-modal'

interface Module {
  id: string
  title: string
  description: string | null
  createdAt: string
  creator: {
    id: string
    name: string | null
  } | null
  _count: {
    steps: number
    quizzes: number
  }
}

function ModulesPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  // Confirmation modal
  const { modalState, openModal, closeModal } = useConfirmationModal()

  // Check if we should show create form based on URL parameter
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateForm(true)
      // Clean up the URL
      router.replace('/modules')
    }
  }, [searchParams, router])

  // Fetch modules using centralized hook
  const { data: modules = [], isLoading: modulesLoading } = useModules()
  
  // Delete module mutation using centralized hook
  const deleteModuleMutation = useDeleteModule()
  
  // Deleted modules functionality
  const { data: deletedModules = [], isLoading: deletedModulesLoading } = useDeletedModules()
  const restoreModuleMutation = useRestoreModule()
  
  // Debug modules using centralized hook
  const debugModulesQuery = useDebugModules()

  // Filter modules based on search query and current view
  const currentModules = showDeleted ? deletedModules : modules
  const filteredModules = currentModules.filter((module: Module) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const title = module.title.toLowerCase()
    const description = (module.description || '').toLowerCase()
    const creator = (module.creator?.name || '').toLowerCase()
    
    return title.includes(query) || 
           description.includes(query) || 
           creator.includes(query)
  })

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

  // Debug function to check modules
  const debugModules = async () => {
    try {
      await debugModulesQuery.refetch()
      const data = debugModulesQuery.data
      if (data) {
        console.log('Debug response:', data)
        toast.success(`Found ${data.totalModules} total modules, ${data.userModuleCount} user modules`)
      }
    } catch (error) {
      console.error('Debug error:', error)
      toast.error('Debug failed')
    }
  }

  const handleModuleClick = (moduleId: string) => {
    router.push(`/modules/${moduleId}`)
  }

  const handleDeleteModule = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation()
    openModal({
      title: 'Remove Module',
      message: 'Are you sure you want to remove this module from your dashboard? You can restore it later from the Deleted tab.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: () => {
        deleteModuleMutation.mutate(moduleId)
        closeModal()
      }
    })
  }

  const handleRestoreModule = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation()
    openModal({
      title: 'Restore Module',
      message: 'Are you sure you want to restore this module to your dashboard?',
      confirmText: 'Restore',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        restoreModuleMutation.mutate(moduleId)
        closeModal()
      }
    })
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">Loading modules...</div>
        </div>
      </div>
    )
  }

  // Show loading state while session is being fetched
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  // Don't render anything if user is not authenticated (middleware will handle redirect)
  if (!user) return null

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.02),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.02),transparent_50%)]" />
      </div>

      {/* Main Content */}
      <div className="relative pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <BackButton href="/dashboard">
                Back to Dashboard
              </BackButton>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Learning Modules
              </h1>
              <p className="text-muted-foreground text-lg">
                Explore and create comprehensive learning experiences
              </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 p-1">
                <Button
                  variant={!showDeleted ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowDeleted(false)}
                  className="px-4 cursor-pointer"
                >
                  Active Modules
                </Button>
                <Button
                  variant={showDeleted ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowDeleted(true)}
                  className="px-4 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deleted ({deletedModules.length})
                </Button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={showDeleted ? "Search deleted modules..." : "Search modules..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Create Module Button - Only show for active modules */}
                {!showDeleted && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 cursor-pointer"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Module
                    </Button>
                    <Button
                      onClick={debugModules}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      Debug
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modules Grid/List */}
          {(showDeleted ? deletedModulesLoading : modulesLoading) ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text={`Loading ${showDeleted ? 'deleted' : ''} modules...`} />
            </div>
          ) : filteredModules.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModules.map((module: Module, index: number) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card 
                        className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30"
                        onClick={() => handleModuleClick(module.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold line-clamp-2">
                                {module.title}
                              </CardTitle>
                              {module.description && (
                                <CardDescription className="mt-2 line-clamp-2">
                                  {module.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                              {module.creator?.id === user?.id && (
                                showDeleted ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleRestoreModule(e, module.id)}
                                    className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer"
                                    disabled={restoreModuleMutation.isPending}
                                  >
                                    {restoreModuleMutation.isPending && restoreModuleMutation.variables === module.id ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                                    ) : (
                                      <RotateCcw className="h-3 w-3" />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDeleteModule(e, module.id)}
                                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                    disabled={deleteModuleMutation.isPending}
                                  >
                                    {deleteModuleMutation.isPending && deleteModuleMutation.variables === module.id ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-4">
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
                            <div className="flex items-center space-x-2 text-xs">
                              <span>{module._count.steps} steps</span>
                              <span>•</span>
                              <span>{module._count.quizzes} quiz</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredModules.map((module: Module, index: number) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30"
                        onClick={() => handleModuleClick(module.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <BookOpen className="h-8 w-8 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold mb-1">
                                {module.title}
                              </h3>
                              {module.description && (
                                <p className="text-muted-foreground mb-3 line-clamp-2">
                                  {module.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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
                                <div className="flex items-center space-x-2">
                                  <span>{module._count.steps} steps</span>
                                  <span>•</span>
                                  <span>{module._count.quizzes} quiz</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {showDeleted 
                  ? (searchQuery ? 'No deleted modules found' : 'No deleted modules')
                  : (searchQuery ? 'No modules found' : 'No modules yet')
                }
              </h3>
              <p className="text-muted-foreground mb-6">
                {showDeleted
                  ? (searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Modules you delete will appear here for restoration'
                    )
                  : (searchQuery 
                      ? 'Try adjusting your search terms or create a new module'
                      : 'Create your first learning module to get started'
                    )
                }
              </p>
              {!showDeleted && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 cursor-pointer"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your First Module
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Module Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateModuleForm onClose={() => setShowCreateForm(false)} />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        variant={modalState.variant}
        isLoading={deleteModuleMutation.isPending || restoreModuleMutation.isPending}
      />
    </div>
  )
}

export default function ModulesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">Loading modules...</div>
        </div>
      </div>
    }>
      <ModulesPageContent />
    </Suspense>
  )
}
