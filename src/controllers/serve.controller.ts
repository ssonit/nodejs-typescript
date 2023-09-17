import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params

  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).json('Not Found')
    }
  })
}
export const serveVideoController = (req: Request, res: Response) => {
  const { name } = req.params

  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).json('Not Found')
    }
  })
}
