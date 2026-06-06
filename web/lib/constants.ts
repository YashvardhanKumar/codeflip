const isServer = typeof window === 'undefined'

const getBaseUrl = () => {
  // 1. Check for explicit environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api`
  }

  // 2. Client-side: detect current host
  if (!isServer) {
    const { protocol, hostname, port } = window.location
    // If we're on localhost, use the standard dev port for the API (8000 or proxy 80)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`
    }
  }

  // 3. Fallback to default
  return 'http://localhost/api'
}

const BASE_URL = getBaseUrl()

const CODE_RUNNER_URL = process.env.NEXT_PUBLIC_CODE_RUNNER_URL
  ? `${process.env.NEXT_PUBLIC_CODE_RUNNER_URL}`
  : 'http://10.82.221.23:2358'

export { BASE_URL, CODE_RUNNER_URL }
