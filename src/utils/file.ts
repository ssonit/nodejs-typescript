import fs from 'fs'
import { Request } from 'express'
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const removeImageFromFolder = (filePath: string) => {
  fs.unlinkSync(filePath)
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!valid) {
        form.emit('error' as any, new Error('Invalid image') as any)
      }

      return valid
    }
  })

  // Chuyển từ callback sang Promise

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log({ fields, files })
      if (err) {
        return reject(err)
      }

      if (!files.image) {
        return reject(new Error('File is empty'))
      }
      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB

    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))

      if (!valid) {
        form.emit('error' as any, new Error('Invalid video') as any)
      }

      return valid
    }
  })

  // Chuyển từ callback sang Promise

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log({ fields, files })
      if (err) {
        return reject(err)
      }

      if (!files.video) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video as File[]

      videos.forEach((v) => {
        const ext = getExtension(v.originalFilename as string)
        fs.renameSync(v.filepath, v.filepath + '.' + ext)
        v.newFilename = v.newFilename + '.' + ext
        v.filepath = v.filepath + '.' + ext
      })

      return resolve(files.video as File[])
    })
  })
}

export const getNameFromFile = (fileName: string) => {
  const name = fileName.split('.')
  name.pop()
  return name.join('.')
}
export const getExtension = (fileName: string) => {
  const name = fileName.split('.')
  return name[name.length - 1]
}
