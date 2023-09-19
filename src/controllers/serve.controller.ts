import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { UPLOAD_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import httpStatus from '~/constants/httpStatus'
import mime from 'mime'

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params

  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).json('Not Found')
    }
  })
}
export const serveVideoStreamController = (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) return res.status(httpStatus.BAD_REQUEST).json('Required range header')

  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size

  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 6 // 1MB

  const start = Number(range.replace(/\D/g, ''))

  const end = Math.min(start + chunkSize, videoSize - 1)
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  /**
   * chunkSize = 50
   * videoSize = 100
   * |0----------50|51----------99|100 (end)
   * stream 1: start = 0, end = 50, contentLength = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   */

  res.writeHead(httpStatus.PARTIAL_CONTENT, headers)

  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
