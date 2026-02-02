import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";

export default function Price() {
  const packages = [
    {
      name: "Basic",
      description: "소규모 공연 및 이벤트",
      price: "1,500,000",
      features: [
        "4K 촬영 (1대 카메라)",
        "기본 음향 녹음",
        "4시간 촬영",
        "기본 편집",
        "납기 2주",
      ],
    },
    {
      name: "Standard",
      description: "중규모 공연 및 프로젝트",
      price: "3,500,000",
      features: [
        "4K 촬영 (2대 카메라)",
        "전문 음향 녹음",
        "8시간 촬영",
        "고급 편집",
        "색보정 포함",
        "납기 1주",
      ],
      featured: true,
    },
    {
      name: "Premium",
      description: "대규모 공연 및 특별 프로젝트",
      price: "7,000,000",
      features: [
        "4K/8K 촬영 (3대 이상 카메라)",
        "전문 음향 녹음 및 믹싱",
        "전일 촬영",
        "프리미엄 편집",
        "컬러 그레이딩",
        "특수 효과",
        "마스터링",
        "납기 협의",
      ],
    },
  ];

  const addOns = [
    { name: "추가 카메라", price: "500,000" },
    { name: "드론 촬영", price: "800,000" },
    { name: "라이브 스트리밍", price: "1,000,000" },
    { name: "음향 믹싱", price: "500,000" },
    { name: "마스터링", price: "300,000" },
    { name: "자막 제작", price: "200,000" },
  ];

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
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">가격 안내</h1>
            <p className="text-lg text-muted-foreground">
              당신의 프로젝트 규모에 맞는 최적의 패키지를 선택하세요.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {packages.map((pkg, index) => (
              <Card
                key={index}
                className={`relative ${
                  pkg.featured ? "ring-2 ring-primary md:scale-105" : ""
                }`}
              >
                {pkg.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      인기
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className="text-muted-foreground ml-2">원</span>
                  </div>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/reservation">
                    <Button
                      className="w-full"
                      variant={pkg.featured ? "default" : "outline"}
                    >
                      예약하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add-ons */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>추가 옵션</CardTitle>
              <CardDescription>
                기본 패키지에 추가할 수 있는 옵션들입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {addOns.map((addon, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <span className="font-medium">{addon.name}</span>
                    <span className="text-primary font-semibold">{addon.price}원</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>가격 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                • 위의 가격은 기본 가격이며, 프로젝트의 특성에 따라 조정될 수 있습니다.
              </p>
              <p>
                • 교통비, 숙박비 등 추가 비용은 별도로 계산됩니다.
              </p>
              <p>
                • 선금 50%, 후금 50%로 결제합니다.
              </p>
              <p>
                • 상세한 견적을 원하시면 예약 페이지에서 상담을 신청해주세요.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">맞춤형 견적을 받으세요</h3>
            <p className="text-muted-foreground">
              당신의 프로젝트에 맞는 정확한 견적을 제공받으세요.
            </p>
            <Link href="/reservation">
              <Button size="lg">
                상담 신청하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
