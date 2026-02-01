/**
 * Swiss International Typographic Style
 * - Clean grid-based layout with systematic structure
 * - Inter typography with clear hierarchy
 * - Minimal decoration, focus on content clarity
 * - Professional blue accent on neutral gray background
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Users, 
  Video, 
  DollarSign, 
  Target, 
  Lightbulb,
  BarChart3,
  Calendar,
  ArrowRight,
  Youtube,
  Eye,
  ThumbsUp
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Youtube className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">담음미디어 분석</h1>
                <p className="text-xs text-muted-foreground">YouTube Channel Growth Strategy</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <a href="https://www.youtube.com/@dameum_media" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                채널 방문
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative border-b border-border">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/images/orchestra-hero.jpg" 
            alt="Orchestra Performance" 
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
        </div>
        <div className="container relative py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-block rounded bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              채널 분석 리포트
            </div>
            <h2 className="mb-6 text-5xl font-bold tracking-tight">
              담음미디어 유튜브 채널<br />성장 전략 분석
            </h2>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              클래식 음악 공연 촬영 전문 채널의 현황을 분석하고, 
              구독자 및 수익성 향상을 위한 구체적인 실행 방안을 제시합니다.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="font-semibold">
                분석 결과 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="font-semibold">
                개선 방안
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="border-b border-border bg-card">
        <div className="container py-16">
          <h3 className="mb-8 text-2xl font-bold">채널 현황</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Users className="h-4 w-4" />
                  구독자
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">914명</div>
                <p className="mt-1 text-xs text-muted-foreground">파트너 프로그램 요건 근접</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Video className="h-4 w-4" />
                  총 동영상
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">397개</div>
                <p className="mt-1 text-xs text-muted-foreground">풍부한 아카이브 보유</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Eye className="h-4 w-4" />
                  평균 조회수
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">100~500</div>
                <p className="mt-1 text-xs text-muted-foreground">최근 콘텐츠 기준</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <ThumbsUp className="h-4 w-4" />
                  인기 영상
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">135K</div>
                <p className="mt-1 text-xs text-muted-foreground">Mozart - Eine kleine Nachtmusik</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Analysis */}
      <section className="border-b border-border">
        <div className="container py-16">
          <div className="mb-12">
            <h3 className="mb-4 text-2xl font-bold">주요 문제점</h3>
            <p className="text-muted-foreground">
              담음미디어 채널이 직면한 핵심 과제를 분석했습니다.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-destructive/10">
                <Target className="h-6 w-6 text-destructive" />
              </div>
              <h4 className="mb-2 text-lg font-semibold">콘텐츠 전략 부재</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                불규칙한 업로드 패턴과 전략적 콘텐츠 기획의 부재로 인해 
                유튜브 알고리즘 최적화가 이루어지지 않고 있습니다.
              </p>
              <Separator className="my-4" />
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 공연 의뢰 시에만 간헐적 업로드</li>
                <li>• 40분~1시간 이상의 긴 영상</li>
                <li>• 검색 최적화 부족</li>
              </ul>
            </div>
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-destructive/10">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <h4 className="mb-2 text-lg font-semibold">타겟 오디언스 불명확</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                B2B 포트폴리오와 일반 시청자용 콘텐츠 사이에서 
                채널 정체성이 혼란스러운 상태입니다.
              </p>
              <Separator className="my-4" />
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• B2B vs B2C 전략 혼재</li>
                <li>• 구독자 증가 정체</li>
                <li>• 수익화 모델 불명확</li>
              </ul>
            </div>
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-destructive/10">
                <Lightbulb className="h-6 w-6 text-destructive" />
              </div>
              <h4 className="mb-2 text-lg font-semibold">차별화 요소 부재</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                단순 클래식 감상 영상은 경쟁 콘텐츠가 과다하며, 
                담음미디어만의 독특한 가치 제안이 부족합니다.
              </p>
              <Separator className="my-4" />
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Classic Solitude 시리즈 차별화 부족</li>
                <li>• 스토리텔링 요소 미흡</li>
                <li>• 브랜딩 일관성 부족</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Strategy */}
      <section className="border-b border-border bg-card">
        <div className="container py-16">
          <div className="mb-12">
            <h3 className="mb-4 text-2xl font-bold">구독자 증대 전략</h3>
            <p className="text-muted-foreground">
              397개의 영상 아카이브를 활용한 체계적인 성장 방안을 제시합니다.
            </p>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  콘텐츠 다각화 및 숏폼 전략
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded border border-border p-4">
                    <h5 className="mb-2 font-semibold">숏폼 콘텐츠 집중 제작</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      기존 풀 콘서트 영상에서 하이라이트 부분(1~3분)을 추출하여 
                      YouTube Shorts로 재가공합니다.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 주 3~5회 정기 업로드</li>
                      <li>• 알고리즘 노출 극대화</li>
                      <li>• 예시: "말러 교향곡 5번 가장 감동적인 3분"</li>
                    </ul>
                  </div>
                  <div className="rounded border border-border p-4">
                    <h5 className="mb-2 font-semibold">시리즈 콘텐츠 기획</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      체계적인 시리즈로 구독자의 지속적인 관심을 유도합니다.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• "클래식 입문자를 위한 5분 해설"</li>
                      <li>• "오케스트라 악기 소개"</li>
                      <li>• "작곡가 이야기"</li>
                      <li>• "공연 메이킹 필름"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  SEO 최적화 및 메타데이터 개선
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded bg-muted p-4">
                    <div className="mb-2 text-sm font-medium">제목 최적화 예시</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-destructive">❌</span>
                        <span className="text-muted-foreground">[공연촬영] 서울시민교향악단 32회 | Mahler, Symphony No. 5</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>말러 교향곡 5번 풀버전 | 서울시민교향악단 32회 정기연주회 | 클래식 명곡 감상</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded border border-border p-4">
                      <h5 className="mb-2 font-semibold text-sm">제목 최적화</h5>
                      <p className="text-xs text-muted-foreground">
                        핵심 키워드 포함: 작곡가명, 곡명, "클래식", "명곡", "감상" 등
                      </p>
                    </div>
                    <div className="rounded border border-border p-4">
                      <h5 className="mb-2 font-semibold text-sm">설명란 최적화</h5>
                      <p className="text-xs text-muted-foreground">
                        곡의 배경 설명, 타임스탬프 추가, 관련 키워드 및 해시태그 포함
                      </p>
                    </div>
                    <div className="rounded border border-border p-4">
                      <h5 className="mb-2 font-semibold text-sm">썸네일 개선</h5>
                      <p className="text-xs text-muted-foreground">
                        작곡가 이미지, 곡 제목 텍스트, 일관된 브랜딩 요소 적용
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  업로드 일관성 확보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="mb-3 font-semibold">최소 업로드 목표</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        주 2회 이상 정기 업로드 (예: 매주 화요일, 금요일)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Shorts는 주 3~5회 업로드
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        기존 아카이브 영상 재편집 및 재업로드 활용
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="mb-3 font-semibold">콘텐츠 캘린더 운영</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        월별 주제 설정 (예: 1월 - 베토벤 특집)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        계절 및 기념일 연계 콘텐츠
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        3개월 단위 사전 기획
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Monetization Strategy */}
      <section className="border-b border-border">
        <div className="container py-16">
          <div className="mb-12">
            <h3 className="mb-4 text-2xl font-bold">수익성 향상 전략</h3>
            <p className="text-muted-foreground">
              다각화된 수익 모델을 통해 안정적인 수익 구조를 구축합니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">유튜브 파트너 프로그램</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-3">3~6개월 내 수익화 요건 충족 예상</p>
                <ul className="space-y-1">
                  <li>• 구독자 1,000명 달성</li>
                  <li>• 시청 시간 4,000시간</li>
                  <li>• 광고 수익 극대화</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">멤버십 프로그램</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-3">유튜브 멤버십 또는 Patreon 활용</p>
                <ul className="space-y-1">
                  <li>• 공연 풀버전 무광고 시청</li>
                  <li>• 메이킹 필름 조기 공개</li>
                  <li>• 악보 제공</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">디지털 상품 판매</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-3">고품질 콘텐츠 직접 판매</p>
                <ul className="space-y-1">
                  <li>• 공연 영상 다운로드</li>
                  <li>• 클래식 감상 가이드북</li>
                  <li>• 악보 및 연주 팁 자료</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">B2B 서비스 강화</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-3">포트폴리오 노출로 의뢰 증대</p>
                <ul className="space-y-1">
                  <li>• 공연 촬영 패키지</li>
                  <li>• 채널 관리 서비스</li>
                  <li>• 교육용 영상 제작</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-b border-border bg-card">
        <div className="container py-16">
          <div className="mb-12">
            <h3 className="mb-4 text-2xl font-bold">실행 로드맵</h3>
            <p className="text-muted-foreground">
              단계별 실행 계획으로 체계적인 채널 성장을 달성합니다.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="flex-1 pb-8">
                <div className="mb-2 text-sm font-medium text-muted-foreground">1~2개월</div>
                <h4 className="mb-3 text-lg font-semibold">기반 구축</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 채널 브랜딩 정비: 채널 아트, 로고, 인트로/아웃트로 제작</li>
                  <li>• 기존 영상 메타데이터 최적화: 제목, 설명, 태그, 썸네일 개선</li>
                  <li>• 콘텐츠 캘린더 수립 및 3개월치 콘텐츠 기획</li>
                  <li>• SNS 계정 개설 및 크로스 플랫폼 전략 수립</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="flex-1 pb-8">
                <div className="mb-2 text-sm font-medium text-muted-foreground">3~4개월</div>
                <h4 className="mb-3 text-lg font-semibold">콘텐츠 생산 가속화</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 주 2회 정기 업로드 시작</li>
                  <li>• Shorts 주 3~5회 업로드</li>
                  <li>• 시리즈 콘텐츠 론칭 (클래식 입문자 시리즈, 악기 소개 시리즈 등)</li>
                  <li>• 커뮤니티 활성화: 댓글 소통, 커뮤니티 탭 활용</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="flex-1 pb-8">
                <div className="mb-2 text-sm font-medium text-muted-foreground">5~6개월</div>
                <h4 className="mb-3 text-lg font-semibold">수익화 및 확장</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 유튜브 파트너 프로그램 가입 (목표: 구독자 1,500명, 시청 시간 6,000시간)</li>
                  <li>• 멤버십 프로그램 론칭</li>
                  <li>• 첫 온라인 강의 출시</li>
                  <li>• 협업 콘텐츠 제작 시작</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  4
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2 text-sm font-medium text-muted-foreground">7~12개월</div>
                <h4 className="mb-3 text-lg font-semibold">안정화 및 성장</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 월 광고 수익 100만원 이상 달성 목표</li>
                  <li>• 멤버십 회원 100명 이상 확보</li>
                  <li>• B2B 서비스 확대: 월 2~3건 이상의 공연 촬영 의뢰 확보</li>
                  <li>• 브랜드 협업 및 스폰서십 계약 체결</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Factors */}
      <section className="border-b border-border">
        <div className="container py-16">
          <div className="mb-12">
            <h3 className="mb-4 text-2xl font-bold">핵심 성공 요인</h3>
            <p className="text-muted-foreground">
              담음미디어가 성공하기 위한 세 가지 핵심 요소입니다.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">일관성</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-4">
                  정기적인 업로드와 일관된 브랜딩을 유지해야 합니다. 
                  유튜브 알고리즘은 꾸준히 활동하는 채널을 선호하며, 
                  시청자들도 정기적으로 콘텐츠를 기대할 수 있는 채널을 구독합니다.
                </p>
                <div className="rounded bg-muted p-3 text-xs">
                  "꾸준함이 재능을 이긴다"
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">차별화</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-4">
                  단순히 공연 영상을 업로드하는 것이 아니라, 스토리텔링, 해설, 
                  비하인드 스토리 등을 통해 담음미디어만의 독특한 가치를 제공해야 합니다.
                </p>
                <div className="rounded bg-muted p-3 text-xs">
                  "음악이 보이는 영상" 슬로건 실현
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">데이터 기반 최적화</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-4">
                  YouTube Analytics를 통해 어떤 콘텐츠가 잘 작동하는지 
                  지속적으로 분석하고, 전략을 조정해야 합니다.
                </p>
                <div className="rounded bg-muted p-3 text-xs">
                  실험 → 측정 → 개선의 반복
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-card">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="mb-6 text-3xl font-bold">결론</h3>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              담음미디어는 고품질 공연 촬영 역량과 397개의 영상 아카이브라는 
              강력한 자산을 보유하고 있습니다. 위에서 제안한 전략을 체계적으로 
              실행한다면, <strong className="text-foreground">6개월 내에 구독자 2,000명 이상</strong>, 
              <strong className="text-foreground"> 12개월 내에 월 수익 100만원 이상</strong>을 
              달성할 수 있을 것으로 예상됩니다.
            </p>
            <div className="rounded-lg border border-primary bg-primary/5 p-6">
              <p className="text-sm leading-relaxed">
                핵심은 B2B 포트폴리오 채널에서 B2C 콘텐츠 채널로의 전환을 통해 
                구독자와 수익을 동시에 확보하고, 이를 다시 B2B 비즈니스 확장으로 
                연결하는 <strong className="text-primary">선순환 구조</strong>를 만드는 것입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium">담음미디어 유튜브 채널 분석</p>
              <p className="text-xs text-muted-foreground">
                2026 · 채널 성장 전략 리포트
              </p>
            </div>
            <Button variant="default" size="sm">
              <a href="https://www.youtube.com/@dameum_media" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                채널 방문하기
              </a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
