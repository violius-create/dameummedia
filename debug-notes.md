# 금액 입력 문제 분석

## 현상
- 견적액 필드에 100000이 있었는데, 입력 시도 후 "숫자 입력" (placeholder)만 보임
- 즉, 입력 시 값이 지워지고 새 값이 입력되지 않음
- "Element is not attached to the DOM" 에러 발생 → React가 리렌더링하면서 DOM 요소가 교체됨

## 근본 원인
- `setEditData`가 호출될 때마다 React가 리렌더링
- `value={editData?._quotedAmountStr ?? String(editData?.quotedAmount ?? '')}` 에서
  - 첫 입력 시 _quotedAmountStr가 없으므로 String(100000) = "100000" 표시
  - onChange에서 setEditData로 _quotedAmountStr를 설정하면 리렌더링
  - 하지만 리렌더링 시 Input 컴포넌트가 완전히 재생성될 수 있음 (key 문제 또는 조건부 렌더링)

## 해결 방안
- 금액 필드를 별도 컴포넌트로 분리하여 리렌더링 격리
- 또는 uncontrolled input으로 변경 (ref 사용)
- 또는 onChange에서 직접 DOM value 유지
