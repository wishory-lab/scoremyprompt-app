# Supabase 마이그레이션 실행 가이드

## 개요
`prompt_text` (전체 프롬프트 저장) → `prompt_preview` (80자 미리보기만 저장)로 변경하는 프라이버시 마이그레이션입니다.

---

## 실행 순서 (중요!)

### 1단계: 새 코드 배포 먼저
마이그레이션 SQL을 실행하기 **전에** 새 코드를 Vercel에 배포해야 합니다.
새 코드는 `prompt_preview` 컬럼에 쓰고, 기존 `prompt_text`도 아직 있으니 에러가 나지 않습니다.

```bash
# Git에서 최신 코드 push → Vercel 자동 배포
git add -A && git commit -m "Phase 4: privacy + analytics + viral loop" && git push
```

배포 후 사이트 정상 작동 확인:
- `https://scoremyprompt.com/api/health` → `{"status":"ok"}`
- 프롬프트 1개 채점 테스트 → 정상 결과 확인

---

### 2단계: Supabase SQL Editor에서 마이그레이션 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. ScoreMyPrompt 프로젝트 선택
3. 좌측 메뉴 → **SQL Editor** 클릭
4. **New query** 클릭
5. 아래 SQL을 **한 스텝씩** 실행 (전체 한 번에 해도 됨)

```sql
-- Step 1: prompt_preview 컬럼 추가
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS prompt_preview TEXT;
```

```sql
-- Step 2: 기존 데이터 백필 (prompt_text → 80자 미리보기)
UPDATE analyses
SET prompt_preview = LEFT(prompt_text, 80) || CASE WHEN char_length(prompt_text) > 80 THEN '...' ELSE '' END
WHERE prompt_preview IS NULL AND prompt_text IS NOT NULL;
```

```sql
-- Step 3: prompt_length generated 컬럼 제거 (prompt_text 의존)
ALTER TABLE analyses DROP COLUMN IF EXISTS prompt_length;
```

```sql
-- Step 4: prompt_text 컬럼 완전 삭제 (개인정보 제거)
ALTER TABLE analyses DROP COLUMN IF EXISTS prompt_text;
```

> **팁**: Step 1~2를 먼저 실행하고 검증한 뒤, Step 3~4를 실행하면 더 안전합니다.

---

### 3단계: 마이그레이션 검증

SQL Editor에서 아래 쿼리들을 실행하여 성공 여부를 확인하세요:

```sql
-- 검증 1: prompt_text 컬럼이 없어졌는지 확인
SELECT column_name FROM information_schema.columns
WHERE table_name = 'analyses' AND column_name = 'prompt_text';
-- 결과: 0 rows (빈 결과여야 정상)
```

```sql
-- 검증 2: prompt_preview 컬럼이 있는지 확인
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'analyses' AND column_name = 'prompt_preview';
-- 결과: 1 row (prompt_preview | text)
```

```sql
-- 검증 3: 백필 확인 (기존 데이터가 있는 경우)
SELECT id, prompt_preview, overall_score FROM analyses ORDER BY created_at DESC LIMIT 5;
-- prompt_preview에 값이 들어있으면 정상
```

```sql
-- 검증 4: Materialized View 갱신
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly;
-- 에러 없으면 정상
```

---

### 4단계: 사이트 최종 확인

마이그레이션 완료 후:
1. `scoremyprompt.com` 에서 프롬프트 채점 → 정상 결과 + 공유 페이지 확인
2. Supabase Table Editor → `analyses` 테이블에서 `prompt_preview` 컬럼 확인
3. `prompt_text` 컬럼이 보이지 않으면 성공

---

## 롤백 (문제 발생 시)

만약 마이그레이션 중 문제가 생기면:

```sql
-- prompt_text 복원 (Step 4 실행 전이라면 이미 있음)
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS prompt_text TEXT;

-- prompt_preview에서 역복원은 불가 (80자로 잘렸으므로)
-- → 기존 데이터 손실은 없음, prompt_text가 아직 있는 상태에서만 롤백 가능
```

> **중요**: Step 4 (DROP prompt_text) 실행 후에는 전체 프롬프트 복원 불가능합니다.
> Step 1~2까지만 먼저 실행하고 검증한 뒤 Step 3~4를 진행하세요.

---

## 타임라인 권장

| 시점 | 작업 |
|------|------|
| D-2 (2/27) | 새 코드 Vercel 배포 |
| D-2 (2/27) | Step 1~2 실행 + 검증 |
| D-1 (2/28) | Step 3~4 실행 + 최종 검증 |
| D-Day (3/1) | go-nogo 체크 후 런칭 |
