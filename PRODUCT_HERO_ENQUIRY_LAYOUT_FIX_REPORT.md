# RP STORAGE SOLUTION — PRODUCT PAGE HERO & ENQUIRY FORM LAYOUT FIX REPORT
## Coordinated Hero & Content Layout + Scroll-to-Top Navigation Fix

**Date:** October 15, 2026  
**Status:** Completed & Verified  
**Pages Updated:**
- Product Detail: `/products/:productSlug/`
- City-Product Detail: `/locations/:citySlug/:productSlug/`
- Global Navigation: `ScrollToTop` across all routes

---

## 1. EXECUTIVE SUMMARY

This update implements the critical layout changes requested by the client, aligning the Product Detail and City-Product Detail pages with the benchmark industrial layout:
1. **Coordinated Hero & Enquiry Form:** The Quick Enquiry form has been relocated from the lower content area to the **right side of the Product Title / Breadcrumb Hero section** on desktop.
2. **Distinctive Light-Blue Banner Background:** The hero section features the brand-matched light-blue background (`#AED2EC`), housing the dynamic breadcrumb, engineering badges, H1 heading, and quality trust pills on the left, with the white Quick Enquiry card anchored on the right.
3. **Structured Two-Column Content Row Below Hero:**
   - **LEFT:** Product visual gallery, aspect-ratio container, direct factory fabricated badges, and thumbnail selector.
   - **RIGHT:** Technical overview, engineered specifications table, facility applications, contextual internal links, and action buttons ("Request Technical Drawing", "Call Sales Desk").
4. **Zero Overlap & Guaranteed Responsiveness:** On desktop, a coordinated 12-column CSS Grid maintains a dedicated ~340–360px sidebar for the enquiry card. On mobile and tablet devices, the layout stacks naturally (Breadcrumbs/Title &rarr; Quick Enquiry Form &rarr; Product Gallery &rarr; Description & Specs), preventing clipping, awkward gaps, or horizontal overflow.
5. **Fixed Urgent Scroll-to-Top Bug:** Resolved the issue where clicking any city or product link opened the destination page scrolled down to the footer. Implemented `ScrollToTop.jsx` inside `BrowserRouter` with immediate window and Lenis scroll reset (`scrollTo(0, { immediate: true })`).

---

## 2. MODIFIED & CREATED FILES

| File Path | Type | Action | Description |
| :--- | :--- | :--- | :--- |
| `src/components/layout/ScrollToTop.jsx` | React Component | **Created** | Listens to route changes (`useLocation`) and resets window & Lenis smooth scroll to `(0, 0)`. |
| `src/components/ui/ProductEnquiryCard.jsx` | React Component | **Created** | Reusable Quick Enquiry card with field validation, spam honeypot, loading spinner, and lead capture. |
| `src/App.jsx` | React App | **Modified** | Mounted `<ScrollToTop />` inside `<BrowserRouter>`. |
| `src/pages/ProductPage.jsx` | React Page | **Modified** | Refactored hero to light-blue `#AED2EC` banner with right-side enquiry card and two-column layout below. |
| `src/pages/CityProductPage.jsx` | React Page | **Modified** | Refactored hero to light-blue `#AED2EC` banner with right-side enquiry card, local badges, and two-column layout below. |
| `.gitignore` | Config | **Modified** | Hardened to prevent accidental commits of `node_modules`, `.env`, and build artifacts across all subdirectories. |

---

## 3. KEY SPECIFICATIONS & IMPLEMENTATION DETAILS

### A. Main Product Page (`/products/:productSlug/`)
- **Breadcrumb:** `Home / Our Products / {product.name}`
- **H1:** `{product.name}`
- **Banner Area (`bg-[#AED2EC]`):**
  - Left: Category pill, IS 2062 & CRCA badges, H1, short description, and trust points (Heavy-Duty Load Tested, 7-Tank Anti-Rust Pretreatment, Direct Factory Supply).
  - Right: Quick Enquiry Form (`ProductEnquiryCard.jsx`) in an elegant white card.
- **Below Hero:**
  - Left: Main product image, thumbnails selector, quality badges (Prime CRCA, 7-Tank Treated, ISO 9001:2015).
  - Right: Structural overview, engineered load parameters table, facility applications, quote and call buttons.
  - Followed by Related Storage Systems grid and footer.

### B. City-Product Page (`/locations/:citySlug/:productSlug/`)
- **Breadcrumb:** `Home / {cityProduct.cityName} / {cityProduct.h1Heading || `${cityProduct.productName} in ${cityProduct.cityName}`}`
- **H1:** `{cityProduct.h1Heading || `${cityProduct.productName} in ${cityProduct.cityName}`}`
- **Banner Area (`bg-[#AED2EC]`):**
  - Left: Location corridor badge (`{cityProduct.cityName} Industrial Corridors`), Direct Factory Supply, H1, local introduction, and regional delivery badges.
  - Right: Quick Enquiry Form with pre-populated city context.
- **Below Hero:**
  - Left: Reused master product images with "Direct Factory Supply to {cityProduct.cityName}" badge and quality credentials.
  - Right: Localized engineering overview, key technical advantages, structural specifications table, contextual internal links, quote and call buttons.
  - Followed by Applications in City, Genuine Local Service Information, FAQs, and Other City Configurations.

### C. Quick Enquiry Form (`ProductEnquiryCard.jsx`)
- **Fields:**
  - Full Name *
  - Phone Number * (validated 8–15 digits)
  - Work Email
  - City / Requirement *
  - Hidden Context: `productId`, `cityId`, `productOfInterest`, `sourcePageUrl`
  - Anti-Spam Honeypot field (`fax_number_verification` hidden from real users)
- **Submit Action:** Sends payload to existing `submitEnquiry` API (`/api/public/enquiries`).
- **Feedback:** Displays loading spinner during request, followed by confirmation card with option to submit another enquiry.

### D. Scroll-to-Top Fix
- **Root Cause:** In single-page applications without explicit scroll restoration, navigation preserves the previous page's scroll offset. When clicking links near the bottom of a page (e.g. footer locations or product cards), the new route loaded at the bottom offset, directly viewing the footer. Furthermore, Lenis smooth scrolling retained its internal scroll target.
- **Resolution:** Added `ScrollToTop.jsx`, which resets both native window scroll (`window.scrollTo({ top: 0, left: 0, behavior: 'instant' })`, `document.documentElement.scrollTop = 0`) and Lenis scroll (`lenis.scrollTo(0, { immediate: true })`) on every route change.

---

## 4. VERIFICATION EVIDENCE

### Production Builds:
- **Public Site (`RP`):** `npm run build` completed with **0 errors**.
- **Admin Panel (`RP_admin`):** `npm run build` completed with **0 errors**.

### Automated Tests:
- All 94 integration tests across 5 test suites pass with 100% success rate:
  - `system.test.js`: 8 passed
  - `availability_mapping.test.js`: 18 passed
  - `seo_cms_workflow.test.js`: 20 passed
  - `seo_rendering_production.test.js`: 28 passed
  - `city_homepage_inheritance.test.js`: 16 passed
- **Total: 94 / 94 Passed**
