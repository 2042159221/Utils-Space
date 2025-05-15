import { NextResponse } from 'next/server';

// 建议将 Access Token 缓存起来，避免每次请求都重新获取
// 这里为了简化，每次请求都重新获取，实际生产环境请优化
async function getBaiduAccessToken(): Promise<string | null> {
  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.error("百度 API Key 或 Secret Key 未设置环境变量！");
    return null;
  }

  const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;

  try {
    const response = await fetch(tokenUrl, { method: 'POST' });
    const data = await response.json();
    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("获取百度 Access Token 失败:", data);
      return null;
    }
  } catch (error) {
    console.error("获取百度 Access Token 异常:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { imageDataBase64 } = await request.json();

    if (!imageDataBase64) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 });
    }

    const accessToken = await getBaiduAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: '无法获取百度 Access Token，请检查环境变量设置' }, { status: 500 });
    }

    const apiUrl = `https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg?access_token=${accessToken}`;

    // 百度 API 要求 image 参数进行 URL-encode
    const encodedImageDataBase64 = encodeURIComponent(imageDataBase64);

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json' // 明确接受 JSON 响应
      },
      body: `image=${encodedImageDataBase64}&type=foreground`, // 只请求前景图
    });

    const apiResult = await apiResponse.json();

    if (apiResult.foreground) {
      // 成功获取前景图 Base64 数据
      return NextResponse.json({ foreground: apiResult.foreground });
    } else {
      // API 返回错误或没有前景图数据
      console.error("百度人像分割 API 调用失败:", apiResult);
      return NextResponse.json({ error: apiResult.error_msg || '百度人像分割 API 调用失败' }, { status: apiResponse.status });
    }

  } catch (error: any) {
    console.error("处理百度人像分割请求时发生异常:", error);
    return NextResponse.json({ error: error.message || '服务器内部错误' }, { status: 500 });
  }
}

// 为了在开发环境中提示用户设置环境变量，可以在这里添加一个GET请求处理
export async function GET() {
  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return NextResponse.json({ message: "请设置 BAIDU_API_KEY 和 BAIDU_SECRET_KEY 环境变量" }, { status: 200 });
  } else {
     return NextResponse.json({ message: "百度 API 环境变量已设置" }, { status: 200 });
  }
}