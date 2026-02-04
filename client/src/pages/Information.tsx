import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Music, Award, Briefcase } from "lucide-react";

export default function Information() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const experiences = [
    "전 대우전자(주) 중앙연구소 주임연구원",
    "중대 루바토 오케스트라 비올라 및 지휘자 역임(3회)",
    "베누스토 오케스트라 비올라 단원 및 부지휘자 역임",
    "체카 사중주단 비올라 단원",
    "구 테헤란밸리 오케스트라 초대 음악감독 역임",
    "사단법인 레일아트 공연자 및 매거진 팀장 역임",
  ];

  const achievements = [
    "400여개의 오케스트레이션 및 악보 제작 판매중",
    "영화음악 편곡, 녹음 및 자문 (정승필 실종사건, 노리개, 커피메이트)",
    "다수의 드라마 녹음용 악보 및 String 편곡 작업",
    "뮤지컬 음악 작곡 (알로하오에)",
    "세계 최초 온라인 콘서트 '아,대한민국!' 프로듀싱 및 음반제작 (2005)",
    "500여건의 녹음 및 촬영, 300여건의 음반 및 DVD 제작",
    "직장인 밴드에서 바이올린 및 베이스 주자로 활동",
  ];

  const dramaWorks = [
    "신기생뎐", "매리는 외박중", "구미호여우누이뎐", 
    "그겨울 바람이 분다", "굿닥터", "장근석 1집", "시아준수 솔로2집"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden bg-black">
        <div className="relative w-full h-full">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=400&fit=crop"
              alt="Information Hero"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          
          {/* Content */}
          <div className="container relative h-full flex flex-col justify-center items-center text-center">
            <h1 className={`text-6xl font-bold tracking-tight text-white mb-4 transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Information
            </h1>
            <p className={`text-xl text-gray-200 transition-all duration-1000 delay-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              담음미디어를 소개합니다
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-24">
        {/* About Section */}
        <div className="max-w-4xl mx-auto mb-24 text-center">
          <h2 className="text-5xl font-bold tracking-tight mb-8">담음미디어는</h2>
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            다년간 실제 연주 생활과 지휘자 경험을 한 운영자가 직접 녹음-촬영 및 편집을 합니다.
          </p>
          <div className="space-y-4">
            <p className="text-3xl font-bold text-primary">
              음악이 보이는 영상을 만듭니다
            </p>
            <p className="text-3xl font-bold text-primary">
              열정의 가치를 담는, 담음미디어
            </p>
          </div>
        </div>

        {/* Experience & Achievements Grid */}
        <div className="grid gap-12 md:grid-cols-2 max-w-6xl mx-auto mb-24">
          {/* Experience Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">주요 경력</h3>
              </div>
              <ul className="space-y-3">
                {experiences.map((exp, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-primary mt-1.5">•</span>
                    <span className="flex-1">{exp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">주요 실적</h3>
              </div>
              <ul className="space-y-3">
                {achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-primary mt-1.5">•</span>
                    <span className="flex-1">{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Drama Works Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">드라마 및 음반 작업</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                다수의 드라마 녹음용 악보 및 String 편곡 작업을 진행했습니다.
              </p>
              <div className="flex flex-wrap gap-3">
                {dramaWorks.map((work, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-background border border-border rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    {work}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-muted border-t border-border">
        <div className="container py-16 text-center">
          <h3 className="text-3xl font-bold mb-4">프로젝트 문의</h3>
          <p className="text-lg text-muted-foreground mb-8">
            담음미디어와 함께 특별한 영상을 만들어보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/reservation"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              예약하기
            </a>
            <a
              href="/price"
              className="px-8 py-3 bg-background border-2 border-border rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              가격표 보기
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
