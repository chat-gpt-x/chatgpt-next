import {cookies} from 'next/headers';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

import {exampleModelsResponse, HttpHeaderJson, HttpMethod, HttpStatus} from '@/utils/constants';
import {env} from '@/utils/env';
import {getApiKey} from '@/utils/getApiKey';
import {bootstrap} from 'global-agent-ts';

bootstrap();

export const runtime = 'nodejs'

/**
 * 获取可用的 models
 */
export async function GET(req: NextRequest) {
    // 测试环境返回 example
    if (env.NODE_ENV === 'development') {
        return NextResponse.json(exampleModelsResponse, {status: HttpStatus.OK});
    }
    console.log("------------------------------------------------");
    let url = `https://${env.CHATGPT_NEXT_API_HOST}/v1/models`;
    console.log("url:" + url);

    // 正式环境透传即可
    const apiKey = getApiKey(cookies().get('apiKey')?.value);
    console.log("apiKey:" + apiKey);
    try {
        const fetchResult = await fetch(url, {
            method: HttpMethod.GET,
            headers: {
                ...HttpHeaderJson,
                Authorization: `Bearer ${apiKey}`,
            },
        });
        console.log("fetchResult" + fetchResult);
        console.log("------------------------------------------------");

        // https://stackoverflow.com/a/29082416/2777142
        // 当状态码为 401 且响应头包含 Www-Authenticate 时，浏览器会弹一个框要求输入用户名和密码，故这里需要过滤此 header
        if (fetchResult.status === HttpStatus.Unauthorized && fetchResult.headers.get('Www-Authenticate')) {
            const wwwAuthenticateValue = fetchResult.headers.get('Www-Authenticate') ?? '';
            fetchResult.headers.delete('Www-Authenticate');
            fetchResult.headers.set('X-Www-Authenticate', wwwAuthenticateValue);
        }

        return fetchResult;
    } catch (e) {
        console.error("*******************************************************")
        console.error("get model error:")
        console.error(e);
        console.error("*******************************************************")
        return null;
    }
}
