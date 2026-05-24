;; title: automata-sbtc-vault
;; version: 1.0.0
;; summary: Per-user sBTC deposit vault for the Automata agent.
;; description:
;;   A minimal SIP-010 escrow that lets a user deposit sBTC, track their
;;   on-chain balance, and withdraw at any time. This is the foundation
;;   for BTC-backed strategies (yield, collateral, intent fulfilment).
;;   Strategy hooks are intentionally out of scope for v1 -- the vault
;;   just custodies sBTC under per-principal accounting.

;; ---------- traits ----------
;; SIP-010 fungible token trait. Inlined to keep this contract self-contained;
;; replace with a `use-trait` against the canonical sbtc-token contract before
;; mainnet deploy.
(define-trait sip-010-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
    (get-decimals () (response uint uint))
    (get-name () (response (string-ascii 32) uint))
    (get-symbol () (response (string-ascii 32) uint))
    (get-token-uri () (response (optional (string-utf8 256)) uint))
    (get-total-supply () (response uint uint))
  )
)

;; ---------- constants ----------
(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-NOT-OWNER       (err u200))
(define-constant ERR-INVALID-AMOUNT  (err u201))
(define-constant ERR-INSUFFICIENT    (err u202))
(define-constant ERR-PAUSED          (err u203))
(define-constant ERR-WRONG-TOKEN     (err u204))
(define-constant ERR-TRANSFER-FAILED (err u205))

;; ---------- data vars ----------
(define-data-var paused        bool       false)
(define-data-var total-deposit uint       u0)
(define-data-var sbtc-token-id principal  CONTRACT-OWNER) ;; set via set-sbtc-token

;; ---------- data maps ----------
(define-map balances principal uint)

;; ---------- public ----------

(define-public (set-sbtc-token (token principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (var-set sbtc-token-id token)
    (ok true)
  )
)

(define-public (deposit (token <sip-010-trait>) (amount uint))
  (let
    (
      (sender tx-sender)
      (self   (as-contract tx-sender))
    )
    (asserts! (not (var-get paused))                       ERR-PAUSED)
    (asserts! (> amount u0)                                ERR-INVALID-AMOUNT)
    (asserts! (is-eq (contract-of token) (var-get sbtc-token-id)) ERR-WRONG-TOKEN)

    (unwrap! (contract-call? token transfer amount sender self none)
             ERR-TRANSFER-FAILED)

    (map-set balances sender
      (+ (default-to u0 (map-get? balances sender)) amount))
    (var-set total-deposit (+ (var-get total-deposit) amount))
    (print { event: "deposit", user: sender, amount: amount })
    (ok true)
  )
)

(define-public (withdraw (token <sip-010-trait>) (amount uint))
  (let ((bal (default-to u0 (map-get? balances tx-sender)))
        (recipient tx-sender))
    (asserts! (> amount u0)                                ERR-INVALID-AMOUNT)
    (asserts! (>= bal amount)                              ERR-INSUFFICIENT)
    (asserts! (is-eq (contract-of token) (var-get sbtc-token-id)) ERR-WRONG-TOKEN)

    (map-set balances recipient (- bal amount))
    (var-set total-deposit (- (var-get total-deposit) amount))

    (unwrap!
      (as-contract
        (contract-call? token transfer amount tx-sender recipient none))
      ERR-TRANSFER-FAILED)

    (print { event: "withdraw", user: recipient, amount: amount })
    (ok true)
  )
)

(define-public (set-paused (p bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (var-set paused p)
    (ok true)
  )
)

;; ---------- read-only ----------

(define-read-only (get-balance (user principal))
  (default-to u0 (map-get? balances user)))

(define-read-only (get-total-deposit) (var-get total-deposit))
(define-read-only (get-sbtc-token)    (var-get sbtc-token-id))
(define-read-only (is-paused)         (var-get paused))
