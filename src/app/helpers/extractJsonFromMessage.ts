export const extractJsonFromMessage = (message: any) => {
    try {
        const content = message?.content || "";
        const jsonBlockMatch = content.match(/```json([\s\S]*?)```/);
        if (jsonBlockMatch) {
            const jsonText = jsonBlockMatch[1].trim();
            return JSON.parse(jsonText);
        }
        if (content.trim().startsWith("[") || content.trim().startsWith("{")) {
            return JSON.parse(content);
        }
        const jsonFallbackMatch = content.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonFallbackMatch) {
            return JSON.parse(jsonFallbackMatch[1]);
        }
        return [];
    } catch (error) {
        console.error("Error parsing AI response:", error);
        return [];
    }
};