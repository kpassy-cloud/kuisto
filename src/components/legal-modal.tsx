'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Shield, Cookie, Scale, FileCheck } from 'lucide-react'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'terms' | 'privacy' | 'cookies' | 'legal' | 'cgv'
  language: 'fr' | 'en'
}

const legalContent = {
  fr: {
    terms: {
      title: "Conditions d'utilisation",
      icon: FileText,
      content: `
# Conditions d'utilisation de Kuisto

**Dernière mise à jour : Janvier 2025**

## 1. Acceptation des conditions

En utilisant l'application Kuisto, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.

## 2. Description du service

Kuisto est une application de génération de recettes personnalisées basées sur vos ingrédients disponibles. Le service inclut :
- Génération de recettes par intelligence artificielle
- Suggestions personnalisées selon vos préférences alimentaires
- Listes de courses automatisées
- Planification de repas

## 3. Compte utilisateur

Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de :
- La confidentialité de vos identifiants
- Toute activité effectuée sous votre compte
- La précision des informations fournies

## 4. Utilisation acceptable

Vous vous engagez à :
- Utiliser le service uniquement à des fins légales
- Ne pas tenter d'accéder non autorisé à nos systèmes
- Ne pas reproduire ou distribuer le contenu sans autorisation

## 5. Abonnements et paiements

Kuisto propose des abonnements gratuits et premium. Les conditions de paiement sont :
- Paiement sécurisé via nos partenaires
- Renouvellement automatique sauf annulation
- Remboursement selon notre politique de 14 jours

## 6. Propriété intellectuelle

Tout le contenu de Kuisto (textes, images, logos) est protégé par le droit d'auteur. L'utilisation non autorisée est strictement interdite.

## 7. Limitation de responsabilité

Kuisto ne peut être tenu responsable des dommages indirects liés à l'utilisation du service. Les recettes générées sont des suggestions et ne remplacent pas l'avis d'un professionnel de santé.

## 8. Modification des conditions

Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements importants.

## 9. Contact

Pour toute question : info@kuisto.ca
      `
    },
    privacy: {
      title: "Politique de confidentialité",
      icon: Shield,
      content: `
# Politique de confidentialité de Kuisto

**Dernière mise à jour : Janvier 2025**

## 1. Introduction

Kuisto s'engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.

## 2. Données collectées

Nous collectons les informations suivantes :
- **Données d'identification** : nom, email, mot de passe (chiffré)
- **Préférences alimentaires** : régime, allergies, restrictions
- **Historique d'utilisation** : recettes générées, favoris
- **Données techniques** : adresse IP, type d'appareil, navigateur

## 3. Utilisation des données

Vos données sont utilisées pour :
- Fournir et améliorer nos services
- Personnaliser vos recommandations
- Communiquer avec vous (notifications, newsletters)
- Assurer la sécurité du service

## 4. Base légale

Le traitement de vos données repose sur :
- L'exécution du contrat (fourniture du service)
- Votre consentement (newsletters, cookies)
- Notre intérêt légitime (amélioration du service)

## 5. Conservation des données

Vos données sont conservées :
- Pendant la durée de votre compte
- 3 ans après inactivité pour les comptes gratuits
- Selon les obligations légales pour les données de facturation

## 6. Vos droits

Conformément au RGPD et à la Loi canadienne, vous avez le droit de :
- Accéder à vos données
- Rectifier vos informations
- Supprimer votre compte
- Exporter vos données
- Vous opposer au traitement

## 7. Sécurité

Nous mettons en œuvre des mesures techniques et organisationnelles :
- Chiffrement SSL/TLS
- Authentification sécurisée
- Accès restreint aux données
- Surveillance continue

## 8. Cookies

Consultez notre Politique de cookies pour plus d'informations sur l'utilisation des cookies.

## 9. Contact DPO

Pour exercer vos droits : info@kuisto.ca

## 10. Modifications

Cette politique peut être mise à jour. Vous serez notifié des changements significatifs.
      `
    },
    cookies: {
      title: "Politique de cookies",
      icon: Cookie,
      content: `
# Politique de cookies de Kuisto

**Dernière mise à jour : Janvier 2025**

## 1. Qu'est-ce qu'un cookie ?

Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur notre site.

## 2. Types de cookies utilisés

### Cookies essentiels
- **Session** : Gestion de votre connexion
- **Sécurité** : Protection contre les attaques
- **Préférences** : Langue, thème

### Cookies analytiques
- **Google Analytics** : Statistiques de visite
- **Performance** : Temps de chargement

### Cookies publicitaires
- **Ciblage** : Publicités personnalisées
- **Conversion** : Suivi des inscriptions

## 3. Durée de conservation

| Type | Durée |
|------|-------|
| Session | Jusqu'à fermeture |
| Persistants | 1 an maximum |
| Analytiques | 26 mois |

## 4. Gestion des cookies

Vous pouvez :
- Accepter ou refuser les cookies non essentiels
- Modifier vos préférences à tout moment
- Supprimer les cookies via votre navigateur

## 5. Conséquences du refus

Le refus des cookies essentiels peut empêcher l'utilisation de certaines fonctionnalités.

## 6. Mise à jour

Cette politique peut être modifiée. La date de dernière mise à jour est indiquée en haut.

## Contact

Pour toute question : info@kuisto.ca
      `
    },
    legal: {
      title: "Mentions légales",
      icon: Scale,
      content: `
# Mentions légales

**Dernière mise à jour : Janvier 2025**

## 1. Éditeur du site

**Kuisto Inc.**
Société incorporée au Canada

**Siège social :**
Ottawa, ON, Canada

**Contact :**
- Email : info@kuisto.ca
- Téléphone : +1 (613) 422-5120

## 2. Directeur de la publication

Le directeur de la publication est le représentant légal de Kuisto Inc.

## 3. Hébergement

Le site est hébergé par :
- **Vercel Inc.**
- 340 S Lemon Ave #4133
- Walnut, CA 91789, USA

## 4. Propriété intellectuelle

L'ensemble du site (structure, design, textes, images, logos) est la propriété exclusive de Kuisto Inc. ou de ses partenaires. Toute reproduction est interdite sans autorisation.

## 5. Données personnelles

Le traitement des données personnelles est décrit dans notre Politique de confidentialité.

## 6. Cookies

L'utilisation des cookies est décrite dans notre Politique de cookies.

## 7. Juridiction

Les présentes mentions légales sont régies par le droit canadien. En cas de litige, les tribunaux canadiens sont seuls compétents.

## 8. Contact

Pour toute question juridique : info@kuisto.ca
      `
    },
    cgv: {
      title: "Conditions générales de vente",
      icon: FileCheck,
      content: `
# Conditions Générales de Vente (CGV)

**Dernière mise à jour : Janvier 2025**

## 1. Objet

Les présentes CGV régissent les ventes d'abonnements Premium sur l'application Kuisto.

## 2. Produits et tarifs

### Abonnement Premium
- **Mensuel** : 9,99 CAD/mois
- **Annuel** : 79,99 CAD/an (économie de 33%)

### Avantages Premium
- Recettes illimitées
- Images haute qualité
- Fonctionnalités exclusives
- Support prioritaire

## 3. Commande et paiement

### Moyens de paiement acceptés
- Carte de crédit (Visa, Mastercard)
- PayPal

### Processus de commande
1. Sélection de l'abonnement
2. Création/complétion du compte
3. Paiement sécurisé
4. Activation immédiate

## 4. Durée et renouvellement

- L'abonnement est valable pour la période choisie
- Le renouvellement est automatique
- Notification avant chaque renouvellement annuel

## 5. Droit de rétractation

Conformément à la loi canadienne :
- Délai de 14 jours pour annuler
- Remboursement intégral si aucun usage n'a été fait
- Contact : info@kuisto.ca

## 6. Résiliation

### Par l'utilisateur
- À tout moment depuis le compte
- Accès maintenu jusqu'à la fin de la période payée

### Par Kuisto
- En cas de non-respect des conditions d'utilisation
- Remboursement au prorata

## 7. Remboursements

- Demande via info@kuisto.ca
- Traitement sous 5 jours ouvrés
- Remboursement sur le moyen de paiement original

## 8. Modifications des tarifs

- Notification 30 jours avant tout changement
- Les abonnements en cours ne sont pas affectés

## 9. Contact

Service client : info@kuisto.ca
Téléphone : +1 (613) 422-5120
      `
    }
  },
  en: {
    terms: {
      title: "Terms of Service",
      icon: FileText,
      content: `
# Kuisto Terms of Service

**Last updated: January 2025**

## 1. Acceptance of Terms

By using the Kuisto application, you accept these terms of service. If you do not agree with these terms, please do not use our service.

## 2. Service Description

Kuisto is a personalized recipe generation application based on your available ingredients. The service includes:
- AI-powered recipe generation
- Personalized suggestions based on your dietary preferences
- Automated shopping lists
- Meal planning

## 3. User Account

To access certain features, you must create an account. You are responsible for:
- The confidentiality of your credentials
- Any activity under your account
- The accuracy of provided information

## 4. Acceptable Use

You agree to:
- Use the service only for legal purposes
- Not attempt unauthorized access to our systems
- Not reproduce or distribute content without authorization

## 5. Subscriptions and Payments

Kuisto offers free and premium subscriptions. Payment terms:
- Secure payment via our partners
- Automatic renewal unless cancelled
- Refund according to our 14-day policy

## 6. Intellectual Property

All Kuisto content (texts, images, logos) is protected by copyright. Unauthorized use is strictly prohibited.

## 7. Limitation of Liability

Kuisto cannot be held responsible for indirect damages related to the use of the service. Generated recipes are suggestions and do not replace professional health advice.

## 8. Modification of Terms

We reserve the right to modify these terms at any time. Users will be notified of important changes.

## 9. Contact

For any questions: info@kuisto.ca
      `
    },
    privacy: {
      title: "Privacy Policy",
      icon: Shield,
      content: `
# Kuisto Privacy Policy

**Last updated: January 2025**

## 1. Introduction

Kuisto is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal data.

## 2. Data Collected

We collect the following information:
- **Identification data**: name, email, password (encrypted)
- **Dietary preferences**: diet, allergies, restrictions
- **Usage history**: generated recipes, favorites
- **Technical data**: IP address, device type, browser

## 3. Use of Data

Your data is used to:
- Provide and improve our services
- Personalize your recommendations
- Communicate with you (notifications, newsletters)
- Ensure service security

## 4. Legal Basis

Data processing is based on:
- Contract execution (service provision)
- Your consent (newsletters, cookies)
- Our legitimate interest (service improvement)

## 5. Data Retention

Your data is kept:
- During your account lifetime
- 3 years after inactivity for free accounts
- According to legal obligations for billing data

## 6. Your Rights

Under GDPR and Canadian Law, you have the right to:
- Access your data
- Rectify your information
- Delete your account
- Export your data
- Object to processing

## 7. Security

We implement technical and organizational measures:
- SSL/TLS encryption
- Secure authentication
- Restricted data access
- Continuous monitoring

## 8. Cookies

See our Cookie Policy for more information on cookie usage.

## 9. DPO Contact

To exercise your rights: info@kuisto.ca

## 10. Changes

This policy may be updated. You will be notified of significant changes.
      `
    },
    cookies: {
      title: "Cookie Policy",
      icon: Cookie,
      content: `
# Kuisto Cookie Policy

**Last updated: January 2025**

## 1. What is a cookie?

A cookie is a small text file stored on your device when you visit our site.

## 2. Types of Cookies Used

### Essential Cookies
- **Session**: Managing your connection
- **Security**: Protection against attacks
- **Preferences**: Language, theme

### Analytics Cookies
- **Google Analytics**: Visit statistics
- **Performance**: Loading time

### Advertising Cookies
- **Targeting**: Personalized ads
- **Conversion**: Signup tracking

## 3. Retention Period

| Type | Duration |
|------|----------|
| Session | Until closure |
| Persistent | Maximum 1 year |
| Analytics | 26 months |

## 4. Cookie Management

You can:
- Accept or refuse non-essential cookies
- Change your preferences at any time
- Delete cookies via your browser

## 5. Consequences of Refusal

Refusing essential cookies may prevent the use of certain features.

## 6. Update

This policy may be modified. The last update date is shown above.

## Contact

For any questions: info@kuisto.ca
      `
    },
    legal: {
      title: "Legal Notice",
      icon: Scale,
      content: `
# Legal Notice

**Last updated: January 2025**

## 1. Site Publisher

**Kuisto Inc.**
Canadian corporation

**Headquarters:**
Ottawa, ON, Canada

**Contact:**
- Email: info@kuisto.ca
- Phone: +1 (613) 422-5120

## 2. Publication Director

The publication director is the legal representative of Kuisto Inc.

## 3. Hosting

The site is hosted by:
- **Vercel Inc.**
- 340 S Lemon Ave #4133
- Walnut, CA 91789, USA

## 4. Intellectual Property

The entire site (structure, design, texts, images, logos) is the exclusive property of Kuisto Inc. or its partners. Any reproduction is prohibited without authorization.

## 5. Personal Data

The processing of personal data is described in our Privacy Policy.

## 6. Cookies

The use of cookies is described in our Cookie Policy.

## 7. Jurisdiction

These legal notices are governed by Canadian law. In case of dispute, Canadian courts have exclusive jurisdiction.

## 8. Contact

For any legal questions: info@kuisto.ca
      `
    },
    cgv: {
      title: "Terms & Conditions of Sale",
      icon: FileCheck,
      content: `
# Terms & Conditions of Sale

**Last updated: January 2025**

## 1. Purpose

These T&C govern Premium subscription sales on the Kuisto application.

## 2. Products and Pricing

### Premium Subscription
- **Monthly**: 9.99 CAD/month
- **Yearly**: 79.99 CAD/year (33% savings)

### Premium Benefits
- Unlimited recipes
- High-quality images
- Exclusive features
- Priority support

## 3. Order and Payment

### Accepted Payment Methods
- Credit card (Visa, Mastercard)
- PayPal

### Order Process
1. Subscription selection
2. Account creation/completion
3. Secure payment
4. Immediate activation

## 4. Duration and Renewal

- Subscription is valid for the chosen period
- Renewal is automatic
- Notification before each annual renewal

## 5. Right of Withdrawal

Under Canadian law:
- 14-day period to cancel
- Full refund if no usage
- Contact: info@kuisto.ca

## 6. Termination

### By the user
- At any time from the account
- Access maintained until end of paid period

### By Kuisto
- In case of non-compliance with terms of use
- Pro-rated refund

## 7. Refunds

- Request via info@kuisto.ca
- Processing within 5 business days
- Refund to original payment method

## 8. Price Changes

- 30-day notification before any change
- Current subscriptions are not affected

## 9. Contact

Customer service: info@kuisto.ca
Phone: +1 (613) 422-5120
      `
    }
  }
}

export function LegalModal({ isOpen, onClose, type, language }: LegalModalProps) {
  const content = legalContent[language][type]
  const Icon = content.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-background rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground">
                  {content.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={language === 'fr' ? 'Fermer' : 'Close'}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground">
                <div 
                  className="whitespace-pre-wrap text-sm md:text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: content.content
                      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$2</li>')
                      .replace(/\n\n/g, '</p><p class="mb-4">')
                      .replace(/^(?!<[hlu])/gm, '<p class="mb-4">')
                  }}
                />
              </article>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                © {new Date().getFullYear()} Kuisto. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
