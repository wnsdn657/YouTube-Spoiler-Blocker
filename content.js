// 키워드를 캐싱하여 반복적인 스토리지 호출 방지
let cachedKeywords = [];

// 초기 키워드 불러오기
chrome.storage.sync.get("keywords", function (data) {
    if (data.keywords) {
        cachedKeywords = data.keywords.map(keyword => keyword.toLowerCase().replace(/\s+/g, ""));
        hideSpoilers();
    }
});

// 키워드 변경 감지 (실시간 업데이트)
chrome.storage.onChanged.addListener((changes) => {
    if (changes.keywords) {
        cachedKeywords = changes.keywords.newValue.map(keyword => keyword.toLowerCase().replace(/\s+/g, ""));
        hideSpoilers();
    }
});

// 유튜브에서 특정 키워드가 포함된 콘텐츠 숨기기
function hideSpoilers() {
    const elements = document.querySelectorAll(`
        ytd-video-renderer, 
        ytd-grid-video-renderer, 
        ytd-rich-item-renderer, 
        ytd-reel-item-renderer,  /* Shorts 개별 영상 */
        ytd-reel-shelf-renderer, /* Shorts 홈화면 섹션 */
        ytd-reel-video-renderer, /* Shorts 상세 페이지 */
        ytd-rich-section-renderer /* Shorts 추천 섹션 */
    `);

    elements.forEach(el => {
        const text = el.innerText.toLowerCase().replace(/\s+/g, ""); // 소문자로 변환 + 공백 제거
        if (cachedKeywords.some(keyword => text.includes(keyword))) {
            el.style.display = "none";
        }
    });
}

// MutationObserver 최적화 (불필요한 감지 제거)
const observer = new MutationObserver((mutations) => {
    let updated = false;
    mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.target.querySelector("ytd-video-renderer, ytd-grid-video-renderer")) {
            updated = true;
        }
    });

    if (updated) {
        requestAnimationFrame(hideSpoilers);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
});

// IntersectionObserver 추가: 화면에 나타난 요소만 감지
const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(hideSpoilers);
        }
    });
}, { threshold: 0.5, rootMargin: "100px" });

// MutationObserver 안에서 IntersectionObserver를 동적으로 업데이트
function updateIntersectionObserver() {
    document.querySelectorAll("ytd-video-renderer, ytd-grid-video-renderer, ytd-reel-item-renderer")
        .forEach(el => intersectionObserver.observe(el));
}

updateIntersectionObserver();

// requestAnimationFrame을 활용한 DOM 감시 최적화
function observeDOMChanges() {
    requestAnimationFrame(hideSpoilers);
}
