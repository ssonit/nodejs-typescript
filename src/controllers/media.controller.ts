import { Request, Response } from 'express'
import mediaService from '~/services/media.service'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadImage(req)

  return res.json({
    message: 'Uploaded image success',
    data: result
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideo(req)

  return res.json({
    message: 'Uploaded video success',
    data: result
  })
}
