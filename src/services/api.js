/**
 * API 서비스 모듈
 * 백엔드와 통신하는 함수들을 정의합니다.
 */

// API 기본 URL
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// API 헤더 설정
const getHeaders = () => ({
    "Content-Type": "application/json",
    // 'Authorization': `Bearer ${getAuthToken()}` // 인증 토큰이 필요한 경우
});

/**
 * 스트리밍 메시지 전송 API
 * @param {Object} payload - 메시지 정보
 * @param {Function} onChunk - 스트림 청크 콜백
 * @param {Function} onError - 에러 콜백
 * @param {Function} onComplete - 완료 콜백
 * @returns {Function} abort 함수
 */
export const sendMessageStreamAPI = async (
    payload,
    onChunk,
    onError,
    onComplete
) => {
    const controller = new AbortController();

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        console.log("API Response:", response);

        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status} ${response.statusText}`
            );
        }

        // 스트리밍 응답 처리
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        onComplete?.();
                        break;
                    }

                    // 청크 디코딩
                    const chunk = decoder.decode(value, { stream: true });

                    // SSE 형식 처리 (data: 로 시작하는 라인들)
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6).trim();

                            // [DONE] 신호 체크
                            if (data === "[DONE]") {
                                onComplete?.();
                                return;
                            }

                            // JSON 파싱 시도
                            try {
                                const parsed = JSON.parse(data);
                                onChunk?.(parsed);
                            } catch (e) {
                                // JSON이 아닌 경우 텍스트로 처리
                                if (data) {
                                    onChunk?.(data);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    onError?.(error);
                }
            }
        };

        readStream();
    } catch (error) {
        if (error.name !== "AbortError") {
            onError?.(error);
        }
    }

    // abort 함수 반환
    return () => controller.abort();
};

/**
 * 대화 목록 조회 API
 * @returns {Promise<Array>} 대화 목록
 */
export const getConversationsAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch conversations:", error);
        // 에러 시 빈 배열 반환
        return { data: [] };
    }
};

/**
 * 대화 삭제 API
 * @param {string} conversationId - 대화 ID
 * @returns {Promise}
 */
export const deleteConversationAPI = async (conversationId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/conversations/${conversationId}`,
            {
                method: "DELETE",
                headers: getHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to delete conversation:", error);
        throw error;
    }
};

/**
 * 파일 업로드 API
 * @param {File} file - 업로드할 파일
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export const uploadFileAPI = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            body: formData, // Content-Type 헤더는 자동 설정됨
        });

        if (!response.ok) {
            throw new Error(`Upload Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to upload file:", error);
        throw error;
    }
};
