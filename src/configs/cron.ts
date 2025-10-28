import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

cron.schedule('0 * * * *', () => {
  console.log(`[${new Date().toISOString()}] cron 시작`);
  setImmediate(async () => {
    try {
        const batchSize = 500;

        let tokens = await prisma.refreshToken.findMany({
            where: { revoked: true},
            take: batchSize,
            select: { id: true },
        });

        while (tokens.length > 0) {
            await prisma.refreshToken.deleteMany({
            where: { id: { in: tokens.map(t => t.id) } },
            });
            console.log(`[${new Date().toISOString()}] 삭제 완료: ${tokens.length}개`);
            tokens = await prisma.refreshToken.findMany({
                where: { revoked: true},
                take: batchSize,
                select: { id: true },
            });
        }

      console.log(`[${new Date().toISOString()}] cron 종료`);
    } catch (error) {
      console.error('토큰 정리 중 오류:', error);
    }
  });
});

// 서버 계속 실행 상태 유지
console.log('토큰 정리 스케줄러가 1시간마다 실행됩니다.');
