;; title: automata-intent
;; version: 1.0.0
;; summary: Cross-chain intent registry for the Automata agent.
;; description:
;;   Users post a signed intent ("convert 0.1 sBTC to USDC on Base, expire
;;   at block H, pay solver up to N micro-units fee"). A whitelisted solver
;;   fulfils it off-chain and reports completion on-chain. The registry
;;   tracks lifecycle (open / fulfilled / cancelled / expired) so the agent
;;   and frontend can render status without relying on solver claims alone.
;;
;;   v1 intentionally keeps fulfilment trust-minimised-but-not-trustless:
;;   only whitelisted solvers can mark an intent fulfilled. A future v2 can
;;   bolt on Bitcoin SPV proofs or sBTC peg-out proofs.

;; ---------- constants ----------
(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-NOT-OWNER       (err u300))
(define-constant ERR-NOT-SOLVER      (err u301))
(define-constant ERR-NOT-FOUND       (err u302))
(define-constant ERR-NOT-OPEN        (err u303))
(define-constant ERR-NOT-CREATOR     (err u304))
(define-constant ERR-EXPIRED         (err u305))
(define-constant ERR-INVALID         (err u306))

(define-constant STATUS-OPEN       u1)
(define-constant STATUS-FULFILLED  u2)
(define-constant STATUS-CANCELLED  u3)
(define-constant STATUS-EXPIRED    u4)

;; ---------- data vars ----------
(define-data-var next-id    uint u1)
(define-data-var open-count uint u0)

;; ---------- data maps ----------
(define-map solvers principal bool)

(define-map intents
  uint
  {
    creator:        principal,
    from-asset:     (string-ascii 32),    ;; e.g. "sBTC"
    to-asset:       (string-ascii 32),    ;; e.g. "USDC"
    to-chain:       (string-ascii 16),    ;; e.g. "base", "celo", "stellar"
    recipient:      (string-ascii 128),   ;; destination address (chain-encoded)
    amount-in:      uint,
    min-amount-out: uint,
    max-fee:        uint,
    deadline:       uint,                 ;; stacks-block-height
    status:         uint,
    solver:         (optional principal),
    fulfilled-at:   (optional uint),
    proof:          (optional (buff 256))
  }
)

;; ---------- public ----------

(define-public (post-intent
  (from-asset (string-ascii 32))
  (to-asset (string-ascii 32))
  (to-chain (string-ascii 16))
  (recipient (string-ascii 128))
  (amount-in uint)
  (min-amount-out uint)
  (max-fee uint)
  (deadline uint))
  (let ((id (var-get next-id)))
    (asserts! (> amount-in u0)               ERR-INVALID)
    (asserts! (> deadline stacks-block-height) ERR-EXPIRED)

    (map-set intents id {
      creator:        tx-sender,
      from-asset:     from-asset,
      to-asset:       to-asset,
      to-chain:       to-chain,
      recipient:      recipient,
      amount-in:      amount-in,
      min-amount-out: min-amount-out,
      max-fee:        max-fee,
      deadline:       deadline,
      status:         STATUS-OPEN,
      solver:         none,
      fulfilled-at:   none,
      proof:          none
    })
    (var-set next-id    (+ id u1))
    (var-set open-count (+ (var-get open-count) u1))
    (print { event: "intent-posted", id: id, creator: tx-sender })
    (ok id)
  )
)

(define-public (cancel-intent (id uint))
  (let ((intent (unwrap! (map-get? intents id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get creator intent) tx-sender) ERR-NOT-CREATOR)
    (asserts! (is-eq (get status intent) STATUS-OPEN) ERR-NOT-OPEN)
    (map-set intents id (merge intent { status: STATUS-CANCELLED }))
    (var-set open-count (- (var-get open-count) u1))
    (print { event: "intent-cancelled", id: id })
    (ok true)
  )
)

(define-public (fulfill-intent (id uint) (proof (buff 256)))
  (let ((intent (unwrap! (map-get? intents id) ERR-NOT-FOUND)))
    (asserts! (default-to false (map-get? solvers tx-sender)) ERR-NOT-SOLVER)
    (asserts! (is-eq (get status intent) STATUS-OPEN)         ERR-NOT-OPEN)
    (asserts! (<= stacks-block-height (get deadline intent))  ERR-EXPIRED)

    (map-set intents id (merge intent {
      status:       STATUS-FULFILLED,
      solver:       (some tx-sender),
      fulfilled-at: (some stacks-block-height),
      proof:        (some proof)
    }))
    (var-set open-count (- (var-get open-count) u1))
    (print { event: "intent-fulfilled", id: id, solver: tx-sender })
    (ok true)
  )
)

(define-public (mark-expired (id uint))
  (let ((intent (unwrap! (map-get? intents id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get status intent) STATUS-OPEN)        ERR-NOT-OPEN)
    (asserts! (> stacks-block-height (get deadline intent))  ERR-INVALID)
    (map-set intents id (merge intent { status: STATUS-EXPIRED }))
    (var-set open-count (- (var-get open-count) u1))
    (print { event: "intent-expired", id: id })
    (ok true)
  )
)

;; ---------- admin ----------

(define-public (set-solver (who principal) (allowed bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (map-set solvers who allowed)
    (print { event: "solver-set", solver: who, allowed: allowed })
    (ok true)
  )
)

;; ---------- read-only ----------

(define-read-only (get-intent (id uint)) (map-get? intents id))
(define-read-only (is-solver  (who principal)) (default-to false (map-get? solvers who)))
(define-read-only (get-open-count) (var-get open-count))
(define-read-only (get-next-id)    (var-get next-id))
