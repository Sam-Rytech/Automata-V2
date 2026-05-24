;; title: automata-stacker
;; version: 1.0.0
;; summary: Delegated STX stacking pool for the Automata agent.
;; description:
;;   Users delegate STX to this contract via the canonical PoX-4 contract.
;;   The pool operator (set by the deployer) aggregates delegated STX and
;;   stacks it for BTC rewards. This contract acts as an on-chain registry
;;   of enrolled stackers, their delegated amount, and their BTC reward
;;   address; it does NOT custody STX directly -- PoX-4 locks the user's
;;   STX in their own account.
;;
;;   Off-chain, the Automata agent calls:
;;     1. pox-4.delegate-stx  (from the user)         to authorize delegation
;;     2. automata-stacker.enroll                     to register with the pool
;;     3. automata-stacker.stack-aggregate (operator) to lock cycles in PoX-4

;; ---------- constants ----------
(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-NOT-OWNER         (err u100))
(define-constant ERR-ALREADY-ENROLLED  (err u101))
(define-constant ERR-NOT-ENROLLED      (err u102))
(define-constant ERR-INVALID-AMOUNT    (err u103))
(define-constant ERR-PAUSED            (err u104))

;; ---------- data vars ----------
(define-data-var operator   principal CONTRACT-OWNER)
(define-data-var paused     bool      false)
(define-data-var total-delegated uint u0)
(define-data-var enrolled-count  uint u0)

;; ---------- data maps ----------
;; user -> { delegated-ustx, btc-reward-addr (version + hashbytes), enrolled-at }
(define-map enrollments
  principal
  {
    delegated-ustx: uint,
    pox-addr:       { version: (buff 1), hashbytes: (buff 32) },
    enrolled-at:    uint
  }
)

;; ---------- public functions ----------

(define-public (enroll
  (amount-ustx uint)
  (pox-addr { version: (buff 1), hashbytes: (buff 32) }))
  (begin
    (asserts! (not (var-get paused))                 ERR-PAUSED)
    (asserts! (> amount-ustx u0)                     ERR-INVALID-AMOUNT)
    (asserts! (is-none (map-get? enrollments tx-sender)) ERR-ALREADY-ENROLLED)

    (map-set enrollments tx-sender {
      delegated-ustx: amount-ustx,
      pox-addr:       pox-addr,
      enrolled-at:    stacks-block-height
    })
    (var-set total-delegated (+ (var-get total-delegated) amount-ustx))
    (var-set enrolled-count  (+ (var-get enrolled-count)  u1))
    (print { event: "enroll", user: tx-sender, amount: amount-ustx })
    (ok true)
  )
)

(define-public (update-amount (new-amount uint))
  (let ((current (unwrap! (map-get? enrollments tx-sender) ERR-NOT-ENROLLED)))
    (asserts! (> new-amount u0) ERR-INVALID-AMOUNT)
    (var-set total-delegated
      (+ (- (var-get total-delegated) (get delegated-ustx current)) new-amount))
    (map-set enrollments tx-sender (merge current { delegated-ustx: new-amount }))
    (print { event: "update", user: tx-sender, amount: new-amount })
    (ok true)
  )
)

(define-public (leave)
  (let ((current (unwrap! (map-get? enrollments tx-sender) ERR-NOT-ENROLLED)))
    (map-delete enrollments tx-sender)
    (var-set total-delegated (- (var-get total-delegated) (get delegated-ustx current)))
    (var-set enrolled-count  (- (var-get enrolled-count)  u1))
    (print { event: "leave", user: tx-sender })
    (ok true)
  )
)

;; Operator-only: emits an event that an off-chain runner uses to call
;; pox-4.delegate-stack-stx on behalf of `user`. Keeping the actual PoX-4
;; cross-contract call in a separate, swappable adapter avoids hard-pinning
;; this contract to a single pox-4 deployment address across epochs.
(define-public (stack-signal
  (user principal)
  (start-burn-ht uint)
  (lock-period uint))
  (begin
    (asserts! (is-eq contract-caller (var-get operator)) ERR-NOT-OWNER)
    (asserts! (is-some (map-get? enrollments user))      ERR-NOT-ENROLLED)
    (print {
      event: "stack-signal",
      user: user,
      start-burn-ht: start-burn-ht,
      lock-period: lock-period
    })
    (ok true)
  )
)

;; ---------- admin ----------

(define-public (set-operator (new-operator principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (var-set operator new-operator)
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

(define-read-only (get-enrollment (user principal))
  (map-get? enrollments user)
)

(define-read-only (get-total-delegated) (var-get total-delegated))
(define-read-only (get-enrolled-count)  (var-get enrolled-count))
(define-read-only (get-operator)        (var-get operator))
(define-read-only (is-paused)           (var-get paused))
