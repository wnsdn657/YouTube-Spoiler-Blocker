// 키워드 가져오기
chrome.storage.sync.get("keywords", function (data) {
    if (data.keywords) {
        hideSpoilers(data.keywords);
    }
});

// 유튜브에서 특정 키워드가 포함된 콘텐츠 숨기기
function hideSpoilers(keywords) {
    const elements = document.querySelectorAll(`
        ytd-video-renderer, 
        ytd-grid-video-renderer, 
        ytd-rich-item-renderer, 
        ytd-reel-item-renderer,  /*  Shorts 개별 영상 */
        ytd-reel-shelf-renderer, /*  Shorts 홈화면 섹션 */
        ytd-reel-video-renderer, /*  Shorts 상세 페이지 */
        ytd-rich-section-renderer /* Shorts 추천 섹션 */
    `);

    // 키워드 전처리 (소문자로 변환 + 공백 제거)
    const processedKeywords = keywords.map(keyword => keyword.toLowerCase().replace(/\s+/g, ""));

    elements.forEach(el => {
        const text = el.innerText.toLowerCase().replace(/\s+/g, ""); // 소문자로 변환 + 공백 제거
        if (processedKeywords.some(keyword => text.includes(keyword))) {
            el.style.display = "none";
        }
    });
}

// 페이지가 업데이트될 때도 감지 (쇼츠 실시간 감지)
const observer = new MutationObserver(() => {
    chrome.storage.sync.get("keywords", function (data) {
        if (data.keywords) {
            hideSpoilers(data.keywords);
        }
    });
});

// 유튜브 페이지 내 변경 사항 감지
observer.observe(document.body, { childList: true, subtree: true });
