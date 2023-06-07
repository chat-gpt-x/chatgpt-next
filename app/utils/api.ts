import type {ChatRequest, ModelsResponse} from './constants';
import {HttpHeaderJson, HttpMethod} from './constants';
import {ResError} from './error';
import {stream2string} from './stream';

/**
 * 请求 /api/chat 接口
 * 参数和 OpenAI 官方的接口参数一致，apiKey 在服务端自动添加
 * 可以传入 onMessage 来流式的获取响应
 */
export const fetchApiChat = async ({
                                       onMessage,
                                       ...chatRequest
                                   }: {
    /**
     * 接受 stream 消息的回调函数
     */
    onMessage?: (content: string) => void;
} & Partial<ChatRequest>) => {
    console.log("----------------------------------------")
    console.log("fetchApiChat")

    const response = await fetch('/api/chat', {
        method: HttpMethod.POST,
        headers: HttpHeaderJson,
        body: JSON.stringify(chatRequest),
    });
    console.log("statusText")
    console.log(response)
    // 如果返回错误，则直接抛出错误
    if (!response.ok) {
        throw await getError(response);
    }
    console.log("----------------------------------------")

    // 使用 stream2string 来读取内容
    return await stream2string(response.body, onMessage);
};

/**
 * 请求 /api/models 接口
 * 获取可用的模型列表
 */
export const fetchApiModels = async (): Promise<ModelsResponse> => {
    console.log("----------------------------------------")
    console.log("fetchApiModels")
    const response = await fetch('/api/models', {
        method: HttpMethod.GET,
        headers: HttpHeaderJson,
    });
    console.log("statusText")
    console.log(response.statusText)
    // 如果返回错误，则直接抛出错误
    if (!response.ok) {
        throw await getError(response);
    }
    console.log("----------------------------------------")
    return await response.json();
};

/**
 * 处理 response 的错误
 */
async function getError(response: Response) {
    const error = new ResError({
        code: response.status,
        message: response.statusText,
    });

    try {
        let responseJson = await response.json();
        // 使用 resJson.error 覆盖 error
        Object.assign(error, responseJson, responseJson.error);
    } catch (e) {
        console.error("*****************************************")
        console.error("getError:")
        console.error(e)
        console.error("*****************************************")
    }
    return error;
}
