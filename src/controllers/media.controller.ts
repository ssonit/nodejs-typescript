import { Request, Response } from 'express'
import path from 'path'

export const uploadImageController = async (req: Request, res: Response) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024 // 300KB
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }

    return res.json({
      message: 'Uploading image'
    })
  })
  return res.json('success')
}
