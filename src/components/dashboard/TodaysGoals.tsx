'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Plus, 
  CheckCircle, 
  Trash2, 
  Loader2 
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTodaysGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/queries/use-dashboard'
import { ConfirmationModal, useConfirmationModal } from '@/components/ui/confirmation-modal'

export function TodaysGoals() {
  const [newTask, setNewTask] = useState('')
  const { data: goals = [], isLoading, error } = useTodaysGoals()
  const createGoalMutation = useCreateGoal()
  const updateGoalMutation = useUpdateGoal()
  const deleteGoalMutation = useDeleteGoal()
  const { modalState, openModal, closeModal } = useConfirmationModal()

  const handleAddGoal = async () => {
    if (!newTask.trim()) return
    
    try {
      await createGoalMutation.mutateAsync(newTask.trim())
      setNewTask('')
    } catch (error) {
      console.error('Failed to add goal:', error)
    }
  }

  const handleToggleGoal = async (id: string, completed: boolean) => {
    try {
      await updateGoalMutation.mutateAsync({ id, data: { completed: !completed } })
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const handleDeleteGoal = (id: string, task: string) => {
    openModal({
      title: 'Delete Goal',
      message: `Are you sure you want to delete "${task}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await deleteGoalMutation.mutateAsync(id)
          closeModal()
        } catch (error) {
          console.error('Failed to delete goal:', error)
        }
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddGoal()
    }
  }

  const completedGoals = goals.filter(goal => goal.completed)
  const pendingGoals = goals.filter(goal => !goal.completed)

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Today's Goals</h3>
            <p className="text-sm text-muted-foreground">
              {completedGoals.length} of {goals.length} completed
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Add New Goal */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a new goal..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={createGoalMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleAddGoal}
              disabled={!newTask.trim() || createGoalMutation.isPending}
              size="sm"
              className="shrink-0 cursor-pointer"
            >
              {createGoalMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Failed to load goals</p>
            </div>
          )}

          {/* Goals List */}
          {!isLoading && !error && (
            <div className="space-y-2">
              <AnimatePresence>
                {/* Pending Goals */}
                {pendingGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-foreground/30 transition-colors"
                  >
                    <button
                      onClick={() => handleToggleGoal(goal.id, goal.completed)}
                      disabled={updateGoalMutation.isPending}
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-muted-foreground/30 hover:border-foreground/50 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      {updateGoalMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                    
                    <span className="flex-1 text-sm text-foreground">
                      {goal.task}
                    </span>
                    
                    <button
                      onClick={() => handleDeleteGoal(goal.id, goal.task)}
                      disabled={deleteGoalMutation.isPending}
                      className="flex-shrink-0 w-5 h-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}

                {/* Completed Goals */}
                {completedGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <button
                      onClick={() => handleToggleGoal(goal.id, goal.completed)}
                      disabled={updateGoalMutation.isPending}
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-foreground bg-foreground flex items-center justify-center cursor-pointer"
                    >
                      <CheckCircle className="w-3 h-3 text-background" />
                    </button>
                    
                    <span className="flex-1 text-sm text-muted-foreground line-through">
                      {goal.task}
                    </span>
                    
                    <button
                      onClick={() => handleDeleteGoal(goal.id, goal.task)}
                      disabled={deleteGoalMutation.isPending}
                      className="flex-shrink-0 w-5 h-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {goals.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No goals yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first goal to start tracking your progress
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

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
        isLoading={deleteGoalMutation.isPending}
      />
    </>
  )
}
