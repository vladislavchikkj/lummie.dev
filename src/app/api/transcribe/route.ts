import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Проверяем аутентификацию
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем FormData с аудио файлом
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const language = formData.get('language') as string | null

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Конвертируем File в формат, который понимает OpenAI SDK
    // В Node.js 18+ есть поддержка File API, но лучше использовать поток
    const audioBlob = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(audioBlob)

    // Создаем File объект для OpenAI SDK
    // OpenAI SDK для Node.js принимает File объект, созданный из Buffer
    const file = new File([audioBuffer], audioFile.name, {
      type: audioFile.type || 'audio/webm',
    })

    // Отправляем в Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: language || undefined, // Опционально, если не указан - автоопределение
      response_format: 'text',
      temperature: 0,
    })

    return NextResponse.json({
      text: transcription,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}



