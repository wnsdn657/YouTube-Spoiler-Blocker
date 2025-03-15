document.addEventListener("DOMContentLoaded", function () {
    const keywordInput = document.getElementById("keyword");
    const addButton = document.getElementById("addKeyword");
    const keywordList = document.getElementById("keywordList");
    const clearButton = document.getElementById("clearAll");
    const darkModeButton = document.getElementById("toggleDarkMode");

    // 다크 모드 상태 불러오기
    chrome.storage.sync.get("darkMode", function (data) {
        if (data.darkMode) {
            document.body.classList.add("dark-mode");
            darkModeButton.textContent = "☀️ 밝은 모드";
        }
    });

    //  다크 모드 토글 버튼 클릭 이벤트
    darkModeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");

        //  다크 모드 상태 저장
        chrome.storage.sync.set({ darkMode: isDarkMode });

        // 버튼 텍스트 변경
        darkModeButton.textContent = isDarkMode ? "☀️ 밝은 모드" : "🌙 다크 모드";
    });

    // 저장된 키워드 불러오기
    chrome.storage.sync.get("keywords", function (data) {
        if (data.keywords) {
            data.keywords.forEach(displayKeyword);
        }
    });

    // 키워드 추가 함수
    function addKeyword() {
        const keyword = keywordInput.value.trim();
        if (keyword) {
            chrome.storage.sync.get("keywords", function (data) {
                let keywords = data.keywords || [];
                if (!keywords.includes(keyword)) {
                    keywords.push(keyword);
                    chrome.storage.sync.set({ keywords: keywords });
                    displayKeyword(keyword);
                }
            });
            keywordInput.value = "";
            keywordInput.focus();  // 입력창 자동 포커스 유지
        }
    }

    // 버튼 클릭으로 키워드 추가
    addButton.addEventListener("click", addKeyword);

    // 엔터키(Enter)로 키워드 추가
    keywordInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addKeyword();
        }
    });

    // 키워드 목록 표시
    function displayKeyword(keyword) {
        const li = document.createElement("li");
        li.textContent = keyword;
        const removeButton = document.createElement("button");
        removeButton.textContent = "❌";
        removeButton.classList.add("remove-btn");
        removeButton.addEventListener("click", function () {
            chrome.storage.sync.get("keywords", function (data) {
                let keywords = data.keywords || [];
                keywords = keywords.filter(k => k !== keyword);
                chrome.storage.sync.set({ keywords: keywords });
                li.remove();
            });
        });
        li.appendChild(removeButton);
        keywordList.appendChild(li);
    }

    // "초기화" 버튼으로 모든 키워드 삭제
    clearButton.addEventListener("click", function () {
        chrome.storage.sync.set({ keywords: [] });
        keywordList.innerHTML = "";
    });
});
