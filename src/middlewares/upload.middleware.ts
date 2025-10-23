import multer from 'multer';

// 파일을 버퍼로 저장
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
});

export default upload;
