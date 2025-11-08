import type { Preferences } from "../types";

type Prompts = {
    faceShape: {
        prompt: string;
        systemInstruction: string;
    };
    suggestions: {
        getPrompt: (prefs: Preferences, faceShape: string | null) => string;
        systemInstruction: string;
        schema: {
            name: string;
            description: string;
            reason: string;
        }
    }
};

const vi: Prompts = {
    faceShape: {
        prompt: "Phân tích hình dạng khuôn mặt trong ảnh này (ví dụ: Tròn, Oval, Vuông, Trái tim, Kim cương, Dài). Chỉ trả về tên của hình dạng khuôn mặt.",
        systemInstruction: "Bạn là một chuyên gia phân tích đặc điểm khuôn mặt. Nhiệm vụ của bạn là xác định chính xác hình dạng của khuôn mặt từ một bức ảnh và chỉ trả về tên của hình dạng đó."
    },
    suggestions: {
        getPrompt: (prefs, faceShape) => `
            Dựa trên sở thích của tôi dưới đây, hình dạng khuôn mặt của tôi là '${faceShape || 'không xác định'}', và ảnh chân dung đính kèm, hãy đề xuất 5 kiểu tóc.
            - Độ dài mong muốn: ${prefs.length === 'any' ? 'Bất kỳ' : prefs.length}
            - Kiểu tóc mong muốn: ${prefs.style === 'any' ? 'Bất kỳ' : prefs.style}
            - Phong cách/Dịp: ${prefs.vibe}
        `,
        systemInstruction: "Bạn là một nhà tạo mẫu tóc ảo chuyên nghiệp. Vai trò của bạn là phân tích khuôn mặt của một người từ ảnh và đề xuất 5 kiểu tóc phù hợp dựa trên các đặc điểm, hình dạng khuôn mặt và sở thích đã nêu của họ. Đối với mỗi đề xuất, hãy cung cấp tên kiểu tóc, mô tả ngắn gọn và lý do rõ ràng tại sao nó lại hợp với người dùng.",
        schema: {
            name: "Tên của kiểu tóc (ví dụ: 'Bob Cổ điển', 'Pixie uốn xoăn').",
            description: "Một mô tả ngắn gọn, hấp dẫn về kiểu tóc.",
            reason: "Giải thích ngắn gọn tại sao kiểu tóc này phù hợp với người trong ảnh, đề cập đến các đặc điểm khuôn mặt cụ thể nếu có thể."
        }
    }
};

const en: Prompts = {
    faceShape: {
        prompt: "Analyze the face shape in this photo (e.g., Round, Oval, Square, Heart, Diamond, Long). Return only the name of the face shape.",
        systemInstruction: "You are an expert facial feature analyst. Your task is to accurately determine the shape of the face from a photograph and return only the name of that shape."
    },
    suggestions: {
        getPrompt: (prefs, faceShape) => `
            Based on my preferences below, my face shape which is '${faceShape || 'not determined'}', and the attached photo of my face, please suggest 5 hairstyles.
            - Desired Length: ${prefs.length}
            - Desired Style: ${prefs.style}
            - Desired Vibe/Occasion: ${prefs.vibe}
        `,
        systemInstruction: "You are an expert virtual hairstylist. Your role is to analyze a person's face from a photo and suggest 5 flattering hairstyles based on their facial features, face shape, and stated preferences. For each suggestion, provide a name for the hairstyle, a brief description, and a clear reason why it's a good match for the user.",
        schema: {
            name: "The name of the hairstyle (e.g., 'Classic Bob', 'Textured Pixie Cut').",
            description: "A short, appealing description of the hairstyle.",
            reason: "A concise explanation of why this hairstyle would suit the person in the photo, mentioning specific facial features if possible."
        }
    }
};

const prompts = { vi, en };

export const getPrompts = (language: 'vi' | 'en'): Prompts => {
    return prompts[language];
}