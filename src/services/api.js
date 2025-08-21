/**
 * API 서비스 모듈 - 완전한 버전
 * 백엔드와 통신하는 모든 함수들을 정의합니다.
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
 * 현대적인 스트리밍 메시지 전송 API
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
        console.log("🚀 스트리밍 요청 시작:", payload);

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
                "Cache-Control": "no-cache",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        console.log("📡 응답 받음:", response.status, response.headers.get("content-type"));

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        // 🔥 핵심: 현대적인 ReadableStream 처리
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("ReadableStream을 사용할 수 없습니다");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log("✅ 스트림 읽기 완료");
                    break;
                }

                // 청크 디코딩
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // 완전한 라인들 처리
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; // 마지막 불완전한 라인은 버퍼에 보관

                for (const line of lines) {
                    if (line.trim() === "") continue;

                    if (line.startsWith("data: ")) {
                        const data = line.slice(6).trim();
                        
                        // [DONE] 체크
                        if (data === "[DONE]") {
                            console.log("🏁 [DONE] 신호 받음");
                            onComplete?.();
                            return;
                        }

                        // JSON 파싱
                        try {
                            const parsed = JSON.parse(data);
                            console.log("📦 청크 받음:", parsed);
                            onChunk?.(parsed);
                        } catch (parseError) {
                            console.warn("⚠️ JSON 파싱 실패, 텍스트로 처리:", data);
                            onChunk?.(data);
                        }
                    }
                }
            }

            // 남은 버퍼 처리
            if (buffer.trim()) {
                console.log("🔄 남은 버퍼 처리:", buffer);
            }

            onComplete?.();

        } finally {
            reader.releaseLock();
        }

    } catch (error) {
        console.error("❌ 스트리밍 오류:", error);
        
        if (error.name !== "AbortError") {
            onError?.(error);
        }
    }

    // abort 함수 반환
    return () => {
        console.log("🛑 스트림 중단");
        controller.abort();
    };
};

/**
 * 비스트리밍 메시지 전송 API
 * @param {Object} payload - 메시지 정보
 * @returns {Promise<Object>} 응답 데이터
 */
export const sendMessageAPI = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                ...payload,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
    }
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

// ===== Azure File Share 연동 문서 관리 API =====

/**
 * 문서 목록 조회 API (일반 RAG)
 * @returns {Promise<Array>} 문서 목록
 */
export const getDocumentsAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/documents`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch documents:", error);
        throw error;
    }
};

/**
 * 부서별 문서 목록 조회 API
 * @param {string} departmentId - 부서 ID
 * @returns {Promise<Array>} 부서별 문서 목록
 */
export const getDepartmentDocumentsAPI = async (departmentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/documents`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch department documents:", error);
        throw error;
    }
};

/**
 * 문서 업로드 API (일반 RAG)
 * @param {Array<File>} files - 업로드할 파일들
 * @returns {Promise<Object>} 업로드 결과
 */
export const uploadDocumentsAPI = async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
    });

    try {
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to upload documents:", error);
        throw error;
    }
};

/**
 * 부서별 문서 업로드 API
 * @param {Array<File>} files - 업로드할 파일들
 * @param {string} departmentId - 부서 ID
 * @returns {Promise<Object>} 업로드 결과
 */
export const uploadDepartmentDocumentsAPI = async (files, departmentId) => {
    const formData = new FormData();
    files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
    });
    formData.append('departmentId', departmentId);

    try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/documents/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to upload department documents:", error);
        throw error;
    }
};

/**
 * 문서 다운로드 API (일반 RAG)
 * @param {string} documentId - 문서 ID
 * @returns {Promise<Blob>} 문서 파일
 */
export const downloadDocumentAPI = async (documentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Download Error: ${response.status}`);
        }

        return await response.blob();
    } catch (error) {
        console.error("Failed to download document:", error);
        throw error;
    }
};

/**
 * 부서별 문서 다운로드 API
 * @param {string} documentId - 문서 ID
 * @param {string} departmentId - 부서 ID
 * @returns {Promise<Blob>} 문서 파일
 */
export const downloadDepartmentDocumentAPI = async (documentId, departmentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/documents/${documentId}/download`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Download Error: ${response.status}`);
        }

        return await response.blob();
    } catch (error) {
        console.error("Failed to download department document:", error);
        throw error;
    }
};

/**
 * 문서 삭제 API (일반 RAG)
 * @param {string} documentId - 문서 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteDocumentAPI = async (documentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Delete Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to delete document:", error);
        throw error;
    }
};

/**
 * 부서별 문서 삭제 API
 * @param {string} documentId - 문서 ID
 * @param {string} departmentId - 부서 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteDepartmentDocumentAPI = async (documentId, departmentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/documents/${documentId}`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Delete Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to delete department document:", error);
        throw error;
    }
};

/**
 * Azure File Share 연결 상태 확인 API
 * @returns {Promise<Object>} 연결 상태
 */
export const checkAzureFileShareConnectionAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/azure/connection-status`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Connection check failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to check Azure File Share connection:", error);
        throw error;
    }
};

/**
 * Azure File Share 동기화 API
 * @returns {Promise<Object>} 동기화 결과
 */
export const syncAzureFileShareAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/azure/sync`, {
            method: "POST",
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to sync Azure File Share:", error);
        throw error;
    }
};

/**
 * 헬스 체크 API
 * @returns {Promise<Object>} 시스템 상태
 */
export const healthCheckAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Health check failed:", error);
        throw error;
    }
};

/**
 * 간단한 테스트 함수 (콘솔에서 실행 가능)
 */
export const testStreamingAPI = async () => {
    console.log("🧪 스트리밍 API 테스트 시작");
    
    const abort = await sendMessageStreamAPI(
        {
            message: "NeOSS 시스템에서 Windows 2012 R2가 설치된 서버들을 찾아줘",
            stream: true
        },
        // onChunk
        (chunk) => {
            console.log("📥 청크:", chunk);
        },
        // onError  
        (error) => {
            console.error("💥 에러:", error);
        },
        // onComplete
        () => {
            console.log("🎉 완료!");
        }
    );
    
    // 10초 후 자동 중단 (테스트용)
    setTimeout(() => {
        console.log("⏰ 10초 경과, 테스트 중단");
        abort();
    }, 10000);
};