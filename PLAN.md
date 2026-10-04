# Káº¿ hoáº¡ch thá»±c hiá»‡n (PLAN.md)

## Má»¥c tiÃªu hiá»‡n táº¡i
PhÃ¡t triá»ƒn tÃ­nh nÄƒng cháº·n trang web (máº¡ng xÃ£ há»™i) qua file `hosts` vÃ  cáº£i thiá»‡n cÆ¡ cháº¿ láº¥y danh sÃ¡ch á»©ng dá»¥ng trÃªn mÃ¡y tÃ­nh Ä‘á»ƒ cháº·n.

## Danh sÃ¡ch Task (Giai Ä‘oáº¡n 2)

- [x] **Task 1: Cáº£i thiá»‡n danh sÃ¡ch chá»n á»¨ng dá»¥ng (App Picker)**
  - Chi tiáº¿t: NÃ¢ng cáº¥p hÃ m backend (Rust) Ä‘á»ƒ láº¥y danh sÃ¡ch á»©ng dá»¥ng rÃµ rÃ ng hÆ¡n (cÃ³ thá»ƒ káº¿t há»£p láº¥y danh sÃ¡ch pháº§n má»m Ä‘Ã£ cÃ i Ä‘áº·t qua Registry hoáº·c cáº£i thiá»‡n danh sÃ¡ch tiáº¿n trÃ¬nh). Cáº­p nháº­t UI Ä‘á»ƒ ngÆ°á»i dÃ¹ng dá»… chá»n.
  - Äiá»u kiá»‡n kiá»ƒm tra: NgÆ°á»i dÃ¹ng tháº¥y Ä‘Æ°á»£c danh sÃ¡ch cÃ¡c app cáº§n cháº·n trÃªn mÃ¡y vÃ  chá»n Ä‘Æ°á»£c.

- [x] **Task 2: XÃ¢y dá»±ng cÆ¡ cháº¿ cháº·n Website báº±ng Rust (Backend)**
  - Chi tiáº¿t: 
    - Viáº¿t hÃ m Rust Ä‘á»ƒ Ä‘á»c vÃ  sao lÆ°u file `hosts`.
    - Viáº¿t hÃ m thÃªm cÃ¡c tÃªn miá»n (domain) cáº§n cháº·n trá» vá» `127.0.0.1`.
    - Viáº¿t hÃ m khÃ´i phá»¥c file `hosts` khi káº¿t thÃºc hoáº·c há»§y phiÃªn.
    - Cháº¡y lá»‡nh `ipconfig /flushdns` Ä‘á»ƒ xÃ³a cache trÃ¬nh duyá»‡t.
  - Äiá»u kiá»‡n kiá»ƒm tra: CÃ³ thá»ƒ gá»i hÃ m tá»« Frontend, file `hosts` thay Ä‘á»•i vÃ  truy cáº­p web bá»‹ cháº·n.

- [x] **Task 3: Cáº­p nháº­t Giao diá»‡n (Frontend) cho tÃ­nh nÄƒng cháº·n Web**
  - Chi tiáº¿t: ThÃªm UI trong mÃ n hÃ¬nh Create Session Ä‘á»ƒ ngÆ°á»i dÃ¹ng nháº­p/chá»n cÃ¡c trang web muá»‘n cháº·n (VD: facebook.com, youtube.com). Gá»­i danh sÃ¡ch nÃ y xuá»‘ng Backend khi báº¯t Ä‘áº§u.
  - Äiá»u kiá»‡n kiá»ƒm tra: Giao diá»‡n trá»±c quan, cho phÃ©p thÃªm/xÃ³a website khá»i danh sÃ¡ch cháº·n trÆ°á»›c khi cháº¡y.

- [x] **Task 4: YÃªu cáº§u quyá»n Administrator (Elevate Privileges)**
  - Chi tiáº¿t: Cáº¥u hÃ¬nh Tauri hoáº·c thÃªm cÆ¡ cháº¿ kiá»ƒm tra quyá»n Admin khi báº¯t Ä‘áº§u á»©ng dá»¥ng, vÃ¬ sá»­a file `hosts` báº¯t buá»™c pháº£i cÃ³ quyá»n nÃ y trÃªn Windows.
  - Äiá»u kiá»‡n kiá»ƒm tra: á»¨ng dá»¥ng bÃ¡o lá»—i náº¿u khÃ´ng cÃ³ quyá»n Admin, hoáº·c tá»± Ä‘á»™ng xin quyá»n (`requireAdministrator` trong manifest).

## Danh sÃ¡ch Task (Giai Ä‘oáº¡n 3: NÃ¢ng cáº¥p Tráº£i nghiá»‡m & Widget)

- [ ] **Task 5: XÃ¢y dá»±ng Cá»­a sá»• Overlay Widget**
  - Chi tiáº¿t: Cáº¥u hÃ¬nh Tauri Window (`alwaysOnTop`, `decorations: false`, `transparent: true`). Render UI Ä‘áº¿m ngÆ°á»£c Ä‘á»“ng bá»™ vá»›i app chÃ­nh.
  - Äiá»u kiá»‡n kiá»ƒm tra: Widget hiá»ƒn thá»‹ trong suá»‘t, luÃ´n ná»•i trÃªn cÃ¡c app khÃ¡c.

**Website blocking reliability plan (Giai đoạn 1):**
1. Normalize selected website inputs to a bare hostname in the picker and defensively in the Rust hosts writer, removing schemes, `www.`, paths, queries, fragments, and trailing dots/ports as appropriate.
2. Write valid hosts entries for the normalized host and its `www` alias, deduplicating entries; keep the existing hosts-file architecture and do not add dependencies.
3. Validation completed: `cargo check`, `npm run build`, and `git diff --check` pass. Runtime acceptance still needs confirmation in the app by selecting or pasting `https://www.facebook.com/` and confirming fresh Facebook navigation is blocked during the session.
4. Follow `GIT_FLOW.md`: create a bugfix branch from `develop`, commit with a Conventional Commit message, and push the branch as explicitly requested.

**Start button failure repair plan (Giai đoạn 1):**
1. Correct the `start_blocking` invoke payload in `src/services/tauri.ts` to use the Tauri camelCase argument key `blockedUrls`, matching the Rust command parameter `blocked_urls`.
2. Add focused startup error feedback in the Create Session form so rejected start requests are visible to the user.
3. Keep session behavior and layout unchanged apart from displaying startup errors. Validation completed: `npm run build` and `git diff --check` pass.

**Task 5 UI text repair plan (Giai đoạn 1):**
1. Replace the mojibake Vietnamese string literals in `src/pages/CreateSession.tsx` with correctly encoded Vietnamese text matching the labels, presets, suggestions, and helper copy shown in the screenshot.
2. Correct the mock session goal in `src/services/tauri.ts` so web-mode summaries also display readable Vietnamese.
3. Keep behavior, layout, and session logic unchanged; save source files as UTF-8.
4. Validation completed: `npm run build`, `git diff --check`, and the source mojibake scan pass. Acceptance: the corrected source now contains readable Vietnamese throughout the Create Session screen.

**Task 5 implementation plan (Giai đoạn 1):**
1. Keep the existing single `main` window and its current mode-switching flow.
2. In overlay mode, set the compact size, always-on-top, non-resizable, `decorations: false`, and `transparent: true`; restore the normal window properties when returning to main mode.
3. Update the Overlay root styling so the WebView can show the transparent window surface while retaining a readable, subtly translucent widget panel.
4. Preserve the in-progress `useSession.start` signature change that forwards `blockedUrls`; avoid unrelated refactors and dependency changes.
5. Validation completed: `npm run build` and `cargo check` pass. Runtime visual confirmation is still needed for transparency, always-on-top behavior, and restoring the main window.

- [ ] **Task 6: PhÃ¡t triá»ƒn Há»‡ thá»‘ng Theme & Ã‚m thanh**
  - Chi tiáº¿t: XÃ¢y dá»±ng UI thay Ä‘á»•i Theme cho Widget. TÃ­ch há»£p Audio Player phÃ¡t nháº¡c ná»n thÆ° giÃ£n (mÆ°a, lofi) ngay trÃªn Widget.
  - Äiá»u kiá»‡n kiá»ƒm tra: Widget Ä‘á»•i giao diá»‡n realtime, phÃ¡t/táº¯t Ä‘Æ°á»£c nháº¡c ná»n.

- [ ] **Task 7: Há»‡ thá»‘ng Äiá»ƒm thÆ°á»Ÿng (Gamification)**
  - Chi tiáº¿t: LÆ°u trá»¯ local Ä‘iá»ƒm thÆ°á»Ÿng. Cá»™ng Ä‘iá»ƒm sau má»—i phiÃªn focus. XÃ¢y dá»±ng UI "Cá»­a hÃ ng" Ä‘á»ƒ dÃ¹ng Ä‘iá»ƒm má»Ÿ khÃ³a Theme.
  - Äiá»u kiá»‡n kiá»ƒm tra: TÃ­ch lÅ©y Ä‘Æ°á»£c Ä‘iá»ƒm, dÃ¹ng Ä‘iá»ƒm Ä‘á»•i Ä‘Æ°á»£c Theme má»›i.

