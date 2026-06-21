# Fahman Orders - User-Story Backlog & Acceptance Criteria
### D-08 - User-Story Backlog + Acceptance Criteria
*Real-time Ordering & Home-Delivery PWA - Johor, Malaysia*

| Field | Value |
|---|---|
| Document | D-08 - User-Story Backlog + Acceptance Criteria |
| Product | Fahman Orders (Real-time Ordering & Home-Delivery PWA - Johor, Malaysia) |
| Version | 1.0 |
| Date | 19 June 2026 |
| Status | For build |
| Phase | 1 - Requirements |
| Depends on | D-06 SRS - D-07 Use-Case Catalogue |
| Feeds into | D-17 Work Breakdown & Build Sequence - D-20 Test Cases & RTM |
| Region / Locale | Johor, Malaysia - MYT (UTC+8) - MYR |

> **At a glance:** **60 user stories** across **13 epics**, totalling **197 story points**, sequenced into **5 iterations**, with **100% coverage of all 52 SRS functional requirements** (44 Must + 8 Should) proven in the traceability matrix (§9). A **12-item v2 expansion backlog** (§10) captures everything deferred from v1.

---

## 1. Introduction & Purpose

This backlog converts the requirements contract (D-06 SRS) and behavioural specifications (D-07 Use-Case Catalogue) into prioritised, independently buildable **user stories**, each with **Given/When/Then** acceptance criteria. It is the granular, testable unit of work the implementation phase consumes: every story is small enough to build and verify on its own, and every story traces back to at least one numbered functional requirement and forward to the test cases in D-20.

**How to use this document.** Build epic by epic in the sprint order of §8. Treat each story's Given/When/Then as the acceptance test: a story is *done* only when every scenario passes (see the Definition of Done in §5). The traceability matrix in §9 is the checklist that proves no requirement was dropped.

**Traceability model.**

```
D-06 SRS (FR-C/O/R/S)  ─┐
                        ├─►  D-08 User Stories (US-###, Given/When/Then)  ─►  D-17 WBS / build units
D-07 Use Cases (UC-*)  ─┘                                                  └─►  D-20 Test Cases + RTM
```

## 2. Product Context

Fahman Orders is a mobile-first PWA replacing a solo Malaysian (Johor) shawarma seller's manual WhatsApp + Google-Form ordering and delivery workflow. Three roles: Customer, Operator/Admin, Rider. Core features: live shop status (Open/Closed/Sold-Out), live remaining-quantity counter, bilingual menu with prices, ordering with delivery zone + address or walk-in pickup, real-time order tracking, and automated bilingual WhatsApp notifications. Trading hours 13:00-19:00 MYT or until sold out; operator-set daily quantity, cut-off, delivery window and zones (Pulai Spring, D'summit, Garden, Desa, Greenfield + nearby); one motorbike rider. Stack: Next.js + TypeScript + Tailwind PWA; Supabase (Postgres/Realtime/Auth/Storage); Vercel (Singapore, ap-southeast-1); WhatsApp Cloud API; phone-OTP auth; bilingual Arabic (RTL) / English; payments v1 = COD + DuitNow QR (gateway deferred to v2). Currency MYR, timezone MYT.

## 3. Personas & Actors

Stories are written from the four actor classes defined in the SRS (§2.3). Persona names are illustrative; the role is what drives each story.

| Actor / Role | Persona | Characteristics | Tech level |
|---|---|---|---|
| **Customer** | Aisha - home buyer | Home buyers inside the defined Johor zones; phone-first; WhatsApp-native; bilingual AR/EN; low-to-medium tech skill. Wants to see if the shop is open, what is left, and order in under a minute. | Low-Medium |
| **Operator / Admin** | Fahman - the seller | The shawarma seller; works from one phone while cooking; non-technical; needs every action in <=2 taps and zero jargon. Must run the whole day without typing a single manual broadcast. | Low (non-technical) |
| **Rider** | Rashid - motorbike rider | One motorbike rider; needs addresses, navigation and customer phone; works the delivery window; updates status one-handed at the door. | Low-Medium |
| **System** | Automation actor | Timer- and event-driven behaviour: inventory decrement, auto sold-out, auto-close at cut-off and 19:00, and one notification per state change. | n/a |

## 4. How to Read a Story

Each story carries: a stable **ID** (`US-###`), the **epic** it belongs to, the **As a / I want / So that** statement, linked **FR** and **UC** IDs (and NFR IDs where relevant), a **MoSCoW** priority, a Fibonacci **story-point** estimate, an **MVP** flag, an **INVEST** note, and one or more **Given/When/Then** scenarios.

**MoSCoW priority.**

| Priority | Meaning |
|---|---|
| **Must** | MVP-critical. The product cannot launch or be demonstrated without it. |
| **Should** | Important and in MVP scope if capacity allows; can slip to a fast-follow without blocking launch. |
| **Could** | Desirable, low cost; included only if time remains. Mostly tracked in the v2 backlog. |
| **Won't (v2)** | Explicitly out of v1 scope; captured in the v2 expansion backlog so nothing is lost. |

**Story points (Fibonacci).**

| Points | Meaning |
|---|---|
| **1** | Trivial - a few hours; well-understood, no unknowns, no new integration. |
| **2** | Small - under a day; one screen or one endpoint, established pattern. |
| **3** | Moderate - ~1 day; some logic or UI state, light integration. |
| **5** | Large - 2-3 days; multiple states, real-time or external integration, edge cases. |
| **8** | Complex - ~a week; concurrency, race-safety, or cross-cutting security work. |
| **13** | Epic-sized - split before building; carries material unknowns. |

> Estimates are unitless story points on a Fibonacci scale (relative complexity + effort + uncertainty), not hours. Velocity in the release plan assumes one AI-assisted builder at roughly 38-42 points per one-week iteration. Sprint 0 sets the true baseline, after which capacity is re-checked; Sprint 3 is the planned peak and the first candidate to split if measured velocity is lower.

## 5. Definition of Ready & Definition of Done

**Definition of Ready** - a story may enter a sprint only when:

- Story follows the As-a / I-want / So-that form and is independently demonstrable (INVEST).
- At least one linked FR ID (and a UC where one exists) is present and valid against the SRS/Use-Case Catalogue.
- MoSCoW priority and a point estimate are agreed.
- Given/When/Then acceptance criteria are written and cover the happy path plus at least one negative/edge case.
- Bilingual (AR-RTL / EN) and the relevant empty/loading/error states are considered where the story has UI.
- External dependencies (WhatsApp Cloud API, Supabase, Google Maps, DuitNow) are identified and available in the target environment.

**Definition of Done** - a story is complete only when:

- Code merged to main behind passing CI (TypeScript types, lint, unit/integration tests).
- Every Given/When/Then scenario passes as an automated or scripted test and is linked in D-20 (RTM).
- Real-time paths verified to propagate within the NFR budget (status/quantity/board < 2 s at p95).
- Bilingual parity verified (AR-RTL + EN) and WCAG 2.1 AA checks pass for any new UI (tap targets >= 44x44 px).
- RBAC + row-level security enforced and tested for the role(s) the story touches.
- Deployed to a Vercel preview and smoke-tested on a mid-range Android over 4G.
- Operator-facing behaviour is reflected in the Operator Manual / Rider Guide (D-23) where user-visible.

## 6. Epic Overview

| Epic | Name | Primary owner | Stories | Points | Must |
|---|---|---|---:|---:|---:|
| EP-01 | Authentication, Roles & Access | System / All | 7 | 25 | 7 |
| EP-02 | Live Shop Status & Inventory Visibility | Customer / System | 3 | 11 | 3 |
| EP-03 | Menu & Localization | Customer | 2 | 8 | 2 |
| EP-04 | Customer Ordering & Checkout | Customer | 8 | 26 | 6 |
| EP-05 | Order Tracking & Customer Notifications | Customer / System | 2 | 6 | 2 |
| EP-06 | Operator: Trading-Day Control | Operator | 8 | 18 | 8 |
| EP-07 | Operator: Menu Management | Operator | 1 | 5 | 1 |
| EP-08 | Operator: Order Board & Fulfilment | Operator | 6 | 19 | 2 |
| EP-09 | Operator: Broadcast & Announcements | Operator | 1 | 3 | 1 |
| EP-10 | Rider Delivery | Rider | 6 | 15 | 6 |
| EP-11 | Automation & Inventory Integrity | System | 5 | 19 | 5 |
| EP-12 | Notifications & Messaging Infrastructure | System | 4 | 16 | 2 |
| EP-13 | Cross-cutting Quality & Non-Functional Enablers | System / All | 7 | 26 | 4 |
| | **Total** | | **60** | **197** | **49** |

## 7. The Backlog

### EP-01 - Authentication, Roles & Access

*Owner: System / All. Phone-OTP identity, role resolution, RBAC, row-level security, abuse protection and consent - the trust foundation every other epic stands on.*

#### US-001 - Customer phone-OTP sign-up & sign-in

> **As a** Customer, **I want to** register and sign in with a one-time code sent to my phone number, **so that** I can order without creating or remembering a password.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-01 | Must | 5 | Yes | S0 - Foundation & Walking Skeleton | FR-C-01 | UC-C-01 | NFR-S-02 |

*INVEST: Independent of ordering; valuable as the entry gate; testable via OTP issue/verify.*

**Acceptance criteria**

- **Scenario: Successful first-time sign-in**
  - *Given* I am an unregistered visitor on the login screen
  - *When* I enter a valid Malaysian phone number and submit the OTP I receive
  - *Then* an authenticated Customer session is created within 60 seconds
  - *And* a customer profile is provisioned with my phone and default language
- **Scenario: Invalid or expired code is rejected**
  - *Given* I requested an OTP
  - *When* I enter a wrong or expired code
  - *Then* sign-in is refused with a clear bilingual message
  - *And* no session is created

#### US-002 - Rider phone-OTP sign-in with rider role

> **As a** Rider, **I want to** sign in with my phone number and land in the rider experience, **so that** I only ever see delivery features, not customer or admin screens.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-01 | Must | 2 | Yes | S0 - Foundation & Walking Skeleton | FR-R-01 | UC-R-01, UC-C-01 | NFR-S-03 |

*INVEST: Small, role-resolution slice; testable by asserting the rider-only surface.*

**Acceptance criteria**

- **Scenario: Rider sees only rider features**
  - *Given* my number is provisioned with the rider role
  - *When* I complete OTP sign-in
  - *Then* I land on today's deliveries
  - *And* no customer ordering or operator admin actions are visible to me

#### US-003 - Operator secure sign-in & role resolution

> **As a** Operator, **I want to** sign in with my phone number and be recognised as the operator, **so that** only I can control the trading day and the order board.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-01 | Must | 3 | Yes | S0 - Foundation & Walking Skeleton | FR-S-12 | UC-O-01 | NFR-S-02 |

*INVEST: Role resolution is independently testable; valuable as admin gate.*

**Acceptance criteria**

- **Scenario: Operator role unlocks admin**
  - *Given* my number carries the operator role
  - *When* I complete OTP sign-in
  - *Then* I reach the operator dashboard with Open/Close/Sold-Out controls
- **Scenario: Non-operator cannot reach admin**
  - *Given* I am signed in as a customer
  - *When* I request an operator-only route directly
  - *Then* the request is denied by role-based access control

#### US-004 - Role-based access control on every endpoint

> **As a** System, **I want to** authorize every request against the caller's role at the application layer, **so that** no actor can perform an action outside their role.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-01 | Must | 5 | Yes | S0 - Foundation & Walking Skeleton | FR-S-12 | - | NFR-S-03 |

*INVEST: Cross-cutting but independently testable per-role; high value (security).*

**Acceptance criteria**

- **Scenario: Cross-role action blocked**
  - *Given* a caller authenticated as one role
  - *When* they invoke an endpoint reserved for another role
  - *Then* the call is rejected with an authorization error and is logged
- **Scenario: In-role action allowed**
  - *Given* a caller in the correct role
  - *When* they invoke an endpoint for that role
  - *Then* the action proceeds normally

#### US-005 - Row-level data isolation

> **As a** System, **I want to** enforce row-level security in the database, **so that** customers read only their own data and the rider sees only assigned deliveries.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-01 | Must | 5 | Yes | S0 - Foundation & Walking Skeleton | FR-S-13 | UC-R-01 | NFR-S-03 |

*INVEST: Defence-in-depth layer testable independently of the app layer.*

**Acceptance criteria**

- **Scenario: Customer cannot read another customer's order**
  - *Given* two customers each with orders
  - *When* customer A requests customer B's order by id
  - *Then* the row is not returned
- **Scenario: Rider sees only assigned deliveries**
  - *Given* orders dispatched to the rider and others not
  - *When* the rider lists deliveries
  - *Then* only assigned/ready deliveries are returned

#### US-006 - OTP rate-limiting & abuse protection

> **As a** System, **I want to** throttle OTP requests per number and per IP, **so that** the auth channel cannot be abused or used to rack up messaging cost.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-01 | Must | 3 | Yes | S0 - Foundation & Walking Skeleton | FR-S-14 | UC-C-01 | NFR-S-02 |

*INVEST: Independent guard; testable by exceeding the threshold.*

**Acceptance criteria**

- **Scenario: Excess requests are blocked**
  - *Given* an OTP request limit per number/IP per window
  - *When* requests exceed the limit
  - *Then* further requests are blocked with a retry-after message
  - *And* the event is recorded

#### US-007 - Explicit consent opt-in at signup (PDPA)

> **As a** Customer, **I want to** give explicit consent for data use and notifications when I sign up, **so that** my personal data is handled lawfully under Malaysia's PDPA.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-01 | Must | 2 | Yes | S0 - Foundation & Walking Skeleton | (NFR / enabler) | UC-C-01 | NFR-C-01 |

*INVEST: Small, compliance-critical, independently testable.*

**Acceptance criteria**

- **Scenario: Consent is required and recorded**
  - *Given* I am completing signup
  - *When* I proceed without opting in to data use and notifications
  - *Then* I cannot complete signup until consent is given
  - *And* the consent timestamp and version are stored


### EP-02 - Live Shop Status & Inventory Visibility

*Owner: Customer / System. Every customer always sees an accurate, real-time Open/Closed/Sold-Out status and remaining-quantity counter.*

#### US-008 - Customer views live shop status

> **As a** Customer, **I want to** see the current Open / Closed / Sold-Out status without refreshing, **so that** I never waste time trying to order when the shop is unavailable.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-02 | Must | 3 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-C-02 | UC-C-02 | NFR-P-01 |

*INVEST: Independently demonstrable read path; testable against operator setting.*

**Acceptance criteria**

- **Scenario: Status matches operator setting live**
  - *Given* the home/menu screen is open
  - *When* the operator changes the shop status
  - *Then* my view reflects the new status within 2 seconds with no manual refresh
- **Scenario: Closed state communicated clearly**
  - *Given* the shop is Closed
  - *When* I open the app
  - *Then* a clear Closed banner is shown and ordering controls are disabled

#### US-009 - Customer sees live remaining-quantity counter

> **As a** Customer, **I want to** see how many portions remain while the shop is Open, **so that** I know whether to order now before it sells out.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-02 | Must | 3 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-C-03 | UC-C-02 | NFR-P-01 |

*INVEST: Independent live counter; testable by mutating remaining qty.*

**Acceptance criteria**

- **Scenario: Counter reflects changes within 2 s**
  - *Given* the shop is Open with remaining quantity shown
  - *When* another order is accepted
  - *Then* my counter decreases within 2 seconds without refresh
- **Scenario: Counter hidden when not Open**
  - *Given* the shop is Closed or Sold-Out
  - *When* I view the home screen
  - *Then* the live counter is not shown or shows zero appropriately

#### US-010 - Real-time broadcast of status & quantity to all clients

> **As a** System, **I want to** push shop status and remaining quantity over a realtime channel, **so that** every connected customer converges on the same truth within the latency budget.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-02 | Must | 5 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-S-07 | UC-C-02 | NFR-P-01 |

*INVEST: The shared realtime mechanism; testable for propagation latency.*

**Acceptance criteria**

- **Scenario: Propagation under 2 s at p95**
  - *Given* many subscribed clients
  - *When* status or quantity changes
  - *Then* at least 95 percent of clients reflect it within 2 seconds
- **Scenario: Late joiner gets current state**
  - *Given* a change already happened
  - *When* a new client connects
  - *Then* it immediately receives the current status and quantity


### EP-03 - Menu & Localization

*Owner: Customer. A bilingual, photo-rich menu with MYR prices that customers can read in Arabic (RTL) or English.*

#### US-011 - Customer browses the bilingual menu with prices

> **As a** Customer, **I want to** browse menu items with photos, bilingual names, descriptions and MYR prices, **so that** I can decide what to order with confidence.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-03 | Must | 3 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-C-04 | UC-C-02 | NFR-P-02 |

*INVEST: Independent catalogue view; testable for available/unavailable rendering.*

**Acceptance criteria**

- **Scenario: Available items show price and photo**
  - *Given* the menu has available and unavailable items
  - *When* I open the menu
  - *Then* available items show photo, name and MYR price
  - *And* unavailable items are clearly marked as such
- **Scenario: Fast first paint on 4G**
  - *Given* a mid-range Android on 4G
  - *When* I open the menu cold
  - *Then* it becomes interactive in under 3 seconds

#### US-012 - Customer switches language Arabic (RTL) / English

> **As a** Customer, **I want to** switch the whole app between Arabic and English, **so that** I can use the app in the language I read most comfortably.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-03 | Must | 5 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-C-14 | UC-C-08 | NFR-L-01 |

*INVEST: Independent localization slice; testable for direction and persistence.*

**Acceptance criteria**

- **Scenario: Switching flips text and direction**
  - *Given* the app is in English (LTR)
  - *When* I switch to Arabic
  - *Then* all text becomes Arabic and the layout flips to RTL
- **Scenario: Choice persists across sessions**
  - *Given* I selected Arabic
  - *When* I close and reopen the app
  - *Then* it opens in Arabic (RTL) again


### EP-04 - Customer Ordering & Checkout

*Owner: Customer. Build a cart and place a delivery or pickup order with address/zone and a v1 payment method, only while ordering is open.*

#### US-013 - Customer adds items and quantities to a cart

> **As a** Customer, **I want to** add items and choose quantities in a cart, **so that** I can assemble my whole order before checking out.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Must | 3 | Yes | S2 - Ordering & Inventory Integrity | FR-C-05 | UC-C-03 | - |

*INVEST: Independent cart slice; testable via count/total updates.*

**Acceptance criteria**

- **Scenario: Cart total updates on every change**
  - *Given* I am viewing the menu
  - *When* I add, increase or remove items
  - *Then* the cart item count and MYR total update immediately on each change

#### US-014 - Customer chooses Delivery or Walk-in / Pickup

> **As a** Customer, **I want to** choose between delivery and walk-in pickup, **so that** the order is fulfilled the way that suits me.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Must | 2 | Yes | S2 - Ordering & Inventory Integrity | FR-C-06 | UC-C-03, UC-C-04 | - |

*INVEST: Small fulfilment-type slice; testable by stored type.*

**Acceptance criteria**

- **Scenario: Fulfilment type is stored**
  - *Given* I am at checkout
  - *When* I select Delivery or Walk-in/Pickup
  - *Then* the chosen type is stored on the order
  - *And* delivery-only fields appear only for Delivery

#### US-015 - Customer provides zone and address for delivery

> **As a** Customer, **I want to** select an active zone and enter/save an address with an optional map pin, **so that** the rider can find me and the order is routed to my area.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Must | 5 | Yes | S2 - Ordering & Inventory Integrity | FR-C-07 | UC-C-03 | - |

*INVEST: Independent address slice; testable by blocking submit without it.*

**Acceptance criteria**

- **Scenario: Delivery requires active zone and address**
  - *Given* I chose Delivery
  - *When* I try to submit without an active zone and address
  - *Then* submission is blocked with a clear bilingual prompt
- **Scenario: Saved address is reusable**
  - *Given* I saved an address before
  - *When* I start a new delivery order
  - *Then* I can reuse the saved address with its pin

#### US-016 - Ordering allowed only while Open and before cut-off

> **As a** Customer, **I want to** be prevented from ordering when the shop is not accepting orders, **so that** I am never charged or queued for an order that cannot be fulfilled.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Must | 3 | Yes | S2 - Ordering & Inventory Integrity | FR-C-08 | UC-C-03 | - |

*INVEST: Independent gate; testable across Closed/Sold-Out/after-cutoff.*

**Acceptance criteria**

- **Scenario: Blocked after cut-off**
  - *Given* the cut-off time has passed
  - *When* I try to place an order
  - *Then* ordering is blocked with a clear message explaining why
- **Scenario: Blocked when Closed or Sold-Out**
  - *Given* the shop is Closed or Sold-Out
  - *When* I try to place an order
  - *Then* ordering is blocked

#### US-017 - Customer pays via COD or DuitNow QR with proof upload

> **As a** Customer, **I want to** choose Cash on Delivery or DuitNow QR and upload payment proof, **so that** I can pay the way Malaysians actually pay in v1.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Must | 5 | Yes | S2 - Ordering & Inventory Integrity | FR-C-09 | UC-C-03 | - |

*INVEST: Independent payment-method slice; testable per method.*

**Acceptance criteria**

- **Scenario: QR order requires a proof image**
  - *Given* I chose DuitNow QR
  - *When* I try to confirm without uploading a proof image
  - *Then* confirmation is blocked until a proof image is attached
- **Scenario: COD needs no proof**
  - *Given* I chose Cash on Delivery
  - *When* I confirm the order
  - *Then* the order is placed without a proof upload

#### US-018 - Customer receives confirmation and tracking timeline

> **As a** Customer, **I want to** see an order confirmation with a tracking timeline of all states, **so that** I know my order was received and where it is.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-C-10 | UC-C-05 | - |

*INVEST: Independent confirmation view; testable by timeline rendering.*

**Acceptance criteria**

- **Scenario: Timeline lists states and highlights current**
  - *Given* I just placed an order
  - *When* the confirmation appears
  - *Then* a timeline lists all lifecycle states and highlights the current one

#### US-019 - Customer cancels an order before Preparing

> **As a** Customer, **I want to** cancel my order while it is still New or Confirmed, **so that** I can back out before the operator starts cooking.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Should | 3 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-C-15 | UC-C-07 | - |

*INVEST: Independent cancel slice; testable across allowed/disallowed states.*

**Acceptance criteria**

- **Scenario: Cancel available only before Preparing**
  - *Given* my order is in New or Confirmed
  - *When* I cancel
  - *Then* the order is cancelled and the reserved quantity is returned to stock
- **Scenario: Cancel disabled once Preparing**
  - *Given* my order has entered Preparing
  - *When* I view the order
  - *Then* cancel is disabled with an explanation

#### US-020 - Customer views order history

> **As a** Customer, **I want to** see my past orders with date, items, total and final status, **so that** I can reorder mentally and keep a record.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-04 | Should | 2 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-C-12 | UC-C-06 | - |

*INVEST: Independent history list; testable by listing prior orders.*

**Acceptance criteria**

- **Scenario: History shows key fields**
  - *Given* I have completed orders
  - *When* I open order history
  - *Then* each row shows date, items, MYR total and final status


### EP-05 - Order Tracking & Customer Notifications

*Owner: Customer / System. A live tracking timeline plus one automatic notification on every state change - replacing the manual WhatsApp updates.*

#### US-021 - Customer order status updates in real time

> **As a** Customer, **I want to** watch my order status change live as the operator and rider progress it, **so that** I do not need to ask for updates.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-05 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-C-11 | UC-C-05 | NFR-P-01 |

*INVEST: Independent live-tracking slice; testable for sub-2 s update.*

**Acceptance criteria**

- **Scenario: Operator/rider change appears within 2 s**
  - *Given* I am viewing my order's tracking
  - *When* the operator or rider advances the status
  - *Then* my view updates within 2 seconds without refresh

#### US-022 - Customer receives an automatic notification per state change

> **As a** Customer, **I want to** get a notification each time my order changes state, **so that** I am informed even when the app is closed.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-05 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-C-13 | UC-S-03 | NFR-R-03 |

*INVEST: Independent notify-on-change slice; testable for exactly-once.*

**Acceptance criteria**

- **Scenario: Exactly one message per transition**
  - *Given* my order advances through states
  - *When* each transition occurs
  - *Then* I receive exactly one notification per transition (WhatsApp, or push fallback)


### EP-06 - Operator: Trading-Day Control

*Owner: Operator. One-tap Open/Close/Sold-Out and the daily session parameters (quantity, cut-off, delivery window, zones).*

#### US-023 - Operator opens the shop with one tap

> **As a** Operator, **I want to** open the shop for the day with a single tap, **so that** customers can start ordering the moment I am ready.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 2 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-01 | UC-O-01 | NFR-U-01, NFR-P-04 |

*INVEST: Atomic one-tap action; testable for propagation.*

**Acceptance criteria**

- **Scenario: One tap sets Open and customers see it**
  - *Given* I am on the operator dashboard
  - *When* I tap Open
  - *Then* the status becomes Open and customers see it within 2 seconds

#### US-024 - Operator closes the shop with one tap

> **As a** Operator, **I want to** close the shop with a single tap, **so that** I can stop taking orders instantly when I need to.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 2 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-02 | UC-O-01 | NFR-U-01 |

*INVEST: Atomic one-tap action; testable by blocked ordering.*

**Acceptance criteria**

- **Scenario: One tap closes ordering**
  - *Given* the shop is Open
  - *When* I tap Close
  - *Then* new orders are blocked and customers see Closed within 2 seconds

#### US-025 - Operator sets Sold-Out with one tap

> **As a** Operator, **I want to** manually set Sold-Out with a single tap, **so that** I can stop orders early when I know stock is gone.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 2 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-03 | UC-O-01 | NFR-U-01 |

*INVEST: Atomic action that also triggers the sold-out broadcast.*

**Acceptance criteria**

- **Scenario: One tap sets Sold-Out and broadcasts**
  - *Given* the shop is Open
  - *When* I tap Sold-Out
  - *Then* status becomes Sold-Out
  - *And* the sold-out announcement is broadcast to customers

#### US-026 - Operator sets the daily total quantity

> **As a** Operator, **I want to** set how many portions are available today, **so that** the live counter and auto sold-out work from a real number.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 2 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-04 | UC-O-02 | - |

*INVEST: Small config slice; testable by remaining initialization.*

**Acceptance criteria**

- **Scenario: Remaining initializes to the set total**
  - *Given* I am configuring today's session
  - *When* I set the daily total quantity
  - *Then* remaining quantity initializes to that total for the session

#### US-027 - Operator sets the order cut-off time

> **As a** Operator, **I want to** set the time after which new orders stop, **so that** I have enough time to cook and dispatch before closing.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 2 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-05 | UC-O-02 | - |

*INVEST: Small config slice; drives automation US-048.*

**Acceptance criteria**

- **Scenario: Ordering auto-closes at cut-off**
  - *Given* I set a cut-off time
  - *When* that time arrives
  - *Then* ordering auto-closes at the cut-off

#### US-028 - Operator sets the delivery window

> **As a** Operator, **I want to** set the delivery window for the day, **so that** customers and the rider know when deliveries happen.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 2 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-06 | UC-O-02 | - |

*INVEST: Small config slice; testable by display to customer/rider.*

**Acceptance criteria**

- **Scenario: Window stored and shown**
  - *Given* I set a delivery window
  - *When* customers and the rider view the day
  - *Then* the same window is shown to both

#### US-029 - Operator manages active delivery zones

> **As a** Operator, **I want to** turn delivery zones on or off for the day, **so that** I only accept deliveries to areas I can actually serve.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 3 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-07 | UC-O-02 | - |

*INVEST: Independent zones slice; testable by customer selectability.*

**Acceptance criteria**

- **Scenario: Only active zones are selectable**
  - *Given* I deactivate a zone
  - *When* a customer starts a delivery order
  - *Then* that zone is not selectable
  - *And* active zones are

#### US-030 - Single active daily session per day

> **As a** System, **I want to** maintain exactly one active daily session per calendar day, **so that** status, quantity and orders always attach to one unambiguous day.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-06 | Must | 3 | Yes | S0 - Foundation & Walking Skeleton | FR-S-06 | UC-O-02 | - |

*INVEST: Foundational invariant; testable by attempting a second session.*

**Acceptance criteria**

- **Scenario: Second active session refused**
  - *Given* an active session exists for today
  - *When* a second active session is attempted for the same day
  - *Then* it is refused and the existing session remains the single source


### EP-07 - Operator: Menu Management

*Owner: Operator. Self-service control of menu items, prices, availability and photos.*

#### US-031 - Operator manages menu items, prices and photos

> **As a** Operator, **I want to** add, edit, hide and price menu items and upload photos, **so that** the customer menu always reflects what I am actually selling.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-07 | Must | 5 | Yes | S1 - Live Status, Menu & Operator Configuration | FR-O-08 | UC-O-03 | - |

*INVEST: Independent CRUD slice; testable by menu propagation.*

**Acceptance criteria**

- **Scenario: Changes appear on the customer menu**
  - *Given* I edit a price or upload a photo
  - *When* I save
  - *Then* the change appears on the customer menu within 5 seconds
- **Scenario: Hidden item becomes unavailable**
  - *Given* I mark an item unavailable
  - *When* customers view the menu
  - *Then* the item is clearly marked unavailable and cannot be added


### EP-08 - Operator: Order Board & Fulfilment

*Owner: Operator. A live, columned order board to advance, dispatch, verify, cancel and summarise the day's orders.*

#### US-032 - Operator views a live order board by status

> **As a** Operator, **I want to** see incoming and in-progress orders in columns by status, **so that** I can run the whole day from one screen.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-08 | Must | 5 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-O-09, FR-S-08 | UC-O-04 | NFR-P-01 |

*INVEST: Independent board view; testable for live insertion.*

**Acceptance criteria**

- **Scenario: New orders appear within 2 s**
  - *Given* the order board is open
  - *When* a customer places an order
  - *Then* it appears in the New column within 2 seconds without refresh

#### US-033 - Operator advances an order through its lifecycle

> **As a** Operator, **I want to** move an order through New, Confirmed, Preparing, Ready, Out-for-Delivery, Delivered, **so that** everyone sees accurate progress and the right notifications fire.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-08 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-O-10, FR-S-09 | UC-O-04 | - |

*INVEST: Independent state-transition slice; testable per valid transition.*

**Acceptance criteria**

- **Scenario: Valid transition updates and notifies**
  - *Given* an order in a given state
  - *When* I advance it to the next valid state
  - *Then* the status updates and exactly one matching notification fires
- **Scenario: Invalid transition rejected**
  - *Given* an order in a given state
  - *When* an invalid transition is attempted
  - *Then* it is rejected and the state is unchanged

#### US-034 - Operator dispatches an order to the rider

> **As a** Operator, **I want to** assign a ready delivery order to the rider, **so that** it shows up in the rider's list for pickup.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-08 | Should | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-O-11 | UC-O-04 | - |

*INVEST: Independent dispatch slice; testable by rider-list appearance.*

**Acceptance criteria**

- **Scenario: Dispatched order reaches the rider**
  - *Given* a Ready delivery order
  - *When* I dispatch it to the rider
  - *Then* it appears in the rider's deliveries grouped under its zone

#### US-035 - Operator verifies a DuitNow payment proof

> **As a** Operator, **I want to** view an uploaded DuitNow proof and mark it verified or rejected, **so that** I can trust that QR-paid orders are actually paid.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-08 | Should | 3 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-O-14 | UC-O-06 | - |

*INVEST: Independent verification slice; testable per verdict.*

**Acceptance criteria**

- **Scenario: Proof can be verified or rejected**
  - *Given* a QR order with an uploaded proof
  - *When* I review the proof
  - *Then* I can mark payment verified or rejected
  - *And* a rejection notifies the customer

#### US-036 - Operator cancels or refuses an order with a reason

> **As a** Operator, **I want to** cancel or refuse an order and state a reason, **so that** the customer understands why and stock is corrected.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-08 | Should | 2 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-O-15 | UC-O-07 | - |

*INVEST: Independent cancel slice; testable by notify + restock.*

**Acceptance criteria**

- **Scenario: Cancellation notifies with reason**
  - *Given* an active order
  - *When* I cancel it with a reason
  - *Then* the customer is notified with that reason
  - *And* any reserved quantity is returned to stock

#### US-037 - Operator reviews the end-of-day summary

> **As a** Operator, **I want to** see total orders, items sold and revenue for the session, **so that** I can close out the day and learn from it.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-08 | Should | 3 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-O-13 | UC-O-08 | - |

*INVEST: Independent reporting slice; testable against the session's orders.*

**Acceptance criteria**

- **Scenario: Summary reconciles to the day**
  - *Given* a completed trading day
  - *When* I open the end-of-day summary
  - *Then* it shows total orders, items sold and MYR revenue matching the session's orders


### EP-09 - Operator: Broadcast & Announcements

*Owner: Operator. Bilingual one-tap announcements to all opted-in customers.*

#### US-038 - Operator broadcasts a bilingual announcement

> **As a** Operator, **I want to** send a bilingual announcement to all opted-in customers with one action, **so that** I never type the same WhatsApp message over and over.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-09 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-O-12, FR-S-10 | UC-O-05 | NFR-L-01 |

*INVEST: Independent broadcast slice; testable for fan-out + language.*

**Acceptance criteria**

- **Scenario: One action reaches all opted-in customers**
  - *Given* customers opted in to notifications
  - *When* I send a broadcast
  - *Then* each opted-in customer receives it once in their preferred language


### EP-10 - Rider Delivery

*Owner: Rider. A zone-grouped delivery list with navigation, customer contact and one-tap status updates.*

#### US-039 - Rider views today's deliveries grouped by zone

> **As a** Rider, **I want to** see only today's ready / out-for-delivery orders grouped by zone, **so that** I can run an efficient route area by area.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-10 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-R-02 | UC-R-01 | - |

*INVEST: Independent rider-list slice; testable by grouping + filtering.*

**Acceptance criteria**

- **Scenario: Only today's relevant orders, grouped**
  - *Given* a mix of orders across days and states
  - *When* I open my deliveries
  - *Then* only today's ready/out-for-delivery orders appear, grouped by zone

#### US-040 - Rider views delivery detail

> **As a** Rider, **I want to** see the address, map link, customer phone, items and payment for a delivery, **so that** I have everything I need at the door.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-10 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-R-03 | UC-R-02 | - |

*INVEST: Independent detail view; testable by field presence.*

**Acceptance criteria**

- **Scenario: Detail shows all fields**
  - *Given* a delivery in my list
  - *When* I open it
  - *Then* I see address, map link, customer phone, items and payment method/status

#### US-041 - Rider opens a map deep-link for navigation

> **As a** Rider, **I want to** tap to open the saved pin/address in my phone's map app, **so that** I can navigate without retyping the address.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-10 | Must | 2 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-R-04 | UC-R-02 | - |

*INVEST: Small deep-link slice; testable by URL open.*

**Acceptance criteria**

- **Scenario: Deep-link opens device map**
  - *Given* a delivery with a saved pin/address
  - *When* I tap the map link
  - *Then* the device map opens at that location

#### US-042 - Rider marks a delivery Picked up

> **As a** Rider, **I want to** mark an order as picked up with one tap, **so that** the customer knows it is on the way.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-10 | Must | 2 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-R-05, FR-S-09 | UC-R-03 | - |

*INVEST: Atomic status update; testable by notification fire.*

**Acceptance criteria**

- **Scenario: Picked up notifies the customer**
  - *Given* an assigned delivery
  - *When* I mark it Picked up
  - *Then* the order moves to Out-for-Delivery and the customer is notified

#### US-043 - Rider marks a delivery Delivered

> **As a** Rider, **I want to** mark an order as delivered with one tap, **so that** the order is completed and the customer gets a final confirmation.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-10 | Must | 2 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-R-06, FR-S-09 | UC-R-03 | - |

*INVEST: Atomic completion; testable by terminal state + notify.*

**Acceptance criteria**

- **Scenario: Delivered completes and notifies**
  - *Given* an out-for-delivery order
  - *When* I mark it Delivered
  - *Then* the order is completed and the delivered notification fires

#### US-044 - Rider receives newly ready deliveries in real time

> **As a** Rider, **I want to** see newly ready deliveries appear without refreshing, **so that** I can pick up promptly during the delivery window.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-10 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-R-07, FR-S-08 | UC-R-01 | NFR-P-01 |

*INVEST: Independent realtime slice for the rider; testable for <2 s.*

**Acceptance criteria**

- **Scenario: New ready orders appear within 2 s**
  - *Given* my deliveries screen is open
  - *When* the operator marks an order Ready in my zone
  - *Then* it appears in my list within 2 seconds


### EP-11 - Automation & Inventory Integrity

*Owner: System. Race-safe inventory, auto sold-out, and auto-close at cut-off and 19:00 - the operator never types a manual broadcast.*

#### US-045 - System decrements remaining quantity as orders are accepted

> **As a** System, **I want to** reduce remaining quantity by each accepted order's item count, **so that** the live counter and sold-out logic stay accurate.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-11 | Must | 3 | Yes | S2 - Ordering & Inventory Integrity | FR-S-01 | UC-S-01 | - |

*INVEST: Independent decrement slice; testable per accepted order.*

**Acceptance criteria**

- **Scenario: Accepted order reduces remaining**
  - *Given* remaining quantity is N
  - *When* an order for k portions is accepted
  - *Then* remaining becomes N minus k

#### US-046 - System enforces remaining >= 0 (race-safe, no overselling)

> **As a** System, **I want to** guarantee that concurrent orders can never drive remaining below zero, **so that** I never sell stock I do not have.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-11 | Must | 8 | Yes | S2 - Ordering & Inventory Integrity | FR-S-02 | UC-S-01 | NFR-R-02 |

*INVEST: The hardest correctness story; testable under concurrency.*

**Acceptance criteria**

- **Scenario: Concurrent orders cannot oversell**
  - *Given* remaining quantity is 1
  - *When* two orders for the last portion arrive at the same instant
  - *Then* exactly one succeeds and the other is rejected
  - *And* remaining never goes below zero
- **Scenario: Atomic guard, no global lock**
  - *Given* high concurrency at open
  - *When* many orders compete for stock
  - *Then* an atomic conditional update enforces correctness without a global lock

#### US-047 - System auto-flips to Sold-Out at remaining = 0

> **As a** System, **I want to** set the shop to Sold-Out the instant remaining hits zero, **so that** customers stop ordering automatically and the operator says nothing.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-11 | Must | 3 | Yes | S2 - Ordering & Inventory Integrity | FR-S-03 | UC-S-01 | NFR-P-01 |

*INVEST: Independent automation slice; testable at the zero boundary.*

**Acceptance criteria**

- **Scenario: Sold-Out within 2 s of zero**
  - *Given* remaining quantity reaches zero
  - *When* the last portion is taken
  - *Then* status becomes Sold-Out within 2 seconds
  - *And* the sold-out broadcast fires once

#### US-048 - System auto-closes ordering at the cut-off time

> **As a** System, **I want to** stop accepting orders automatically at the operator's cut-off, **so that** the operator has guaranteed prep time without watching the clock.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-11 | Must | 3 | Yes | S2 - Ordering & Inventory Integrity | FR-S-04 | UC-S-02 | - |

*INVEST: Independent timer slice; testable at the boundary time.*

**Acceptance criteria**

- **Scenario: No orders accepted after cut-off**
  - *Given* the cut-off time
  - *When* the time passes
  - *Then* no new orders are accepted even if stock remains

#### US-049 - System auto-closes at end of trading hours (19:00 MYT)

> **As a** System, **I want to** close ordering at 19:00 MYT regardless of remaining stock, **so that** trading always ends on time.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-11 | Must | 2 | Yes | S2 - Ordering & Inventory Integrity | FR-S-05 | UC-S-02 | - |

*INVEST: Independent timer slice; testable at 19:00 boundary.*

**Acceptance criteria**

- **Scenario: Closes at 19:00 even with stock**
  - *Given* stock remains at 19:00 MYT
  - *When* the clock reaches 19:00
  - *Then* ordering closes


### EP-12 - Notifications & Messaging Infrastructure

*Owner: System. Exactly-once event-to-message dispatch, bilingual templates, web-push fallback and delivery-receipt handling.*

#### US-050 - System sends exactly one notification per order state change

> **As a** System, **I want to** emit one and only one notification for each order transition, **so that** customers are kept informed without duplicate or missed messages.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-12 | Must | 5 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-S-09 | UC-S-03 | NFR-R-03 |

*INVEST: Event-to-message core; testable for exactly-once semantics.*

**Acceptance criteria**

- **Scenario: Exactly once per transition**
  - *Given* an order changes state
  - *When* the domain event fires
  - *Then* exactly one notification is dispatched, with no duplicates on retry

#### US-051 - System renders bilingual templated messages with variables

> **As a** System, **I want to** render WhatsApp/push templates in the recipient's language with variables, **so that** every message reads naturally in Arabic or English with the right order details.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-12 | Must | 3 | Yes | S3 - Fulfilment, Tracking & Notifications | FR-S-10 | UC-S-03 | NFR-L-01 |

*INVEST: Independent templating slice; testable per language + variable fill.*

**Acceptance criteria**

- **Scenario: Language matches recipient preference**
  - *Given* a recipient with a language preference
  - *When* a templated message is rendered
  - *Then* it uses that language and fills order number, status and ETA correctly

#### US-052 - System falls back to web push when WhatsApp fails

> **As a** System, **I want to** retry a failed WhatsApp send and then fall back to web push, **so that** a delivery failure on one channel does not leave the customer uninformed.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-12 | Should | 5 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-S-11 | UC-S-03 | NFR-R-03 |

*INVEST: Independent resilience slice; testable by forcing a WA failure.*

**Acceptance criteria**

- **Scenario: Retry then fall back to push**
  - *Given* a WhatsApp send fails
  - *When* retries with backoff are exhausted
  - *Then* the message is delivered via web push instead

#### US-053 - System processes WhatsApp delivery receipts and retries failures

> **As a** System, **I want to** record WhatsApp delivery receipts and retry transient failures with backoff, **so that** message delivery is observable and self-healing.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-12 | Should | 3 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-S-15 | UC-S-03 | NFR-R-03 |

*INVEST: Independent webhook slice; testable by simulated receipts.*

**Acceptance criteria**

- **Scenario: Receipts recorded, transient failures retried**
  - *Given* WhatsApp returns delivery receipts via webhook
  - *When* a transient failure is reported
  - *Then* the status is recorded and the send is retried with backoff


### EP-13 - Cross-cutting Quality & Non-Functional Enablers

*Owner: System / All. PWA installability, performance, accessibility, bilingual parity, PDPA and resilience baked in as buildable stories.*

#### US-054 - PWA installability & offline shell

> **As a** Customer, **I want to** install the app to my home screen and have it open instantly, **so that** it feels like an app without an app-store download.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-13 | Must | 5 | Yes | S0 - Foundation & Walking Skeleton | (NFR / enabler) | - | NFR-M-02 |

*INVEST: Independent PWA enabler; testable via install + offline shell.*

**Acceptance criteria**

- **Scenario: Installable with offline shell**
  - *Given* a supported mobile browser
  - *When* I add the app to my home screen and reopen offline
  - *Then* the app shell loads and shows a clear offline state for live data

#### US-055 - Performance budget on mid-range Android over 4G

> **As a** Customer, **I want to** the app to load and respond fast on a typical phone and network, **so that** ordering never feels slow at the moment of decision.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-13 | Must | 5 | Yes | S4 - Hardening, Should-haves & Non-Functionals | (NFR / enabler) | - | NFR-P-01, NFR-P-02, NFR-P-03 |

*INVEST: Cross-cutting budget; testable against explicit metrics.*

**Acceptance criteria**

- **Scenario: Meets the NFR latency budget**
  - *Given* a mid-range Android on 4G
  - *When* I load the menu and place an order
  - *Then* menu is interactive < 3 s, order round-trip < 1.5 s median, and realtime updates < 2 s at p95

#### US-056 - WCAG 2.1 AA accessibility

> **As a** Customer, **I want to** use the app with sufficient contrast, large tap targets and clear focus, **so that** the app is usable for everyone, including with assistive tech.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-13 | Must | 5 | Yes | S4 - Hardening, Should-haves & Non-Functionals | (NFR / enabler) | - | NFR-U-02 |

*INVEST: Cross-cutting a11y; testable via audit + manual checks.*

**Acceptance criteria**

- **Scenario: Passes AA checks**
  - *Given* any primary screen
  - *When* audited for accessibility
  - *Then* contrast meets AA, tap targets are >= 44x44 px, and focus order is logical in both LTR and RTL

#### US-057 - PDPA data minimization, retention & erasure

> **As a** Customer, **I want to** the app to store only what it needs and let me request deletion, **so that** my personal data is protected under Malaysia's PDPA.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-13 | Should | 3 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-S-13 | - | NFR-C-02, NFR-C-03, NFR-C-04 |

*INVEST: Compliance enabler; testable by data audit + erasure flow.*

**Acceptance criteria**

- **Scenario: Minimized data and honoured erasure**
  - *Given* my account holds only phone, name and address
  - *When* I submit a verified deletion request
  - *Then* my personal data is erased per the retention policy and the access is auditable

#### US-058 - Graceful real-time degradation

> **As a** Customer, **I want to** still get reasonably fresh data if the realtime channel drops, **so that** a flaky connection never leaves me staring at stale status.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-13 | Should | 3 | Yes | S4 - Hardening, Should-haves & Non-Functionals | (NFR / enabler) | - | NFR-R-04 |

*INVEST: Resilience enabler; testable by killing the socket.*

**Acceptance criteria**

- **Scenario: Falls back to periodic refresh**
  - *Given* the realtime channel disconnects
  - *When* I keep the screen open
  - *Then* the app falls back to periodic refresh and signals reconnection state

#### US-059 - Daily backup & tested restore

> **As a** System, **I want to** back up the database daily and verify a restore, **so that** a failure never loses the day's orders or customer data.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-13 | Should | 2 | Yes | S4 - Hardening, Should-haves & Non-Functionals | (NFR / enabler) | - | NFR-R-05 |

*INVEST: Ops enabler; testable by a restore drill.*

**Acceptance criteria**

- **Scenario: Backup runs and restore verified**
  - *Given* scheduled daily backups
  - *When* a restore drill is performed
  - *Then* the database restores successfully to the backup point

#### US-060 - Bilingual parity for UI and notifications

> **As a** Customer, **I want to** every screen and every message available equally in Arabic and English, **so that** neither language is a second-class experience.

| Epic | Priority | Points | MVP | Sprint | FR | UC | NFR |
|---|---|---|---|---|---|---|---|
| EP-13 | Must | 3 | Yes | S4 - Hardening, Should-haves & Non-Functionals | FR-C-14, FR-S-10 | UC-C-08 | NFR-L-01 |

*INVEST: Cross-cutting parity check; testable via coverage audit.*

**Acceptance criteria**

- **Scenario: 100% AR/EN coverage**
  - *Given* the full set of UI strings and notification templates
  - *When* audited for coverage
  - *Then* both Arabic (RTL) and English are 100% present with correct locale formats (MYT, MYR)


## 8. Release Plan & Sprint Sequencing

Sprints are dependency-ordered: each assumes the previous is shippable. Sprint 0 builds the walking skeleton (auth, data, security, PWA shell); value becomes externally visible from Sprint 1.

| Sprint | Name | Window | Stories | Points | Cumulative |
|---|---|---|---:|---:|---:|
| S0 | Foundation & Walking Skeleton | Week 1 | 9 | 33 | 33 |
| S1 | Live Status, Menu & Operator Configuration | Week 2 | 13 | 39 | 72 |
| S2 | Ordering & Inventory Integrity | Week 3 | 10 | 37 | 109 |
| S3 | Fulfilment, Tracking & Notifications | Week 4 | 15 | 46 | 155 |
| S4 | Hardening, Should-haves & Non-Functionals | Week 5 | 13 | 42 | 197 |
| | **Total** | | **60** | **197** | |

### S0 - Foundation & Walking Skeleton (Week 1)

*Goal: A deployable skeleton: repo + CI, Supabase schema, phone-OTP auth, RBAC + row-level security, the single-session invariant, PWA shell and consent. Nothing user-facing ships value yet, but every later story has solid ground.*

**Stories (9, 33 pts):** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-030, US-054

### S1 - Live Status, Menu & Operator Configuration (Week 2)

*Goal: The operator can configure the day with one-tap controls and parameters; customers can see live status, the live counter and the bilingual menu. First externally visible value.*

**Stories (13, 39 pts):** US-008, US-009, US-010, US-011, US-012, US-023, US-024, US-025, US-026, US-027, US-028, US-029, US-031

### S2 - Ordering & Inventory Integrity (Week 3)

*Goal: End-to-end ordering (cart, fulfilment type, address/zone, payment) with the race-safe inventory guard, auto sold-out and auto-close at cut-off and 19:00.*

**Stories (10, 37 pts):** US-013, US-014, US-015, US-016, US-017, US-045, US-046, US-047, US-048, US-049

### S3 - Fulfilment, Tracking & Notifications (Week 4)

*Goal: The live order board, real-time customer tracking, exactly-once WhatsApp notifications, broadcasts and the full rider delivery flow.*

**Stories (15, 46 pts):** US-018, US-021, US-022, US-032, US-033, US-034, US-038, US-039, US-040, US-041, US-042, US-043, US-044, US-050, US-051

### S4 - Hardening, Should-haves & Non-Functionals (Week 5)

*Goal: Web-push fallback, delivery receipts, order history, end-of-day summary, plus performance, accessibility, PDPA, degradation, backup and bilingual-parity sign-off. Release-ready.*

**Stories (13, 42 pts):** US-019, US-020, US-035, US-036, US-037, US-052, US-053, US-055, US-056, US-057, US-058, US-059, US-060

## 9. Traceability - Requirements Coverage

**9.1 FR -> Story coverage matrix.** Every one of the 52 SRS functional requirements maps to at least one story; this is the evidence for the Definition of Done ("every MVP FR has >=1 story").

| FR | Domain | Covering stories |
|---|---|---|
| FR-C-01 | Customer | US-001 |
| FR-C-02 | Customer | US-008 |
| FR-C-03 | Customer | US-009 |
| FR-C-04 | Customer | US-011 |
| FR-C-05 | Customer | US-013 |
| FR-C-06 | Customer | US-014 |
| FR-C-07 | Customer | US-015 |
| FR-C-08 | Customer | US-016 |
| FR-C-09 | Customer | US-017 |
| FR-C-10 | Customer | US-018 |
| FR-C-11 | Customer | US-021 |
| FR-C-12 | Customer | US-020 |
| FR-C-13 | Customer | US-022 |
| FR-C-14 | Customer | US-012, US-060 |
| FR-C-15 | Customer | US-019 |
| FR-O-01 | Operator/Admin | US-023 |
| FR-O-02 | Operator/Admin | US-024 |
| FR-O-03 | Operator/Admin | US-025 |
| FR-O-04 | Operator/Admin | US-026 |
| FR-O-05 | Operator/Admin | US-027 |
| FR-O-06 | Operator/Admin | US-028 |
| FR-O-07 | Operator/Admin | US-029 |
| FR-O-08 | Operator/Admin | US-031 |
| FR-O-09 | Operator/Admin | US-032 |
| FR-O-10 | Operator/Admin | US-033 |
| FR-O-11 | Operator/Admin | US-034 |
| FR-O-12 | Operator/Admin | US-038 |
| FR-O-13 | Operator/Admin | US-037 |
| FR-O-14 | Operator/Admin | US-035 |
| FR-O-15 | Operator/Admin | US-036 |
| FR-R-01 | Rider | US-002 |
| FR-R-02 | Rider | US-039 |
| FR-R-03 | Rider | US-040 |
| FR-R-04 | Rider | US-041 |
| FR-R-05 | Rider | US-042 |
| FR-R-06 | Rider | US-043 |
| FR-R-07 | Rider | US-044 |
| FR-S-01 | System/Automation | US-045 |
| FR-S-02 | System/Automation | US-046 |
| FR-S-03 | System/Automation | US-047 |
| FR-S-04 | System/Automation | US-048 |
| FR-S-05 | System/Automation | US-049 |
| FR-S-06 | System/Automation | US-030 |
| FR-S-07 | System/Automation | US-010 |
| FR-S-08 | System/Automation | US-032, US-044 |
| FR-S-09 | System/Automation | US-033, US-042, US-043, US-050 |
| FR-S-10 | System/Automation | US-038, US-051, US-060 |
| FR-S-11 | System/Automation | US-052 |
| FR-S-12 | System/Automation | US-003, US-004 |
| FR-S-13 | System/Automation | US-005, US-057 |
| FR-S-14 | System/Automation | US-006 |
| FR-S-15 | System/Automation | US-053 |

> **Coverage: 52/52 functional requirements (100%).** No requirement is left without a buildable, testable story.

**9.2 Story -> FR / UC index.**

| Story | Title | FR | UC | Priority | Pts |
|---|---|---|---|---|---:|
| US-001 | Customer phone-OTP sign-up & sign-in | FR-C-01 | UC-C-01 | Must | 5 |
| US-002 | Rider phone-OTP sign-in with rider role | FR-R-01 | UC-R-01, UC-C-01 | Must | 2 |
| US-003 | Operator secure sign-in & role resolution | FR-S-12 | UC-O-01 | Must | 3 |
| US-004 | Role-based access control on every endpoint | FR-S-12 | - | Must | 5 |
| US-005 | Row-level data isolation | FR-S-13 | UC-R-01 | Must | 5 |
| US-006 | OTP rate-limiting & abuse protection | FR-S-14 | UC-C-01 | Must | 3 |
| US-007 | Explicit consent opt-in at signup (PDPA) | (NFR / enabler) | UC-C-01 | Must | 2 |
| US-008 | Customer views live shop status | FR-C-02 | UC-C-02 | Must | 3 |
| US-009 | Customer sees live remaining-quantity counter | FR-C-03 | UC-C-02 | Must | 3 |
| US-010 | Real-time broadcast of status & quantity to all clients | FR-S-07 | UC-C-02 | Must | 5 |
| US-011 | Customer browses the bilingual menu with prices | FR-C-04 | UC-C-02 | Must | 3 |
| US-012 | Customer switches language Arabic (RTL) / English | FR-C-14 | UC-C-08 | Must | 5 |
| US-013 | Customer adds items and quantities to a cart | FR-C-05 | UC-C-03 | Must | 3 |
| US-014 | Customer chooses Delivery or Walk-in / Pickup | FR-C-06 | UC-C-03, UC-C-04 | Must | 2 |
| US-015 | Customer provides zone and address for delivery | FR-C-07 | UC-C-03 | Must | 5 |
| US-016 | Ordering allowed only while Open and before cut-off | FR-C-08 | UC-C-03 | Must | 3 |
| US-017 | Customer pays via COD or DuitNow QR with proof upload | FR-C-09 | UC-C-03 | Must | 5 |
| US-018 | Customer receives confirmation and tracking timeline | FR-C-10 | UC-C-05 | Must | 3 |
| US-019 | Customer cancels an order before Preparing | FR-C-15 | UC-C-07 | Should | 3 |
| US-020 | Customer views order history | FR-C-12 | UC-C-06 | Should | 2 |
| US-021 | Customer order status updates in real time | FR-C-11 | UC-C-05 | Must | 3 |
| US-022 | Customer receives an automatic notification per state change | FR-C-13 | UC-S-03 | Must | 3 |
| US-023 | Operator opens the shop with one tap | FR-O-01 | UC-O-01 | Must | 2 |
| US-024 | Operator closes the shop with one tap | FR-O-02 | UC-O-01 | Must | 2 |
| US-025 | Operator sets Sold-Out with one tap | FR-O-03 | UC-O-01 | Must | 2 |
| US-026 | Operator sets the daily total quantity | FR-O-04 | UC-O-02 | Must | 2 |
| US-027 | Operator sets the order cut-off time | FR-O-05 | UC-O-02 | Must | 2 |
| US-028 | Operator sets the delivery window | FR-O-06 | UC-O-02 | Must | 2 |
| US-029 | Operator manages active delivery zones | FR-O-07 | UC-O-02 | Must | 3 |
| US-030 | Single active daily session per day | FR-S-06 | UC-O-02 | Must | 3 |
| US-031 | Operator manages menu items, prices and photos | FR-O-08 | UC-O-03 | Must | 5 |
| US-032 | Operator views a live order board by status | FR-O-09, FR-S-08 | UC-O-04 | Must | 5 |
| US-033 | Operator advances an order through its lifecycle | FR-O-10, FR-S-09 | UC-O-04 | Must | 3 |
| US-034 | Operator dispatches an order to the rider | FR-O-11 | UC-O-04 | Should | 3 |
| US-035 | Operator verifies a DuitNow payment proof | FR-O-14 | UC-O-06 | Should | 3 |
| US-036 | Operator cancels or refuses an order with a reason | FR-O-15 | UC-O-07 | Should | 2 |
| US-037 | Operator reviews the end-of-day summary | FR-O-13 | UC-O-08 | Should | 3 |
| US-038 | Operator broadcasts a bilingual announcement | FR-O-12, FR-S-10 | UC-O-05 | Must | 3 |
| US-039 | Rider views today's deliveries grouped by zone | FR-R-02 | UC-R-01 | Must | 3 |
| US-040 | Rider views delivery detail | FR-R-03 | UC-R-02 | Must | 3 |
| US-041 | Rider opens a map deep-link for navigation | FR-R-04 | UC-R-02 | Must | 2 |
| US-042 | Rider marks a delivery Picked up | FR-R-05, FR-S-09 | UC-R-03 | Must | 2 |
| US-043 | Rider marks a delivery Delivered | FR-R-06, FR-S-09 | UC-R-03 | Must | 2 |
| US-044 | Rider receives newly ready deliveries in real time | FR-R-07, FR-S-08 | UC-R-01 | Must | 3 |
| US-045 | System decrements remaining quantity as orders are accepted | FR-S-01 | UC-S-01 | Must | 3 |
| US-046 | System enforces remaining >= 0 (race-safe, no overselling) | FR-S-02 | UC-S-01 | Must | 8 |
| US-047 | System auto-flips to Sold-Out at remaining = 0 | FR-S-03 | UC-S-01 | Must | 3 |
| US-048 | System auto-closes ordering at the cut-off time | FR-S-04 | UC-S-02 | Must | 3 |
| US-049 | System auto-closes at end of trading hours (19:00 MYT) | FR-S-05 | UC-S-02 | Must | 2 |
| US-050 | System sends exactly one notification per order state change | FR-S-09 | UC-S-03 | Must | 5 |
| US-051 | System renders bilingual templated messages with variables | FR-S-10 | UC-S-03 | Must | 3 |
| US-052 | System falls back to web push when WhatsApp fails | FR-S-11 | UC-S-03 | Should | 5 |
| US-053 | System processes WhatsApp delivery receipts and retries failures | FR-S-15 | UC-S-03 | Should | 3 |
| US-054 | PWA installability & offline shell | (NFR / enabler) | - | Must | 5 |
| US-055 | Performance budget on mid-range Android over 4G | (NFR / enabler) | - | Must | 5 |
| US-056 | WCAG 2.1 AA accessibility | (NFR / enabler) | - | Must | 5 |
| US-057 | PDPA data minimization, retention & erasure | FR-S-13 | - | Should | 3 |
| US-058 | Graceful real-time degradation | (NFR / enabler) | - | Should | 3 |
| US-059 | Daily backup & tested restore | (NFR / enabler) | - | Should | 2 |
| US-060 | Bilingual parity for UI and notifications | FR-C-14, FR-S-10 | UC-C-08 | Must | 3 |

## 10. v2 Expansion Backlog

Captured so nothing is lost: items explicitly out of v1 scope, ready to prioritise once the MVP is live.

| ID | Theme | Story | Size | Why deferred |
|---|---|---|---|---|
| V2-01 | Payments | As a Customer, I want to pay in-app via a Malaysian gateway (Billplz / ToyyibPay / Stripe-FPX), so that I do not have to upload a manual QR proof. | L | Removes the manual proof-verification step (US-035) and reduces payment friction. |
| V2-02 | Logistics | As a Rider, I want to an optimized delivery sequence across zones, so that I cover more drops in less time. | L | v1 ships zone grouping + map deep-links only; routing needs a paid maps/routing API. |
| V2-03 | Logistics | As a Operator, I want to assign orders across several riders and balance load, so that the business can scale beyond one motorbike. | L | Data model already supports multiple riders (NFR-M-01); UI + assignment logic deferred. |
| V2-04 | Growth | As a Customer, I want to earn and redeem points on orders, so that I am rewarded for coming back. | M | Retention lever; not needed to prove the core workflow. |
| V2-05 | Growth | As a Customer, I want to apply a discount code at checkout, so that I benefit from promotions. | M | Marketing lever; pricing/discount engine deferred. |
| V2-06 | Platform | As a Operator, I want to onboard additional home sellers under one platform, so that the product becomes a marketplace, not a single shop. | XL | Strategic expansion; large multi-tenancy change. |
| V2-07 | Platform | As a Customer, I want to a native app with richer push and device integration, so that the experience is even smoother than the PWA. | L | PWA covers v1; native only if push/engagement demands it. |
| V2-08 | Growth | As a Customer, I want to rate an order and leave feedback, so that quality is visible and improves. | M | Trust signal; not core to ordering. |
| V2-09 | Ordering | As a Customer, I want to place an order in advance for a future session, so that I can reserve before stock runs out. | M | Demand smoothing; needs session pre-creation and reservation rules. |
| V2-10 | Insight | As a Operator, I want to trend dashboards beyond the single end-of-day summary, so that I can see demand patterns over time. | M | Builds on US-037; multi-day aggregation and charts. |
| V2-11 | Logistics | As a Customer, I want to see the rider approaching with a live ETA, so that I know exactly when to expect my food. | L | Requires rider geolocation streaming and routing. |
| V2-12 | Localization | As a Customer, I want to use the app in further languages (e.g. Malay, Mandarin), so that more of Johor's customers are served natively. | M | v1 commits to AR/EN parity; i18n framework makes adding languages cheap later. |

## Appendix A - Summary Statistics

- **Stories:** 60 (49 Must, 11 Should) across 13 epics.
- **Story points:** 197 total; planned across 5 iterations.
- **Acceptance scenarios:** 76 Given/When/Then scenarios.
- **Functional-requirement coverage:** 52/52 (100%).
- **v2 backlog:** 12 items captured.

---
*Fahman Orders - D-08 User-Story Backlog + Acceptance Criteria - v1.0 - 19 June 2026 - prepared by PrincipalArch. Diagrams and upstream IDs reference D-06 (SRS) and D-07 (Use-Case Catalogue).*
