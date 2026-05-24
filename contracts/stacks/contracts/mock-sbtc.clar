;; mock-sbtc -- test-only SIP-010 token used to exercise automata-sbtc-vault in simnet.
;; Do NOT deploy this to mainnet; the real sBTC contract is
;; SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.

(define-fungible-token mock-sbtc)

(define-constant ERR-NOT-OWNER (err u1))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-OWNER)
    (try! (ft-transfer? mock-sbtc amount sender recipient))
    (ok true)))

(define-public (mint (amount uint) (to principal))
  (ft-mint? mock-sbtc amount to))

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance mock-sbtc who)))

(define-read-only (get-decimals)     (ok u8))
(define-read-only (get-name)         (ok "Mock sBTC"))
(define-read-only (get-symbol)       (ok "mSBTC"))
(define-read-only (get-token-uri)    (ok none))
(define-read-only (get-total-supply) (ok (ft-get-supply mock-sbtc)))
