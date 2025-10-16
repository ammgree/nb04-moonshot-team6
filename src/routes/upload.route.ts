import upload from '../middlewares/upload.middleware.js';
import express from 'express';
import { uploadBuffer } from '../services/upload.service.js';

const router = express.Router();

  // 이미지 업로드 라우터
router.post('/files', upload.array('files'), async(req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: '파일이 없습니다.' });
    }
    const uploadResults = await Promise.all(
      files.map((file) =>
        uploadBuffer(file.buffer, file.mimetype, 'uploads')
      )
    );
    res.json(uploadResults);
  } catch (error) {
    console.error('POST /images Error:', error);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
});

export default router;