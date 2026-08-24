import fs from 'node:fs'
import path from 'node:path'

export function repoHasApp(repoRoot: string, appType: string): boolean {
  return fs.existsSync(path.join(repoRoot, 'apps', appType))
}

export function repoHasWebapp(repoRoot: string): boolean {
  return repoHasApp(repoRoot, 'webapp')
}

export function repoHasExtapp(repoRoot: string): boolean {
  return repoHasApp(repoRoot, 'extapp')
}

export function repoHasMobapp(repoRoot: string): boolean {
  return repoHasApp(repoRoot, 'mobapp')
}
