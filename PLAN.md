# Káº¿ hoáº¡ch thá»±c hiá»‡n (PLAN.md)

## Má»¥c tiÃªu hiá»‡n táº¡i
PhÃ¡t triá»ƒn tÃ­nh nÄƒng cháº·n trang web (máº¡ng xÃ£ há»™i) qua file \hosts\ vÃ  cáº£i thiá»‡n cÆ¡ cháº¿ láº¥y danh sÃ¡ch á»©ng dá»¥ng trÃªn mÃ¡y tÃ­nh Ä‘á»ƒ cháº·n.

## Danh sÃ¡ch Task (Giai Ä‘oáº¡n 2)

- [x] **Task 1: Cáº£i thiá»‡n danh sÃ¡ch chá»n á»¨ng dá»¥ng (App Picker)**
  - Chi tiáº¿t: NÃ¢ng cáº¥p hÃ m backend (Rust) Ä‘á»ƒ láº¥y danh sÃ¡ch á»©ng dá»¥ng rÃµ rÃ ng hÆ¡n (cÃ³ thá»ƒ káº¿t há»£p láº¥y danh sÃ¡ch pháº§n má»m Ä‘Ã£ cÃ i Ä‘áº·t qua Registry hoáº·c cáº£i thiá»‡n danh sÃ¡ch tiáº¿n trÃ¬nh). Cáº­p nháº­t UI Ä‘á»ƒ ngÆ°á»i dÃ¹ng dá»… chá»n.
  - Äiá»u kiá»‡n kiá»ƒm tra: NgÆ°á»i dÃ¹ng tháº¥y Ä‘Æ°á»£c danh sÃ¡ch cÃ¡c app cáº§n cháº·n trÃªn mÃ¡y vÃ  chá»n Ä‘Æ°á»£c.

- [x] **Task 2: XÃ¢y dá»±ng cÆ¡ cháº¿ cháº·n Website báº±ng Rust (Backend)**
  - Chi tiáº¿t: 
    - Viáº¿t hÃ m Rust Ä‘á»ƒ Ä‘á»c vÃ  sao lÆ°u file \hosts\.
    - Viáº¿t hÃ m thÃªm cÃ¡c tÃªn miá»n (domain) cáº§n cháº·n trá» vá» \127.0.0.1\.
    - Viáº¿t hÃ m khÃ´i phá»¥c file \hosts\ khi káº¿t thÃºc hoáº·c há»§y phiÃªn.
    - Cháº¡y lá»‡nh \ipconfig /flushdns\ Ä‘á»ƒ xÃ³a cache trÃ¬nh duyá»‡t.
  - Äiá»u kiá»‡n kiá»ƒm tra: CÃ³ thá»ƒ gá»i hÃ m tá»« Frontend, file \hosts\ thay Ä‘á»•i vÃ  truy cáº­p web bá»‹ cháº·n.

- [x] **Task 3: Cáº­p nháº­t Giao diá»‡n (Frontend) cho tÃ­nh nÄƒng cháº·n Web**
  - Chi tiáº¿t: ThÃªm UI trong mÃ n hÃ¬nh Create Session Ä‘á»ƒ ngÆ°á»i dÃ¹ng nháº­p/chá»n cÃ¡c trang web muá»‘n cháº·n (VD: facebook.com, youtube.com). Gá»­i danh sÃ¡ch nÃ y xuá»‘ng Backend khi báº¯t Ä‘áº§u.
  - Äiá»u kiá»‡n kiá»ƒm tra: Giao diá»‡n trá»±c quan, cho phÃ©p thÃªm/xÃ³a website khá»i danh sÃ¡ch cháº·n trÆ°á»›c khi cháº¡y.

- [ ] **Task 4: YÃªu cáº§u quyá»n Administrator (Elevate Privileges)**
  - Chi tiáº¿t: Cáº¥u hÃ¬nh Tauri hoáº·c thÃªm cÆ¡ cháº¿ kiá»ƒm tra quyá»n Admin khi báº¯t Ä‘áº§u á»©ng dá»¥ng, vÃ¬ sá»­a file \hosts\ báº¯t buá»™c pháº£i cÃ³ quyá»n nÃ y trÃªn Windows.
  - Äiá»u kiá»‡n kiá»ƒm tra: á»¨ng dá»¥ng bÃ¡o lá»—i náº¿u khÃ´ng cÃ³ quyá»n Admin, hoáº·c tá»± Ä‘á»™ng xin quyá»n (\equireAdministrator\ trong manifest).

## Danh sÃ¡ch Task (Giai Ä‘oáº¡n 3: NÃ¢ng cáº¥p Tráº£i nghiá»‡m & Widget)

- [ ] **Task 5: XÃ¢y dá»±ng Cá»­a sá»• Overlay Widget**
  - Chi tiáº¿t: Cáº¥u hÃ¬nh Tauri Window (`alwaysOnTop`, `decorations: false`, `transparent: true`). Render UI Ä‘áº¿m ngÆ°á»£c Ä‘á»“ng bá»™ vá»›i app chÃ­nh.
  - Äiá»u kiá»‡n kiá»ƒm tra: Widget hiá»ƒn thá»‹ trong suá»‘t, luÃ´n ná»•i trÃªn cÃ¡c app khÃ¡c.

- [ ] **Task 6: PhÃ¡t triá»ƒn Há»‡ thá»‘ng Theme & Ã‚m thanh**
  - Chi tiáº¿t: XÃ¢y dá»±ng UI thay Ä‘á»•i Theme cho Widget. TÃ­ch há»£p Audio Player phÃ¡t nháº¡c ná»n thÆ° giÃ£n (mÆ°a, lofi) ngay trÃªn Widget.
  - Äiá»u kiá»‡n kiá»ƒm tra: Widget Ä‘á»•i giao diá»‡n realtime, phÃ¡t/táº¯t Ä‘Æ°á»£c nháº¡c ná»n.

- [ ] **Task 7: Há»‡ thá»‘ng Äiá»ƒm thÆ°á»Ÿng (Gamification)**
  - Chi tiáº¿t: LÆ°u trá»¯ local Ä‘iá»ƒm thÆ°á»Ÿng. Cá»™ng Ä‘iá»ƒm sau má»—i phiÃªn focus. XÃ¢y dá»±ng UI "Cá»­a hÃ ng" Ä‘á»ƒ dÃ¹ng Ä‘iá»ƒm má»Ÿ khÃ³a Theme.
  - Äiá»u kiá»‡n kiá»ƒm tra: TÃ­ch lÅ©y Ä‘Æ°á»£c Ä‘iá»ƒm, dÃ¹ng Ä‘iá»ƒm Ä‘á»•i Ä‘Æ°á»£c Theme má»›i.



