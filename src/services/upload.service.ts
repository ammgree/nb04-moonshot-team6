import cloudinary from '../configs/cloudinary.js';
import { extractPublicId } from 'cloudinary-build-url';

// 클라우디너리에 버퍼를 Data URI로 변환 후 업로드하는 함수
export const uploadBuffer = async (fileBuffer: Buffer, mimetype:string, folder = 'uploads') => {
  const base64 = fileBuffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'auto',       // 모든 파일 형식(auto)
    use_filename: true,         // 원본 파일명 유지
    unique_filename: false,     // 중복 시 덮어쓰기 가능
  })
  return result.secure_url;
};

// cloudinary-build-url 패키지를 사용한 업로드 함수
// const publicId = extractPublicId(
//   result.secure_url
// );

// 클라우디너리에서 파일 삭제
export const deleteFileFromCloudinary = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};