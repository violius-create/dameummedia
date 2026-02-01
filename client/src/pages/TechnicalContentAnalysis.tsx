/**
 * Swiss International Typographic Style
 * - Clean grid-based layout with systematic structure
 * - Inter typography with clear hierarchy
 * - Minimal decoration, focus on content clarity
 * - Professional blue accent on neutral gray background
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users, Video, Zap, Microscope } from "lucide-react";
import { technicalContentChannels } from "@/data/technicalChannels";

export default function TechnicalContentAnalysis() {
  const [selectedChannel, setSelectedChannel] = useState(technicalContentChannels[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            음악 & 영상 기술 콘텐츠 채널 분석
          </h1>
          <p className="text-lg text-slate-600">
            음향학, 주파수 분석, 무대 과학, 카메라 원리 등 기술적 콘텐츠로 성공한 채널들을 분석합니다
          </p>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">분석 채널 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{technicalContentChannels.length}</div>
              <p className="text-xs text-slate-500 mt-1">기술 콘텐츠 채널</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">총 구독자 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">100M+</div>
              <p className="text-xs text-slate-500 mt-1">누적 구독자</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">주요 분야</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">5</div>
              <p className="text-xs text-slate-500 mt-1">기술 분야</p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">채널 목록</h2>
          <p className="text-sm text-slate-600 mb-4">클릭하여 상세 분석 보기</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {technicalContentChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedChannel.id === channel.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-900 text-sm">{channel.name}</div>
                <div className="text-xs text-slate-500 mt-1">{channel.country}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Channel Details */}
        {selectedChannel && (
          <div className="mb-8">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{selectedChannel.name}</CardTitle>
                    <CardDescription className="text-base">{selectedChannel.country}</CardDescription>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <a href={selectedChannel.url} target="_blank" rel="noopener noreferrer">
                      채널 방문
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Channel Image */}
                {selectedChannel.image && (
                  <div className="mb-6 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={selectedChannel.image}
                      alt={selectedChannel.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">구독자</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{selectedChannel.subscribers}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Video className="h-4 w-4" />
                      <span className="text-xs font-medium">영상 수</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{selectedChannel.videoCount}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Microscope className="h-4 w-4" />
                      <span className="text-xs font-medium">주요 분야</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 text-sm">{selectedChannel.mainFocus}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium">월간 조회수</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{selectedChannel.monthlyViews}</div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="overview">개요</TabsTrigger>
                    <TabsTrigger value="analysis">분석</TabsTrigger>
                    <TabsTrigger value="factors">요인</TabsTrigger>
                    <TabsTrigger value="content">콘텐츠</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">핵심 개념</h3>
                      <p className="text-slate-700 bg-blue-50 p-3 rounded-lg">{selectedChannel.concept}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">주요 테마</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedChannel.themes.map((theme, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-slate-100">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Analysis Tab */}
                  <TabsContent value="analysis" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="text-emerald-600">✓</span> 강점
                      </h3>
                      <ul className="space-y-2">
                        {selectedChannel.strengths.map((strength, idx) => (
                          <li key={idx} className="flex gap-2 text-slate-700">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <span className="text-red-600">✗</span> 약점
                      </h3>
                      <ul className="space-y-2">
                        {selectedChannel.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="flex gap-2 text-slate-700">
                            <span className="text-red-600 font-bold">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  {/* Success Factors Tab */}
                  <TabsContent value="factors" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        성공 요인
                      </h3>
                      <ul className="space-y-2">
                        {selectedChannel.successFactors.map((factor, idx) => (
                          <li key={idx} className="flex gap-2 text-slate-700 bg-yellow-50 p-2 rounded">
                            <span className="text-yellow-600 font-bold">→</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">콘텐츠 설명</h3>
                      <p className="text-slate-700 leading-relaxed">{selectedChannel.contentDescription}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">대표 영상</h3>
                      <div className="space-y-2">
                        {selectedChannel.topVideos.map((video, idx) => (
                          <div key={idx} className="flex justify-between items-start bg-slate-50 p-3 rounded-lg">
                            <span className="text-slate-900 font-medium text-sm">{video.title}</span>
                            <span className="text-slate-600 text-xs whitespace-nowrap ml-2">{video.views}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="bg-purple-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-purple-600" />
                주요 기술 분야
              </CardTitle>
              <CardDescription>채널들이 다루는 기술 주제</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span><strong>음향학 & 주파수 분석</strong>: 음파, 주파수, 조화파, 푸리에 변환</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span><strong>음악 제작 기술</strong>: 믹싱, 마스터링, 음향 설계, EQ/압축</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span><strong>무대 기술</strong>: 조명 설계, DMX 프로토콜, 음향 시스템</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span><strong>카메라 & 영상</strong>: 촬영 기술, 색감 관리, 시각 효과</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span><strong>신경과학 & 인식</strong>: 청각 인식, 음향 착각, 뇌 처리</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="bg-emerald-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                공통 성공 전략
              </CardTitle>
              <CardDescription>기술 콘텐츠 채널들의 공통점</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span><strong>시각화</strong>: 복잡한 개념을 시각적으로 명확하게 표현</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span><strong>접근성</strong>: 전문 지식을 일반인도 이해할 수 있게 설명</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span><strong>높은 제작 품질</strong>: 애니메이션, 음향, 영상 품질 우수</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span><strong>실험 & 데모</strong>: 이론을 실제 실험으로 증명</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span><strong>일관된 업로드</strong>: 정기적이고 안정적인 콘텐츠 제공</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span><strong>전문성</strong>: 깊이 있는 기술 지식과 경험</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Channel Comparison */}
        <Card className="border-slate-200 mb-8">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle>채널 특성 비교</CardTitle>
            <CardDescription>채널별 주요 특징과 타겟 오디언스</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 font-semibold text-slate-900">채널명</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-900">구독자</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-900">주요 분야</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-900">특징</th>
                  </tr>
                </thead>
                <tbody>
                  {technicalContentChannels.map((channel) => (
                    <tr key={channel.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-900">{channel.name}</td>
                      <td className="py-3 px-2 text-slate-700">{channel.subscribers}</td>
                      <td className="py-3 px-2 text-slate-700 text-xs">{channel.mainFocus}</td>
                      <td className="py-3 px-2 text-slate-700 text-xs">{channel.concept}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="border-blue-200 bg-blue-50 mb-8">
          <CardHeader className="border-b border-blue-200">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Zap className="h-5 w-5" />
              기술 콘텐츠 성공의 핵심 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">1. 시각화가 핵심</h4>
                <p className="text-slate-700 text-sm">3Blue1Brown, Kurzgesagt 등 성공한 채널들은 복잡한 개념을 시각적으로 명확하게 표현합니다. 음향학, 주파수 등 추상적 개념도 애니메이션으로 직관적으로 이해할 수 있게 만듭니다.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">2. 접근성과 깊이의 균형</h4>
                <p className="text-slate-700 text-sm">Crash Course는 초보자 친화적이면서도 정확한 설명을 제공하고, PBS Space Time은 고급 개념을 명확하게 설명합니다. 타겟 오디언스에 맞는 수준의 설명이 중요합니다.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">3. 높은 제작 품질</h4>
                <p className="text-slate-700 text-sm">음향 설계, 애니메이션, 영상 품질 모두 우수해야 합니다. 특히 음악/영상 기술 채널은 자신의 기술을 직접 보여주는 것이므로 제작 품질이 매우 중요합니다.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">4. 실험과 증명</h4>
                <p className="text-slate-700 text-sm">Veritasium처럼 이론을 실제 실험으로 증명하면 시청자의 신뢰도와 이해도가 크게 높아집니다. 음향 실험, 주파수 시각화 등이 효과적입니다.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">5. 일관성과 정기성</h4>
                <p className="text-slate-700 text-sm">높은 품질을 유지하면서도 정기적으로 콘텐츠를 업로드하는 것이 중요합니다. 구독자들의 기대를 만족시키고 알고리즘 지원을 받으려면 일관된 업로드 일정이 필수입니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm">
          <p>
            이 분석은 음향학, 주파수 분석, 무대 과학, 카메라 원리 등 음악과 영상의 기술적 콘텐츠로 성공한 채널들을 조사하여 작성되었습니다.
            <br />
            각 채널의 접근 방식과 성공 전략을 통해 기술 콘텐츠의 미래를 엿볼 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
