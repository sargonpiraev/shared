export function gcpProjectIdFromServiceAccountKeyB64(b64: string): string {
  const parsed = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8')) as { project_id?: string }
  const projectId = parsed.project_id
  if (!projectId) {
    throw new Error('GCP service account JSON has no project_id — cannot derive gcpProjectId')
  }
  return projectId
}
