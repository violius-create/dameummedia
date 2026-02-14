import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Price() {
  const { user, isAuthenticated } = useAuth();
  const { data: pricePackages, isLoading: packagesLoading } = trpc.prices.getPackages.useQuery();
  const { data: addOns, isLoading: addOnsLoading } = trpc.prices.getAddOns.useQuery();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  if (packagesLoading || addOnsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">가격표를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative h-full flex items-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground">가격표</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              담음미디어의 다양한 패키지를 확인하고 귀사의 필요에 맞는 서비스를 선택하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-16">
        {/* Introduction */}
        <div className="mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">공연 실황 촬영 및 녹음 패키지</h2>
          <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <p>고품격의 공연 실황 촬영, 녹음</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <p>다수의 4K 카메라로 다양하고 생동감 있는 촬영</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <p>리허설 촬영으로 더욱 디테일한 앵글 구현</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <p>음반 수준의 고퀄리티 녹음</p>
            </div>
          </div>
        </div>

        {/* Price Packages */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">서비스 패키지</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {pricePackages?.map((pkg, index) => (
              <Card
                key={pkg.id}
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  selectedPackage === pkg.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{pkg.displayName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{pkg.targetAudience}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">기본 가격</p>
                    <p className="text-3xl font-bold text-primary">{formatPrice(pkg.basePrice)}</p>
                    <p className="text-xs text-muted-foreground mt-1">편집비 포함</p>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4 border-t border-border pt-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">카메라</p>
                      <p className="text-sm text-muted-foreground">{pkg.cameraType}</p>
                      <p className="text-sm text-muted-foreground">{pkg.cameraCount}대</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">마이크</p>
                      <p className="text-sm text-muted-foreground">{pkg.microphoneType}</p>
                      <p className="text-sm text-muted-foreground">{pkg.microphoneCount}개</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">스탭</p>
                      <p className="text-sm text-muted-foreground">운영 스탭 {pkg.operatorCount}명</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href="/reservation">
                    <Button className="w-full" variant={index === 2 ? "default" : "outline"}>
                      예약하기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add-ons Section */}
        {addOns && addOns.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">추가 옵션</h3>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {addOns.map((addon) => (
                  <div key={addon.id} className="space-y-2">
                    <h4 className="font-semibold text-foreground">{addon.name}</h4>
                    {addon.description && (
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    )}
                    <p className="text-lg font-bold text-primary">{formatPrice(addon.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-muted/50 border border-border rounded-lg p-8 space-y-4">
          <h3 className="text-xl font-bold text-foreground">공통사항</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">•</span>
              <span>리허설 때 필요 장면을 미리 촬영하여 더욱 다채롭고 다이나믹한 영상이 구현됩니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">•</span>
              <span>녹음 의뢰시, 리허설 녹음으로 본 공연의 실수 및 에러를 대체합니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">•</span>
              <span>공연 촬영시 카메라 세팅은 공연장의 환경과 제약에 따라 변동될 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">•</span>
              <span>리허설 사진 촬영이 필요하시면 Reservation 게시판에 추가 신청 해주시기 바랍니다.</span>
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-12 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">궁금한 점이 있으신가요?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            담음미디어의 전문가 팀이 귀사의 프로젝트에 맞는 최적의 솔루션을 제안해드립니다.
          </p>
          <Link href="/reservation">
            <Button size="lg" className="mt-4">
              예약 문의하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
