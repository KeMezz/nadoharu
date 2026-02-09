// 통합 테스트 환경 설정
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 루트의 .env 파일 로드
dotenv.config({ path: resolve(__dirname, '../../../.env') });
