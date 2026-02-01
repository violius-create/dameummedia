/**
 * Swiss International Typographic Style
 * - Clean grid-based layout with systematic structure
 * - Inter typography with clear hierarchy
 * - Minimal decoration, focus on content clarity
 * - Professional blue accent on neutral gray background
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users, Video, Music, Globe, Zap } from "lucide-react";
import { classicalChannels } from "@/data/classicalChannels";

export default function ClassicalMusicAnalysis() {
  const [selectedChannel, setSelectedChannel] = useState(classicalChannels[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            혁신적인 클래식 음악 채널 분석
          </h1>
          <p className="text-lg text-slate-600">
            전 세계의 유튜브와 SNS에서 특이한 주제와 기법으로 성공하는 클래식 음악 채널들을 분석합니다
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
              <div className="text-3xl font-bold text-blue-600">{classicalChannels.length}</div>
              <p className="text-xs text-slate-500 mt-1">전 세계 채널</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">공통 성공 요인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">6</div>
              <p className="text-xs text-slate-500 mt-1">핵심 전략</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">주요 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">6</div>
              <p className="text-xs text-slate-500 mt-1">산업 동향</p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">채널 목록</h2>
          <p className="text-sm text-slate-600 mb-4">클릭하여 상세 분석 보기</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {classicalChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedChannel.id === channel.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-900">{channel.name}</div>
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
                      <Music className="h-4 w-4" />
                      <span className="text-xs font-medium">주요 악기</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{selectedChannel.mainInstrument}</div>
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

        {/* Common Success Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="bg-emerald-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                공통 성공 요인
              </CardTitle>
              <CardDescription>모든 채널이 공유하는 전략</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span>Differentiated positioning beyond simple performance</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span>High production value (video quality, sound quality)</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span>Consistent content upload schedule</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span>Multi-platform strategy (YouTube, Instagram, TikTok, etc.)</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span>Community building and fan interaction</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-emerald-600">✓</span>
                  <span>Balance between education and entertainment</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="bg-purple-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                주요 트렌드
              </CardTitle>
              <CardDescription>클래식 음악 산업의 변화</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span>Classical + Contemporary fusion</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span>Visual elements integration</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span>Educational content</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span>Humor and meme culture</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span>Street performance</span>
                </li>
                <li className="flex gap-2 text-slate-700">
                  <span className="text-purple-600">→</span>
                  <span>Collaboration with other artists</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Failure Factors */}
        <Card className="border-red-200 bg-red-50 mb-8">
          <CardHeader className="border-b border-red-200">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <span>⚠</span>
              주의할 점 - 실패 요인
            </CardTitle>
            <CardDescription className="text-red-600">피해야 할 실수들</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">음악 관련</h4>
                <ul className="space-y-1">
                  <li className="flex gap-2 text-slate-700">
                    <span className="text-red-600">✗</span>
                    <span>Insufficient musical depth</span>
                  </li>
                  <li className="flex gap-2 text-slate-700">
                    <span className="text-red-600">✗</span>
                    <span>Lack of originality</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">운영 관련</h4>
                <ul className="space-y-1">
                  <li className="flex gap-2 text-slate-700">
                    <span className="text-red-600">✗</span>
                    <span>Lack of consistency</span>
                  </li>
                  <li className="flex gap-2 text-slate-700">
                    <span className="text-red-600">✗</span>
                    <span>Low production quality</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">커뮤니티 관련</h4>
                <ul className="space-y-1">
                  <li className="flex gap-2 text-slate-700">
                    <span className="text-red-600">✗</span>
                    <span>Absence of community engagement</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">콘텐츠 관련</h4>
                <ul className="space-y-1">
                  <li className="flex gap-2 text-slate-700">
                    <span className="text-red-600">✗</span>
                    <span>Imbalance between entertainment and education</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm">
          <p>
            이 분석은 전 세계의 혁신적인 클래식 음악 채널들을 조사하여 작성되었습니다.
            <br />
            각 채널의 성공 전략과 특이한 기법을 통해 클래식 음악의 미래를 엿볼 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
