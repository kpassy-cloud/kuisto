#!/bin/bash

# Secure Git Helper Script
# This script reads the GitHub token from a secure file and uses it for git operations

SECURE_DIR="/home/z/my-project/.secure"
TOKEN_FILE="$SECURE_DIR/github-token"
REPO_URL="github.com/kpassy-cloud/kuisto.git"

# Check if token exists
if [ ! -f "$TOKEN_FILE" ]; then
    echo "❌ Aucun token configuré."
    echo "📝 Allez sur http://localhost:3000/secure-token.html pour configurer votre token."
    exit 1
fi

# Read token
TOKEN=$(cat "$TOKEN_FILE")

# Function to setup git with token
setup_git() {
    cd /home/z/my-project
    git remote set-url origin "https://${TOKEN}@${REPO_URL}"
    echo "✅ Git configuré avec le token sécurisé"
}

# Function to push
git_push() {
    setup_git
    git push origin main
    # Remove token from remote URL after push for security
    git remote set-url origin "git@github.com:kpassy-cloud/kuisto.git"
}

# Function to pull
git_pull() {
    setup_git
    git pull origin main
    git remote set-url origin "git@github.com:kpassy-cloud/kuisto.git"
}

# Function to sync (reset to remote)
git_sync() {
    setup_git
    git fetch origin
    git reset --hard origin/main
    git remote set-url origin "git@github.com:kpassy-cloud/kuisto.git"
    echo "✅ Sandbox synchronisé avec GitHub"
}

# Main
case "$1" in
    setup)
        setup_git
        ;;
    push)
        git_push
        ;;
    pull)
        git_pull
        ;;
    sync)
        git_sync
        ;;
    status)
        if [ -f "$TOKEN_FILE" ]; then
            TOKEN_PREVIEW=$(head -c 15 "$TOKEN_FILE")...$(tail -c 5 "$TOKEN_FILE")
            echo "✅ Token configuré: $TOKEN_PREVIEW"
        else
            echo "❌ Aucun token configuré"
        fi
        ;;
    *)
        echo "Usage: $0 {setup|push|pull|sync|status}"
        exit 1
        ;;
esac
