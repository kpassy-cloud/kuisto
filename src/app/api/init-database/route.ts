import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('[INIT] Checking database status...')
    
    // Test connection first
    await db.$queryRaw`SELECT 1`
    console.log('[INIT] Database connection successful')
    
    // Try to count users to check if tables exist
    try {
      const userCount = await db.user.count()
      console.log(`[INIT] Tables exist. User count: ${userCount}`)
      
      return NextResponse.json({
        status: 'success',
        message: 'Database already initialized',
        users: userCount,
        timestamp: new Date().toISOString()
      })
    } catch (tableError: any) {
      console.log('[INIT] Tables do not exist, need to run migration')
      
      return NextResponse.json({
        status: 'error',
        message: 'Tables do not exist in database',
        error: tableError?.message || 'Unknown error',
        solution: 'Run prisma db push locally or call POST /api/init-database',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[INIT] Database check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error?.message || 'Unknown error',
      hint: 'Check that DATABASE_URL is correctly set in Vercel environment variables',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST endpoint to create tables using raw SQL
export async function POST() {
  try {
    console.log('[INIT] Creating tables...')
    
    // Create User table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP(3),
        "name" TEXT,
        "image" TEXT,
        "password" TEXT,
        "role" TEXT NOT NULL DEFAULT 'user',
        "country" TEXT,
        "region" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`)
    
    // Create Account table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");`)
    
    // Create Session table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");`)
    
    // Create VerificationToken table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");`)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");`)
    
    // Create Subscription table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "plan" TEXT NOT NULL DEFAULT 'free',
        "status" TEXT NOT NULL DEFAULT 'active',
        "stripeCustomerId" TEXT,
        "stripeSubscriptionId" TEXT,
        "stripePriceId" TEXT,
        "currentPeriodStart" TIMESTAMP(3),
        "currentPeriodEnd" TIMESTAMP(3),
        "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
        "recipesGenerated" INTEGER NOT NULL DEFAULT 0,
        "mealPlansCreated" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");`)
    
    // Create UserPreferences table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserPreferences" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "vegetarian" BOOLEAN NOT NULL DEFAULT false,
        "vegan" BOOLEAN NOT NULL DEFAULT false,
        "glutenFree" BOOLEAN NOT NULL DEFAULT false,
        "lactoseFree" BOOLEAN NOT NULL DEFAULT false,
        "keto" BOOLEAN NOT NULL DEFAULT false,
        "halal" BOOLEAN NOT NULL DEFAULT false,
        "kosher" BOOLEAN NOT NULL DEFAULT false,
        "nutAllergy" BOOLEAN NOT NULL DEFAULT false,
        "peanutAllergy" BOOLEAN NOT NULL DEFAULT false,
        "shellfishAllergy" BOOLEAN NOT NULL DEFAULT false,
        "eggAllergy" BOOLEAN NOT NULL DEFAULT false,
        "soyAllergy" BOOLEAN NOT NULL DEFAULT false,
        "fishAllergy" BOOLEAN NOT NULL DEFAULT false,
        "servingSize" INTEGER NOT NULL DEFAULT 2,
        "difficultyLevel" TEXT NOT NULL DEFAULT 'easy',
        "maxPrepTime" INTEGER NOT NULL DEFAULT 30,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "UserPreferences_userId_key" ON "UserPreferences"("userId");`)
    
    // Create Favorite table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Favorite" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "recipeName" TEXT NOT NULL,
        "recipeData" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_recipeName_key" ON "Favorite"("userId", "recipeName");`)
    
    // Create RecipeHistory table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RecipeHistory" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "recipeName" TEXT NOT NULL,
        "recipeData" TEXT NOT NULL,
        "ingredients" TEXT NOT NULL,
        "rating" INTEGER,
        "cookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RecipeHistory_pkey" PRIMARY KEY ("id")
      );
    `)
    
    // Create MealPlan table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MealPlan" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "mealType" TEXT NOT NULL,
        "recipeName" TEXT NOT NULL,
        "recipeData" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "MealPlan_userId_date_mealType_key" ON "MealPlan"("userId", "date", "mealType");`)
    
    // Create ShoppingList table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ShoppingList" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "ingredient" TEXT NOT NULL,
        "quantity" TEXT NOT NULL,
        "unit" TEXT,
        "isChecked" BOOLEAN NOT NULL DEFAULT false,
        "recipeNames" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShoppingList_userId_idx" ON "ShoppingList"("userId");`)
    
    // Create UserBonus table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserBonus" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "value" INTEGER NOT NULL,
        "reason" TEXT,
        "expiresAt" TIMESTAMP(3),
        "used" BOOLEAN NOT NULL DEFAULT false,
        "grantedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserBonus_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "UserBonus_userId_idx" ON "UserBonus"("userId");`)
    
    // Create AdminKey table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AdminKey" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "name" TEXT,
        "description" TEXT,
        "usedBy" TEXT,
        "usedAt" TIMESTAMP(3),
        "maxUses" INTEGER NOT NULL DEFAULT 1,
        "useCount" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP(3),
        "createdBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "AdminKey_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "AdminKey_key_key" ON "AdminKey"("key");`)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminKey_key_idx" ON "AdminKey"("key");`)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminKey_active_idx" ON "AdminKey"("active");`)
    
    // Create Ad table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Ad" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "linkUrl" TEXT,
        "buttonText" TEXT,
        "type" TEXT NOT NULL DEFAULT 'banner',
        "targetTiers" TEXT NOT NULL DEFAULT 'free',
        "targetCountries" TEXT,
        "targetRegions" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "priority" INTEGER NOT NULL DEFAULT 0,
        "impressions" INTEGER NOT NULL DEFAULT 0,
        "clicks" INTEGER NOT NULL DEFAULT 0,
        "createdBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Ad_active_type_idx" ON "Ad"("active", "type");`)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Ad_startDate_endDate_idx" ON "Ad"("startDate", "endDate");`)
    
    // Create AdImpression table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AdImpression" (
        "id" TEXT NOT NULL,
        "adId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "viewed" BOOLEAN NOT NULL DEFAULT true,
        "clicked" BOOLEAN NOT NULL DEFAULT false,
        "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdImpression_adId_userId_idx" ON "AdImpression"("adId", "userId");`)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdImpression_userId_viewedAt_idx" ON "AdImpression"("userId", "viewedAt");`)
    
    // Create NewsFeed table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsFeed" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "imageUrl" TEXT,
        "linkUrl" TEXT,
        "category" TEXT NOT NULL DEFAULT 'tip',
        "targetTiers" TEXT NOT NULL DEFAULT 'all',
        "targetCountries" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "publishAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3),
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "sticky" BOOLEAN NOT NULL DEFAULT false,
        "views" INTEGER NOT NULL DEFAULT 0,
        "likes" INTEGER NOT NULL DEFAULT 0,
        "authorId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "NewsFeed_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "NewsFeed_active_publishAt_idx" ON "NewsFeed"("active", "publishAt");`)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "NewsFeed_featured_sticky_idx" ON "NewsFeed"("featured", "sticky");`)
    
    // Create Announcement table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Announcement" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'info',
        "icon" TEXT,
        "targetUsers" TEXT NOT NULL DEFAULT 'all',
        "targetCountries" TEXT,
        "displayType" TEXT NOT NULL DEFAULT 'banner',
        "dismissible" BOOLEAN NOT NULL DEFAULT true,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "views" INTEGER NOT NULL DEFAULT 0,
        "dismissals" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Announcement_active_startDate_endDate_idx" ON "Announcement"("active", "startDate", "endDate");`)
    
    // Create Analytics table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Analytics" (
        "id" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "newUsers" INTEGER NOT NULL DEFAULT 0,
        "activeUsers" INTEGER NOT NULL DEFAULT 0,
        "newSubscriptions" INTEGER NOT NULL DEFAULT 0,
        "canceledSubscriptions" INTEGER NOT NULL DEFAULT 0,
        "premiumUsers" INTEGER NOT NULL DEFAULT 0,
        "proUsers" INTEGER NOT NULL DEFAULT 0,
        "freeUsers" INTEGER NOT NULL DEFAULT 0,
        "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "recipesGenerated" INTEGER NOT NULL DEFAULT 0,
        "avgRecipesPerUser" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "adImpressions" INTEGER NOT NULL DEFAULT 0,
        "adClicks" INTEGER NOT NULL DEFAULT 0,
        "adRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "feedViews" INTEGER NOT NULL DEFAULT 0,
        "feedEngagement" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Analytics_date_key" ON "Analytics"("date");`)
    
    // Create AdminLog table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AdminLog" (
        "id" TEXT NOT NULL,
        "adminId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetId" TEXT,
        "details" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
      );
    `)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminLog_adminId_idx" ON "AdminLog"("adminId");`)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminLog_targetType_targetId_idx" ON "AdminLog"("targetType", "targetId");`)
    
    // Create foreign key constraints
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "RecipeHistory" ADD CONSTRAINT "RecipeHistory_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "UserBonus" ADD CONSTRAINT "UserBonus_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) { /* Ignore if already exists */ }
    
    console.log('[INIT] Tables created successfully')
    
    // Verify by counting users
    const userCount = await db.user.count()
    
    return NextResponse.json({
      status: 'success',
      message: 'Database tables created successfully',
      users: userCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('[INIT] Table creation failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to create tables',
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
