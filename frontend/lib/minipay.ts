// Pure, SSR-safe MiniPay detection. Zero React dependencies.
export function detectMiniPay(): boolean {
  if (typeof window === 'undefined') return false
  return window.ethereum?.isMiniPay === true
}
