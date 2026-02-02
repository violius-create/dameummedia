import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Mic, Video, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Information() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">서비스 소개</h1>
            <p className="text-lg text-muted-foreground">
              담음미디어는 20년 이상의 경험을 바탕으로 최고 품질의 음악 공연 촬영, 
              음향 제작, 그리고 영상 제작 서비스를 제공합니다.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Music className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Concert Live</CardTitle>
                <CardDescription>공연 촬영 및 음향 제작</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  전문 장비와 경험 많은 팀이 당신의 공연을 생생하게 기록합니다.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>4K/8K 고화질 촬영</li>
                  <li>멀티 앵글 촬영</li>
                  <li>전문 음향 녹음</li>
                  <li>실시간 스트리밍</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mic className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>음향 제작</CardTitle>
                <CardDescription>녹음, 믹싱, 마스터링</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  최신 음향 장비와 전문 엔지니어가 최고의 사운드를 만들어냅니다.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>스튜디오 녹음</li>
                  <li>라이브 녹음</li>
                  <li>프로페셔널 믹싱</li>
                  <li>마스터링</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Making Film</CardTitle>
                <CardDescription>뮤직 비디오 및 영상 제작</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  창의적인 영상 제작으로 당신의 음악을 시각적으로 표현합니다.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>뮤직 비디오 제작</li>
                  <li>프로필 영상</li>
                  <li>광고 영상</li>
                  <li>컨셉 영상</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>포스트 프로덕션</CardTitle>
                <CardDescription>편집, 컬러 그레이딩, 이펙트</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  촬영된 영상을 최고 수준으로 완성시킵니다.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>전문 영상 편집</li>
                  <li>컬러 그레이딩</li>
                  <li>특수 효과</li>
                  <li>자막 제작</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Us */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>왜 담음미디어를 선택해야 할까요?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">20년 이상의 경험</h4>
                  <p className="text-sm text-muted-foreground">
                    수많은 공연과 프로젝트를 성공적으로 진행한 경험이 있습니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">최신 장비</h4>
                  <p className="text-sm text-muted-foreground">
                    항상 최신 기술과 장비를 사용하여 최고의 품질을 보장합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">전문 팀</h4>
                  <p className="text-sm text-muted-foreground">
                    촬영, 음향, 편집 등 각 분야의 전문가로 구성된 팀입니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">맞춤형 서비스</h4>
                  <p className="text-sm text-muted-foreground">
                    당신의 요구에 맞는 맞춤형 서비스를 제공합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">당신의 프로젝트를 시작하세요</h3>
            <p className="text-muted-foreground">
              전문가 상담을 통해 최적의 서비스를 제공받으세요.
            </p>
            <Link href="/reservation">
              <Button size="lg">
                예약하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
