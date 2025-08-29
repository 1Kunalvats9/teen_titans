/*
  # Add onboarding step tracking

  1. Schema Changes
    - Add `onboardingStep` column to `User` table to track onboarding progress
    - Default value is 0 (not started)
    - Values: 0 = not started, 1 = persona selected, 2 = profile image uploaded, 3 = completed

  2. Data Migration
    - Set existing users with `isOnboarded = true` to step 3 (completed)
    - Keep new users at step 0
*/

-- Add onboarding step column to User table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'onboardingStep'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "onboardingStep" INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update existing onboarded users to completed step
UPDATE "User" 
SET "onboardingStep" = 3 
WHERE "isOnboarded" = true AND "onboardingStep" = 0;