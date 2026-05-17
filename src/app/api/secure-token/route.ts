import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'

// This endpoint receives and securely stores the GitHub token
// The token is saved to a file that is NOT tracked by git
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Validate token format
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 400 }
      )
    }

    if (!token.startsWith('github_pat_')) {
      return NextResponse.json(
        { error: 'Le token doit commencer par github_pat_' },
        { status: 400 }
      )
    }

    // Save token to a secure location (not tracked by git)
    const secureDir = join(process.cwd(), '.secure')
    const tokenPath = join(secureDir, 'github-token')
    
    // Create .secure directory if it doesn't exist
    await mkdir(secureDir, { recursive: true })
    
    // Write token to file with restricted permissions
    await writeFile(tokenPath, token, { mode: 0o600 })

    // Also add to .gitignore if not already there
    const gitignorePath = join(process.cwd(), '.gitignore')
    let gitignoreContent = ''
    try {
      gitignoreContent = await readFile(gitignorePath, 'utf-8')
    } catch {
      // .gitignore doesn't exist
    }
    
    if (!gitignoreContent.includes('.secure/')) {
      await writeFile(gitignorePath, gitignoreContent + '\n# Secure tokens\n.secure/\n', { flag: 'a' })
    }

    return NextResponse.json({ success: true, message: 'Token sécurisé avec succès' })
  } catch (error) {
    console.error('Error saving token:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du token' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tokenPath = join(process.cwd(), '.secure', 'github-token')
    const token = await readFile(tokenPath, 'utf-8')
    
    return NextResponse.json({ 
      configured: true,
      preview: token.substring(0, 15) + '...' + token.substring(token.length - 4)
    })
  } catch {
    return NextResponse.json({ configured: false })
  }
}

// Delete token
export async function DELETE() {
  try {
    const tokenPath = join(process.cwd(), '.secure', 'github-token')
    const { unlink } = await import('fs/promises')
    await unlink(tokenPath)
    return NextResponse.json({ success: true, message: 'Token supprimé' })
  } catch {
    return NextResponse.json({ configured: false })
  }
}
