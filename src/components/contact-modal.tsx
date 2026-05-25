'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  Send,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/hooks/use-toast'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

// Fallback translations in case i18n fails
const fallbackTranslations = {
  fr: {
    contactTitle: 'Contactez-nous',
    contactDescription: 'Une question ? Une suggestion ? Nous sommes là pour vous aider.',
    contactName: 'Nom',
    contactNamePlaceholder: 'Votre nom',
    contactEmail: 'Email',
    contactEmailPlaceholder: 'votre@email.com',
    contactSubject: 'Sujet',
    contactSubjectPlaceholder: 'Sujet de votre message',
    contactMessage: 'Message',
    contactMessagePlaceholder: 'Décrivez votre question ou suggestion...',
    contactSend: 'Envoyer le message',
    contactSending: 'Envoi en cours...',
    contactSuccess: 'Message envoyé !',
    contactError: 'Erreur lors de l\'envoi',
    contactRequired: 'Ce champ est requis',
    contactInvalidEmail: 'Adresse email invalide',
    followUs: 'Suivez-nous',
    faqTitle: 'Foire aux questions',
    faqHowItWorks: 'Comment fonctionne Kuisto ?',
    faqHowItWorksAnswer: 'Sélectionnez simplement les ingrédients que vous avez dans votre cuisine, et notre IA générera des recettes personnalisées.',
    faqFree: 'Kuisto est-il gratuit ?',
    faqFreeAnswer: 'Oui ! Kuisto offre un plan gratuit. Pour des fonctionnalités avancées, nous proposons des abonnements Premium.',
    faqSaveRecipes: 'Comment sauvegarder mes recettes ?',
    faqSaveRecipesAnswer: 'Créez un compte gratuit pour sauvegarder vos favoris et vos listes de courses.',
    faqDietary: 'Puis-je spécifier des restrictions ?',
    faqDietaryAnswer: 'Absolument ! Vous pouvez définir vos préférences alimentaires et exclure des allergènes.',
    faqMobile: 'Kuisto fonctionne-t-il sur mobile ?',
    faqMobileAnswer: 'Oui, Kuisto est entièrement responsive et fonctionne parfaitement sur mobile.',
  },
  en: {
    contactTitle: 'Get in Touch',
    contactDescription: 'Have a question or suggestion? We\'re here to help.',
    contactName: 'Name',
    contactNamePlaceholder: 'Your name',
    contactEmail: 'Email',
    contactEmailPlaceholder: 'your@email.com',
    contactSubject: 'Subject',
    contactSubjectPlaceholder: 'Subject of your message',
    contactMessage: 'Message',
    contactMessagePlaceholder: 'Describe your question or suggestion...',
    contactSend: 'Send Message',
    contactSending: 'Sending...',
    contactSuccess: 'Message sent!',
    contactError: 'Error sending message',
    contactRequired: 'This field is required',
    contactInvalidEmail: 'Invalid email address',
    followUs: 'Follow us',
    faqTitle: 'FAQ',
    faqHowItWorks: 'How does Kuisto work?',
    faqHowItWorksAnswer: 'Simply select the ingredients you have, and our AI will generate personalized recipes.',
    faqFree: 'Is Kuisto free?',
    faqFreeAnswer: 'Yes! Kuisto offers a free plan. For advanced features, we offer Premium subscriptions.',
    faqSaveRecipes: 'How do I save my recipes?',
    faqSaveRecipesAnswer: 'Create a free account to save your favorites and shopping lists.',
    faqDietary: 'Can I specify dietary restrictions?',
    faqDietaryAnswer: 'Absolutely! You can set your dietary preferences and exclude allergens.',
    faqMobile: 'Does Kuisto work on mobile?',
    faqMobileAnswer: 'Yes, Kuisto is fully responsive and works perfectly on mobile.',
  }
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t, language } = useI18n()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Safe translation function with fallback
  const tr = (key: string): string => {
    try {
      const result = t(key as keyof typeof fallbackTranslations.fr)
      // If the result is the same as the key, use fallback
      if (result === key) {
        return fallbackTranslations[language as 'fr' | 'en']?.[key as keyof typeof fallbackTranslations.fr] || key
      }
      return result
    } catch {
      return fallbackTranslations[language as 'fr' | 'en']?.[key as keyof typeof fallbackTranslations.fr] || key
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = tr('contactRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = tr('contactRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = tr('contactInvalidEmail')
    }

    if (!formData.subject.trim()) {
      newErrors.subject = tr('contactRequired')
    }

    if (!formData.message.trim()) {
      newErrors.message = tr('contactRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        toast({
          title: tr('contactSuccess'),
          description: language === 'fr' 
            ? 'Merci de nous avoir contacté !' 
            : 'Thank you for contacting us!',
        })
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => {
          onClose()
          setSubmitStatus('idle')
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
      toast({
        title: tr('contactError'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ]

  const faqItems = [
    { question: tr('faqHowItWorks'), answer: tr('faqHowItWorksAnswer') },
    { question: tr('faqFree'), answer: tr('faqFreeAnswer') },
    { question: tr('faqSaveRecipes'), answer: tr('faqSaveRecipesAnswer') },
    { question: tr('faqDietary'), answer: tr('faqDietaryAnswer') },
    { question: tr('faqMobile'), answer: tr('faqMobileAnswer') },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {tr('contactTitle')}
          </DialogTitle>
          <DialogDescription>
            {tr('contactDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Display - Prominent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20"
          >
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Mail className="w-5 h-5" />
            </div>
            <a
              href="mailto:info@kuisto.ca"
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              info@kuisto.ca
            </a>
          </motion.div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{tr('contactName')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={tr('contactNamePlaceholder')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{tr('contactEmail')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={tr('contactEmailPlaceholder')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{tr('contactSubject')}</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder={tr('contactSubjectPlaceholder')}
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && (
                <p className="text-xs text-destructive">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{tr('contactMessage')}</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={tr('contactMessagePlaceholder')}
                rows={4}
                className={errors.message ? 'border-destructive' : ''}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tr('contactSending')}
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {tr('contactSuccess')}
                </>
              ) : submitStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {tr('contactError')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {tr('contactSend')}
                </>
              )}
            </Button>
          </form>

          <Separator />

          {/* Social Media Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center">{tr('followUs')}</h3>
            <div className="flex justify-center gap-3">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="outline"
                  size="icon"
                  asChild
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                >
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="w-5 h-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* FAQ Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{tr('faqTitle')}</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
