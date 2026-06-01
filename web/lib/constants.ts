const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api`
  : 'http://localhost/api'
const CODE_RUNNER_URL = process.env.NEXT_PUBLIC_CODE_RUNNER_URL
  ? `${process.env.NEXT_PUBLIC_CODE_RUNNER_URL}`
  : 'http://10.82.221.23:2358'
export { BASE_URL, CODE_RUNNER_URL }
