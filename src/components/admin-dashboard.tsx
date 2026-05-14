'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  X, Users, Crown, TrendingUp, Megaphone, Newspaper, BarChart3,
  Plus, Edit, Trash2, Search, Filter, Eye, MousePointer, Gift,
  Settings, Bell, Globe, MapPin, Calendar, Clock, Check, AlertCircle,
  ChevronDown, ChevronUp, RefreshCw, Download, ExternalLink,
  DollarSign, Activity, Target, Zap, Key, Copy
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'overview' | 'users' | 'ads' | 'feed' | 'announcements' | 'analytics' | 'keys'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  country: string | null
  region: string | null
  createdAt: string
  subscription?: {
    plan: string
    status: string
  }
  stats?: {
    favorites: number
    history: number
    mealPlans: number
  }
}

interface Ad {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  linkUrl: string | null
  buttonText: string | null
  type: string
  targetTiers: string
  targetCountries: string | null
  active: boolean
  priority: number
  impressions: number
  clicks: number
  createdAt: string
}

interface FeedItem {
  id: string
  title: string
  content: string
  imageUrl: string | null
  linkUrl: string | null
  category: string
  active: boolean
  featured: boolean
  sticky: boolean
  views: number
  likes: number
  publishAt: string
}

interface Announcement {
  id: string
  title: string
  message: string
  type: string
  displayType: string
  active: boolean
  views: number
  dismissals: number
  createdAt: string
}

interface Analytics {
  overview: {
    totalUsers: number
    activeUsersToday: number
    premiumUsers: number
    proUsers: number
    freeUsers: number
    conversionRate: string
    totalAds: number
    activeAds: number
    totalFeedItems: number
    clickRate: string
  }
  recentLogs: Array<{
    id: string
    action: string
    targetType: string
    createdAt: string
    admin: { name: string | null; email: string }
  }>
}

interface AdminKey {
  id: string
  key: string
  name: string | null
  description: string | null
  active: boolean
  maxUses: number
  useCount: number
  expiresAt: string | null
  usedBy: string | null
  usedAt: string | null
  createdAt: string
}

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const { language } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoading, setIsLoading] = useState(false)
  
  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [adminKeys, setAdminKeys] = useState<AdminKey[]>([])
  
  // Search/filter states
  const [userSearch, setUserSearch] = useState('')
  const [userPlanFilter, setUserPlanFilter] = useState('')
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)
  const [showFeedModal, setShowFeedModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Fetch data based on tab
  useEffect(() => {
    if (isOpen) {
      fetchAnalytics()
    }
  }, [isOpen])

  useEffect(() => {
    switch (activeTab) {
      case 'users':
        fetchUsers()
        break
      case 'ads':
        fetchAds()
        break
      case 'feed':
        fetchFeed()
        break
      case 'announcements':
        fetchAnnouncements()
        break
      case 'analytics':
        fetchAnalytics()
        break
      case 'keys':
        fetchAdminKeys()
        break
    }
  }, [activeTab])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (userSearch) params.set('search', userSearch)
      if (userPlanFilter) params.set('plan', userPlanFilter)
      
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAds = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/ads')
      const data = await res.json()
      setAds(data.ads || [])
    } catch (err) {
      console.error('Failed to fetch ads:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFeed = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/feed')
      const data = await res.json()
      setFeed(data.feed || [])
    } catch (err) {
      console.error('Failed to fetch feed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      setAnnouncements(data.announcements || [])
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdminKeys = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/keys')
      const data = await res.json()
      setAdminKeys(data.keys || [])
    } catch (err) {
      console.error('Failed to fetch admin keys:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Admin key actions
  const handleCreateAdminKey = async (name: string, description: string, maxUses: number) => {
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, maxUses })
      })
      if (res.ok) {
        const data = await res.json()
        toast({ 
          title: language === 'fr' ? 'Clé créée !' : 'Key created!',
          description: data.key.key
        })
        fetchAdminKeys()
      }
    } catch (err) {
      toast({ title: language === 'fr' ? 'Erreur' : 'Error', variant: 'destructive' })
    }
  }

  const handleDeleteAdminKey = async (keyId: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer cette clé ?' : 'Delete this key?')) return
    try {
      await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      })
      fetchAdminKeys()
    } catch (err) {
      console.error('Failed to delete admin key:', err)
    }
  }

  const handleToggleAdminKey = async (keyId: string, active: boolean) => {
    try {
      await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, active })
      })
      fetchAdminKeys()
    } catch (err) {
      console.error('Failed to toggle admin key:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: language === 'fr' ? 'Copié !' : 'Copied!' })
  }

  // User actions
  const handleUpdateUserSubscription = async (userId: string, plan: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_subscription',
          data: { plan, status }
        })
      })
      if (res.ok) {
        toast({ title: language === 'fr' ? 'Abonnement mis à jour' : 'Subscription updated' })
        fetchUsers()
      }
    } catch (err) {
      toast({ title: language === 'fr' ? 'Erreur' : 'Error', variant: 'destructive' })
    }
  }

  const handleGrantBonus = async (userId: string, type: string, value: number, reason: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant_bonus',
          data: { type, value, reason }
        })
      })
      if (res.ok) {
        toast({ title: language === 'fr' ? 'Bonus accordé' : 'Bonus granted' })
        fetchUsers()
      }
    } catch (err) {
      toast({ title: language === 'fr' ? 'Erreur' : 'Error', variant: 'destructive' })
    }
  }

  // Ad actions
  const handleToggleAd = async (adId: string, active: boolean) => {
    try {
      await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })
      fetchAds()
    } catch (err) {
      console.error('Failed to toggle ad:', err)
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer cette publicité ?' : 'Delete this ad?')) return
    try {
      await fetch(`/api/admin/ads/${adId}`, { method: 'DELETE' })
      fetchAds()
    } catch (err) {
      console.error('Failed to delete ad:', err)
    }
  }

  // Feed actions
  const handleToggleFeedItem = async (feedId: string, active: boolean) => {
    try {
      await fetch(`/api/admin/feed/${feedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })
      fetchFeed()
    } catch (err) {
      console.error('Failed to toggle feed item:', err)
    }
  }

  // Create new ad
  const handleCreateAd = async (adData: Partial<Ad>) => {
    try {
      if (isEditMode && selectedAd) {
        // Update existing ad
        const res = await fetch(`/api/admin/ads/${selectedAd.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData)
        })
        if (res.ok) {
          toast({ title: language === 'fr' ? 'Publicité mise à jour' : 'Ad updated' })
          setShowAdModal(false)
          setSelectedAd(null)
          setIsEditMode(false)
          fetchAds()
        }
      } else {
        // Create new ad
        const res = await fetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData)
        })
        if (res.ok) {
          toast({ title: language === 'fr' ? 'Publicité créée' : 'Ad created' })
          setShowAdModal(false)
          fetchAds()
        }
      }
    } catch (err) {
      toast({ title: language === 'fr' ? 'Erreur' : 'Error', variant: 'destructive' })
    }
  }

  // Open edit modal for ad
  const handleEditAd = (ad: Ad) => {
    setSelectedAd(ad)
    setIsEditMode(true)
    setShowAdModal(true)
  }

  // Open create modal for ad
  const handleOpenCreateAd = () => {
    setSelectedAd(null)
    setIsEditMode(false)
    setShowAdModal(true)
  }

  // Create new feed item
  const handleCreateFeedItem = async (feedData: Partial<FeedItem>) => {
    try {
      const res = await fetch('/api/admin/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedData)
      })
      if (res.ok) {
        toast({ title: language === 'fr' ? 'Article créé' : 'Feed item created' })
        setShowFeedModal(false)
        fetchFeed()
      }
    } catch (err) {
      toast({ title: language === 'fr' ? 'Erreur' : 'Error', variant: 'destructive' })
    }
  }

  // Create new announcement
  const handleCreateAnnouncement = async (announcementData: Partial<Announcement>) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      })
      if (res.ok) {
        toast({ title: language === 'fr' ? 'Annonce créée' : 'Announcement created' })
        setShowAnnouncementModal(false)
        fetchAnnouncements()
      }
    } catch (err) {
      toast({ title: language === 'fr' ? 'Erreur' : 'Error', variant: 'destructive' })
    }
  }

  const t = (key: string) => {
    const translations: Record<string, { fr: string; en: string }> = {
      dashboard: { fr: 'Tableau de bord Admin', en: 'Admin Dashboard' },
      overview: { fr: 'Vue d\'ensemble', en: 'Overview' },
      users: { fr: 'Utilisateurs', en: 'Users' },
      ads: { fr: 'Publicités', en: 'Ads' },
      feed: { fr: 'Feed Actualités', en: 'News Feed' },
      announcements: { fr: 'Annonces', en: 'Announcements' },
      analytics: { fr: 'Statistiques', en: 'Analytics' },
      totalUsers: { fr: 'Total utilisateurs', en: 'Total users' },
      activeToday: { fr: 'Actifs aujourd\'hui', en: 'Active today' },
      premiumUsers: { fr: 'Utilisateurs Premium', en: 'Premium users' },
      proUsers: { fr: 'Utilisateurs Pro', en: 'Pro users' },
      conversionRate: { fr: 'Taux de conversion', en: 'Conversion rate' },
      searchUsers: { fr: 'Rechercher des utilisateurs...', en: 'Search users...' },
      plan: { fr: 'Plan', en: 'Plan' },
      actions: { fr: 'Actions', en: 'Actions' },
      activate: { fr: 'Activer', en: 'Activate' },
      deactivate: { fr: 'Désactiver', en: 'Deactivate' },
      grantBonus: { fr: 'Accorder bonus', en: 'Grant bonus' },
      createAd: { fr: 'Créer publicité', en: 'Create ad' },
      createFeedItem: { fr: 'Créer article', en: 'Create feed item' },
      createAnnouncement: { fr: 'Créer annonce', en: 'Create announcement' },
      impressions: { fr: 'Impressions', en: 'Impressions' },
      clicks: { fr: 'Clics', en: 'Clicks' },
      ctr: { fr: 'Taux de clic', en: 'CTR' },
      views: { fr: 'Vues', en: 'Views' },
      likes: { fr: 'J\'aime', en: 'Likes' },
      active: { fr: 'Actif', en: 'Active' },
      inactive: { fr: 'Inactif', en: 'Inactive' },
      all: { fr: 'Tous', en: 'All' },
      free: { fr: 'Gratuit', en: 'Free' },
      recentActivity: { fr: 'Activité récente', en: 'Recent activity' },
      noAds: { fr: 'Aucune publicité', en: 'No ads' },
      noFeedItems: { fr: 'Aucun article', en: 'No feed items' },
      noAnnouncements: { fr: 'Aucune annonce', en: 'No announcements' },
      targetCountries: { fr: 'Pays cibles', en: 'Target countries' },
      targetTiers: { fr: 'Niveaux cibles', en: 'Target tiers' },
      allCountries: { fr: 'Tous les pays', en: 'All countries' },
      geolocated: { fr: 'Géolocalisé', en: 'Geolocated' },
      banner: { fr: 'Bannière', en: 'Banner' },
      popup: { fr: 'Popup', en: 'Popup' },
      inline: { fr: 'En ligne', en: 'Inline' },
      sidebar: { fr: 'Barre latérale', en: 'Sidebar' },
      tip: { fr: 'Astuce', en: 'Tip' },
      news: { fr: 'Actualité', en: 'News' },
      recipe: { fr: 'Recette', en: 'Recipe' },
      promotion: { fr: 'Promotion', en: 'Promotion' },
      trending: { fr: 'Tendance', en: 'Trending' },
    }
    return translations[key]?.[language as 'fr' | 'en'] || key
  }

  if (!isOpen) return null

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'overview', icon: <BarChart3 className="w-4 h-4" />, label: t('overview') },
    { id: 'users', icon: <Users className="w-4 h-4" />, label: t('users') },
    { id: 'keys', icon: <Key className="w-4 h-4" />, label: language === 'fr' ? 'Clés Admin' : 'Admin Keys' },
    { id: 'ads', icon: <Megaphone className="w-4 h-4" />, label: t('ads') },
    { id: 'feed', icon: <Newspaper className="w-4 h-4" />, label: t('feed') },
    { id: 'announcements', icon: <Bell className="w-4 h-4" />, label: t('announcements') },
    { id: 'analytics', icon: <TrendingUp className="w-4 h-4" />, label: t('analytics') },
  ]

  return (
    <AnimatePresence>
      <motion.div
        key="admin-dashboard-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-6xl h-full bg-card shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold">{t('dashboard')}</h1>
                <p className="text-sm text-white/80">Kuisto Administration</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-muted/30">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && analytics && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('totalUsers')}</p>
                            <p className="text-2xl font-bold">{analytics.overview.totalUsers}</p>
                          </div>
                          <Users className="w-8 h-8 text-primary opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('activeToday')}</p>
                            <p className="text-2xl font-bold">{analytics.overview.activeUsersToday}</p>
                          </div>
                          <Activity className="w-8 h-8 text-green-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('premiumUsers')}</p>
                            <p className="text-2xl font-bold text-amber-500">{analytics.overview.premiumUsers}</p>
                          </div>
                          <Crown className="w-8 h-8 text-amber-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('conversionRate')}</p>
                            <p className="text-2xl font-bold">{analytics.overview.conversionRate}%</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-primary" />
                          {t('ads')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('active')}</span>
                            <span className="font-medium">{analytics.overview.activeAds}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('ctr')}</span>
                            <span className="font-medium">{analytics.overview.clickRate}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Newspaper className="w-5 h-5 text-primary" />
                          {t('feed')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{language === 'fr' ? 'Articles actifs' : 'Active items'}</span>
                            <span className="font-medium">{analytics.overview.totalFeedItems}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        {t('recentActivity')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.recentLogs.map(log => (
                          <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{log.action}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {log.admin.name || log.admin.email}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t('searchUsers')}
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={userPlanFilter}
                      onChange={(e) => setUserPlanFilter(e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-background"
                    >
                      <option value="">{t('all')} {language === 'fr' ? 'les plans' : 'plans'}</option>
                      <option value="free">{t('free')}</option>
                      <option value="premium">Premium</option>
                      <option value="pro">Pro</option>
                    </select>
                    <Button onClick={fetchUsers} variant="outline" size="icon">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Users Table */}
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 text-sm font-medium">{language === 'fr' ? 'Utilisateur' : 'User'}</th>
                              <th className="text-left p-3 text-sm font-medium">{t('plan')}</th>
                              <th className="text-left p-3 text-sm font-medium">{language === 'fr' ? 'Localisation' : 'Location'}</th>
                              <th className="text-left p-3 text-sm font-medium">{language === 'fr' ? 'Date d\'inscription' : 'Joined'}</th>
                              <th className="text-left p-3 text-sm font-medium">{t('actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(user => (
                              <tr key={user.id} className="border-t hover:bg-muted/30">
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium">{user.name || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge className={
                                    user.subscription?.plan === 'premium' ? 'bg-amber-100 text-amber-700' :
                                    user.subscription?.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'
                                  }>
                                    {user.subscription?.plan || 'free'}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {user.country || '-'}
                                    {user.region && `, ${user.region}`}
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedUser(user)
                                        setShowUserModal(true)
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleGrantBonus(user.id, 'free_recipes', 5, 'Admin bonus')}
                                    >
                                      <Gift className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Ads Tab */}
              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-serif text-xl font-bold">{t('ads')}</h2>
                    <Button onClick={handleOpenCreateAd}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t('createAd')}
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {ads.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>{t('noAds')}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      ads.map(ad => (
                        <Card key={ad.id} className={ad.active ? '' : 'opacity-60'}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{ad.title}</h3>
                                  <Badge variant={ad.active ? 'default' : 'secondary'}>
                                    {ad.active ? t('active') : t('inactive')}
                                  </Badge>
                                  <Badge variant="outline">{t(ad.type as keyof typeof t)}</Badge>
                                </div>
                                {ad.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{ad.description}</p>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                    {ad.impressions} {t('impressions')}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MousePointer className="w-4 h-4 text-muted-foreground" />
                                    {ad.clicks} {t('clicks')}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    {ad.targetCountries ? JSON.parse(ad.targetCountries).join(', ') : t('allCountries')}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAd(ad)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleAd(ad.id, !ad.active)}
                                >
                                  {ad.active ? t('deactivate') : t('activate')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteAd(ad.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Feed Tab */}
              {activeTab === 'feed' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-serif text-xl font-bold">{t('feed')}</h2>
                    <Button onClick={() => setShowFeedModal(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t('createFeedItem')}
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {feed.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>{t('noFeedItems')}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      feed.map(item => (
                        <Card key={item.id} className={item.active ? '' : 'opacity-60'}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{item.title}</h3>
                                  <Badge variant={item.active ? 'default' : 'secondary'}>
                                    {item.active ? t('active') : t('inactive')}
                                  </Badge>
                                  {item.featured && <Badge variant="outline">⭐</Badge>}
                                  {item.sticky && <Badge variant="outline">📌</Badge>}
                                  <Badge variant="outline">{t(item.category as keyof typeof t)}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.content}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                    {item.views} {t('views')}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">❤️</span>
                                    {item.likes} {t('likes')}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleFeedItem(item.id, !item.active)}
                                >
                                  {item.active ? t('deactivate') : t('activate')}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Announcements Tab */}
              {activeTab === 'announcements' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-serif text-xl font-bold">{t('announcements')}</h2>
                    <Button onClick={() => setShowAnnouncementModal(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t('createAnnouncement')}
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {announcements.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>{t('noAnnouncements')}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      announcements.map(announcement => (
                        <Card key={announcement.id} className={announcement.active ? '' : 'opacity-60'}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{announcement.title}</h3>
                                  <Badge variant={announcement.active ? 'default' : 'secondary'}>
                                    {announcement.active ? t('active') : t('inactive')}
                                  </Badge>
                                  <Badge variant="outline">{announcement.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                    {announcement.views} {t('views')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{language === 'fr' ? 'Répartition des plans' : 'Plan distribution'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">{t('free')}</span>
                            <span className="font-medium">{analytics.overview.freeUsers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Premium</span>
                            <span className="font-medium">{analytics.overview.premiumUsers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pro</span>
                            <span className="font-medium">{analytics.overview.proUsers}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{language === 'fr' ? 'Performance des publicités' : 'Ad performance'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">{t('impressions')}</span>
                            <span className="font-medium">-</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">{t('clicks')}</span>
                            <span className="font-medium">-</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">{t('ctr')}</span>
                            <span className="font-medium">{analytics.overview.clickRate}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{language === 'fr' ? 'Conversion' : 'Conversion'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">{t('conversionRate')}</span>
                            <span className="font-medium text-green-500">{analytics.overview.conversionRate}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Admin Keys Tab */}
              {activeTab === 'keys' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-serif text-xl font-bold">{language === 'fr' ? 'Clés d\'administration' : 'Admin Keys'}</h2>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' 
                          ? 'Générez des clés pour permettre aux utilisateurs de devenir administrateurs'
                          : 'Generate keys to allow users to become administrators'}
                      </p>
                    </div>
                    <Button onClick={() => {
                      const name = prompt(language === 'fr' ? 'Nom de la clé (optionnel):' : 'Key name (optional):')
                      if (name === null) return
                      const description = prompt(language === 'fr' ? 'Description (optionnel):' : 'Description (optional):')
                      if (description === null) return
                      const maxUses = parseInt(prompt(language === 'fr' ? 'Nombre d\'utilisations max (défaut: 1):' : 'Max uses (default: 1):') || '1')
                      handleCreateAdminKey(name, description, maxUses)
                    }}>
                      <Plus className="w-4 h-4 mr-1" />
                      {language === 'fr' ? 'Créer une clé' : 'Create Key'}
                    </Button>
                  </div>

                  {/* Default key info */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Key className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-blue-700 dark:text-blue-300">
                            {language === 'fr' ? 'Clé par défaut' : 'Default Key'}
                          </h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                            {language === 'fr' 
                              ? 'Cette clé fonctionne toujours pour promouvoir des utilisateurs:'
                              : 'This key always works to promote users:'}
                          </p>
                          <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-sm font-mono">
                            kuisto-admin-2024
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keys list */}
                  <div className="grid gap-4">
                    {adminKeys.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>{language === 'fr' ? 'Aucune clé personnalisée' : 'No custom keys'}</p>
                          <p className="text-sm">{language === 'fr' ? 'Créez une clé pour commencer' : 'Create a key to get started'}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      adminKeys.map(key => (
                        <Card key={key.id} className={!key.active ? 'opacity-60' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{key.name || language === 'fr' ? 'Clé sans nom' : 'Unnamed key'}</h3>
                                  <Badge variant={key.active ? 'default' : 'secondary'}>
                                    {key.active ? (language === 'fr' ? 'Active' : 'Active') : (language === 'fr' ? 'Inactive' : 'Inactive')}
                                  </Badge>
                                  {key.expiresAt && new Date(key.expiresAt) < new Date() && (
                                    <Badge variant="destructive">{language === 'fr' ? 'Expirée' : 'Expired'}</Badge>
                                  )}
                                </div>
                                {key.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{key.description}</p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1">
                                    {key.key}
                                  </code>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => copyToClipboard(key.key)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <span>{language === 'fr' ? 'Utilisations:' : 'Uses:'}</span>
                                    <span className="font-medium">{key.useCount} / {key.maxUses}</span>
                                  </div>
                                  {key.usedAt && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {language === 'fr' ? 'Utilisée le:' : 'Used on:'} {new Date(key.usedAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleAdminKey(key.id, !key.active)}
                                >
                                  {key.active ? (language === 'fr' ? 'Désactiver' : 'Deactivate') : (language === 'fr' ? 'Activer' : 'Activate')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteAdminKey(key.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Side panel for ads/feed on the right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex flex-col w-80 bg-muted/30 border-l p-4"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="font-serif font-bold mb-4">{language === 'fr' ? 'Aperçu public' : 'Public preview'}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'fr' 
              ? 'Cette section montre comment les utilisateurs gratuits voient les publicités et le feed.'
              : 'This section shows how free users see ads and feed.'}
          </p>
        </motion.div>
      </motion.div>

      {/* User Modal */}
      <React.Fragment key="user-modal">
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onUpdateSubscription={handleUpdateUserSubscription}
        onGrantBonus={handleGrantBonus}
        language={language}
      />
      </React.Fragment>

      {/* Ad Modal */}
      <React.Fragment key="ad-modal">
      <AdModal
        isOpen={showAdModal}
        onClose={() => {
          setShowAdModal(false)
          setSelectedAd(null)
          setIsEditMode(false)
        }}
        onCreate={handleCreateAd}
        editAd={selectedAd}
        isEditMode={isEditMode}
        language={language}
      />
      </React.Fragment>

      {/* Feed Modal */}
      <React.Fragment key="feed-modal">
      <FeedModal
        isOpen={showFeedModal}
        onClose={() => setShowFeedModal(false)}
        onCreate={handleCreateFeedItem}
        language={language}
      />
      </React.Fragment>

      {/* Announcement Modal */}
      <React.Fragment key="announcement-modal">
      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onCreate={handleCreateAnnouncement}
        language={language}
      />
      </React.Fragment>
    </AnimatePresence>
  )
}

// Sub-components for modals
function UserModal({ isOpen, onClose, user, onUpdateSubscription, onGrantBonus, language }: {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUpdateSubscription: (userId: string, plan: string, status: string) => void
  onGrantBonus: (userId: string, type: string, value: number, reason: string) => void
  language: string
}) {
  const [plan, setPlan] = useState('free')
  const [status, setStatus] = useState('active')
  const [bonusType, setBonusType] = useState('free_recipes')
  const [bonusValue, setBonusValue] = useState(5)
  const [bonusReason, setBonusReason] = useState('')

  // Initialize from user props
  const initialPlan = user?.subscription?.plan || 'free'
  const initialStatus = user?.subscription?.status || 'active'

  if (!isOpen || !user) return null

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      <Card 
        className="w-full max-w-md" 
        onClick={e => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{language === 'fr' ? 'Gérer l\'utilisateur' : 'Manage user'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{user.name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{language === 'fr' ? 'Plan' : 'Plan'}</label>
            <select value={plan || initialPlan} onChange={e => setPlan(e.target.value)} className="w-full p-2 border rounded-lg">
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{language === 'fr' ? 'Statut' : 'Status'}</label>
            <select value={status || initialStatus} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded-lg">
              <option value="active">{language === 'fr' ? 'Actif' : 'Active'}</option>
              <option value="canceled">{language === 'fr' ? 'Annulé' : 'Canceled'}</option>
              <option value="expired">{language === 'fr' ? 'Expiré' : 'Expired'}</option>
            </select>
          </div>

          <Button onClick={() => onUpdateSubscription(user.id, plan, status)} className="w-full">
            {language === 'fr' ? 'Mettre à jour l\'abonnement' : 'Update subscription'}
          </Button>

          <hr />

          <h4 className="font-medium">{language === 'fr' ? 'Accorder un bonus' : 'Grant bonus'}</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <select value={bonusType} onChange={e => setBonusType(e.target.value)} className="p-2 border rounded-lg">
              <option value="free_recipes">{language === 'fr' ? 'Recettes gratuites' : 'Free recipes'}</option>
              <option value="premium_days">{language === 'fr' ? 'Jours premium' : 'Premium days'}</option>
              <option value="pro_days">{language === 'fr' ? 'Jours pro' : 'Pro days'}</option>
            </select>
            <Input type="number" value={bonusValue} onChange={e => setBonusValue(parseInt(e.target.value))} />
          </div>

          <Input
            placeholder={language === 'fr' ? 'Raison du bonus' : 'Bonus reason'}
            value={bonusReason}
            onChange={e => setBonusReason(e.target.value)}
          />

          <Button variant="outline" onClick={() => onGrantBonus(user.id, bonusType, bonusValue, bonusReason)} className="w-full">
            <Gift className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Accorder le bonus' : 'Grant bonus'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AdModal({ isOpen, onClose, onCreate, editAd, isEditMode, language }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: Partial<Ad>) => void
  editAd: Ad | null
  isEditMode: boolean
  language: string
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: '',
    type: 'banner',
    targetTiers: '["free"]',
    targetCountries: '',
    priority: 0
  })

  // Populate form when editing
  React.useEffect(() => {
    if (isEditMode && editAd) {
      setFormData({
        title: editAd.title || '',
        description: editAd.description || '',
        imageUrl: editAd.imageUrl || '',
        linkUrl: editAd.linkUrl || '',
        buttonText: editAd.buttonText || '',
        type: editAd.type || 'banner',
        targetTiers: editAd.targetTiers || '["free"]',
        targetCountries: editAd.targetCountries ? JSON.parse(editAd.targetCountries).join(', ') : '',
        priority: editAd.priority || 0
      })
    } else {
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        buttonText: '',
        type: 'banner',
        targetTiers: '["free"]',
        targetCountries: '',
        priority: 0
      })
    }
  }, [isEditMode, editAd, isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    onCreate({
      ...formData,
      targetCountries: formData.targetCountries ? JSON.stringify(formData.targetCountries.split(',').map(c => c.trim())) : null
    })
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      <Card 
        className="w-full max-w-md max-h-[90vh] overflow-auto" 
        onClick={e => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditMode ? (language === 'fr' ? 'Modifier la publicité' : 'Edit ad') : (language === 'fr' ? 'Créer une publicité' : 'Create ad')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={language === 'fr' ? 'Titre' : 'Title'}
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            placeholder={language === 'fr' ? 'Description' : 'Description'}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            placeholder="URL de l'image (ex: https://...)"
            value={formData.imageUrl}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          <Input
            placeholder="URL du lien (ex: https://worrybee.com)"
            value={formData.linkUrl}
            onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
          />
          <Input
            placeholder={language === 'fr' ? 'Texte du bouton' : 'Button text'}
            value={formData.buttonText}
            onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
          />
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border rounded-lg bg-background"
          >
            <option value="banner">Banner</option>
            <option value="popup">Popup</option>
            <option value="inline">Inline</option>
            <option value="sidebar">Sidebar</option>
          </select>
          <Input
            placeholder={language === 'fr' ? 'Pays cibles (CA, US, FR...)' : 'Target countries (CA, US, FR...)'}
            value={formData.targetCountries}
            onChange={e => setFormData({ ...formData, targetCountries: e.target.value })}
          />
          <Input
            type="number"
            placeholder={language === 'fr' ? 'Priorité' : 'Priority'}
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          />
          <Button onClick={handleSubmit} className="w-full">
            {isEditMode ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Créer' : 'Create')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function FeedModal({ isOpen, onClose, onCreate, language }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: Partial<FeedItem>) => void
  language: string
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    category: 'tip',
    featured: false,
    sticky: false
  })

  if (!isOpen) return null

  const handleSubmit = () => {
    onCreate(formData)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      <Card 
        className="w-full max-w-md max-h-[90vh] overflow-auto" 
        onClick={e => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{language === 'fr' ? 'Créer un article' : 'Create feed item'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={language === 'fr' ? 'Titre' : 'Title'}
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            placeholder={language === 'fr' ? 'Contenu' : 'Content'}
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-2 border rounded-lg min-h-[100px]"
          />
          <Input
            placeholder="URL de l'image"
            value={formData.imageUrl}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          <Input
            placeholder="URL du lien"
            value={formData.linkUrl}
            onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
          />
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="tip">{language === 'fr' ? 'Astuce' : 'Tip'}</option>
            <option value="news">{language === 'fr' ? 'Actualité' : 'News'}</option>
            <option value="recipe">{language === 'fr' ? 'Recette' : 'Recipe'}</option>
            <option value="promotion">{language === 'fr' ? 'Promotion' : 'Promotion'}</option>
            <option value="trending">{language === 'fr' ? 'Tendance' : 'Trending'}</option>
          </select>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              />
              ⭐ Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.sticky}
                onChange={e => setFormData({ ...formData, sticky: e.target.checked })}
              />
              📌 Sticky
            </label>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            {language === 'fr' ? 'Créer' : 'Create'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AnnouncementModal({ isOpen, onClose, onCreate, language }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: Partial<Announcement>) => void
  language: string
}) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    displayType: 'banner',
    targetUsers: 'all'
  })

  if (!isOpen) return null

  const handleSubmit = () => {
    onCreate(formData)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      <Card 
        className="w-full max-w-md" 
        onClick={e => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{language === 'fr' ? 'Créer une annonce' : 'Create announcement'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={language === 'fr' ? 'Titre' : 'Title'}
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            placeholder={language === 'fr' ? 'Message' : 'Message'}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            className="w-full p-2 border rounded-lg min-h-[80px]"
          />
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="info">ℹ️ Info</option>
            <option value="warning">⚠️ Warning</option>
            <option value="success">✅ Success</option>
            <option value="promotion">🎉 Promotion</option>
          </select>
          <select
            value={formData.displayType}
            onChange={e => setFormData({ ...formData, displayType: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="banner">{language === 'fr' ? 'Bannière' : 'Banner'}</option>
            <option value="modal">Modal</option>
            <option value="notification">{language === 'fr' ? 'Notification' : 'Notification'}</option>
          </select>
          <select
            value={formData.targetUsers}
            onChange={e => setFormData({ ...formData, targetUsers: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="all">{language === 'fr' ? 'Tous les utilisateurs' : 'All users'}</option>
            <option value="free">{language === 'fr' ? 'Utilisateurs gratuits' : 'Free users'}</option>
            <option value="premium">Premium</option>
            <option value="pro">Pro</option>
          </select>
          <Button onClick={handleSubmit} className="w-full">
            {language === 'fr' ? 'Créer' : 'Create'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
