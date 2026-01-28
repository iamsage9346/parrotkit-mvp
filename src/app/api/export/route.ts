import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const videos = formData.getAll('videos') as File[];

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'No videos provided' },
        { status: 400 }
      );
    }

    console.log(`Received ${videos.length} videos to send to ${email}`);

    // TODO: 실제 이메일 전송 구현
    // 예: SendGrid, AWS SES, Nodemailer 등 사용
    
    // 임시로 파일 저장 (실제로는 이메일 전송)
    const tempDir = path.join(process.cwd(), 'temp');
    
    for (const video of videos) {
      const buffer = Buffer.from(await video.arrayBuffer());
      const filePath = path.join(tempDir, video.name);
      await writeFile(filePath, buffer);
      console.log(`Saved: ${video.name}`);
      
      // 이메일 전송 후 삭제
      // await unlink(filePath);
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: `${videos.length} videos will be sent to ${email}`,
      email,
      videoCount: videos.length,
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export videos' },
      { status: 500 }
    );
  }
}
