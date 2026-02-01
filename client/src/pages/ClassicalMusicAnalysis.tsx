import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, Users, Video } from "lucide-react";

interface Channel {
  id: number;
  name: string;
  url: string;
  platform: string;
  subscribers: string;
  videos: string;
  country: string;
  mainInstrument: string;
  uniqueConcept: string;
  keyThemes: string[];
  techniques: string[];
  strengths: string[];
  weaknesses: string[];
  successFactors: string[];
  targetAudience: string;
  contentStyle: string;
  estimatedMonthlyViews: string;
  engagementRate: string;
}

interface ChannelsData {
  channels: Channel[];
  commonSuccessFactors: string[];
  keyTrends: string[];
  failureFactors: string[];
}

export default function ClassicalMusicAnalysis() {
  const [data, setData] = useState<ChannelsData | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/channels_data.json")
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setSelectedChannel(jsonData.channels[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">데이터 로드 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-slate-600">데이터를 로드할 수 없습니다.</p>
        </div>
      </div>
    );
  }

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
              <div className="text-3xl font-bold text-blue-600">{data.channels.length}</div>
              <p className="text-xs text-slate-500 mt-1">전 세계 채널</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">공통 성공 요인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{data.commonSuccessFactors.length}</div>
              <p className="text-xs text-slate-500 mt-1">핵심 전략</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">주요 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{data.keyTrends.length}</div>
              <p className="text-xs text-slate-500 mt-1">산업 동향</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Channel List */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">채널 목록</CardTitle>
                <CardDescription>클릭하여 상세 분석 보기</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {data.channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedChannel?.id === channel.id
                          ? "bg-blue-100 border-l-4 border-blue-600"
                          : "hover:bg-slate-100 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-900">{channel.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{channel.country}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Details */}
          <div className="lg:col-span-3">
            {selectedChannel && (
              <Card className="border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedChannel.name}</CardTitle>
                      <CardDescription className="mt-2">{selectedChannel.country}</CardDescription>
                    </div>
                    <a
                      href={selectedChannel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">채널 방문</span>
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">개요</TabsTrigger>
                      <TabsTrigger value="analysis">분석</TabsTrigger>
                      <TabsTrigger value="factors">요인</TabsTrigger>
                      <TabsTrigger value="content">콘텐츠</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                            <Users className="w-4 h-4" />
                            <span>구독자</span>
                          </div>
                          <div className="text-xl font-bold text-slate-900">{selectedChannel.subscribers}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                            <Video className="w-4 h-4" />
                            <span>영상 수</span>
                          </div>
                          <div className="text-xl font-bold text-slate-900">{selectedChannel.videos}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-slate-600 text-sm mb-1">주요 악기</div>
                          <div className="text-lg font-semibold text-slate-900">{selectedChannel.mainInstrument}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-slate-600 text-sm mb-1">월간 조회수</div>
                          <div className="text-lg font-semibold text-slate-900">{selectedChannel.estimatedMonthlyViews}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm font-semibold text-slate-900 mb-2">핵심 개념</div>
                        <p className="text-slate-700">{selectedChannel.uniqueConcept}</p>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-slate-900 mb-2">주요 테마</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedChannel.keyThemes.map((theme, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-slate-100">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Analysis Tab */}
                    <TabsContent value="analysis" className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <span className="text-green-600">✓</span> 강점
                        </h4>
                        <ul className="space-y-2">
                          {selectedChannel.strengths.map((strength, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-700">
                              <span className="text-green-600 font-bold mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <span className="text-red-600">✗</span> 약점
                        </h4>
                        <ul className="space-y-2">
                          {selectedChannel.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-700">
                              <span className="text-red-600 font-bold mt-0.5">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    {/* Success Factors Tab */}
                    <TabsContent value="factors" className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          성공 요인
                        </h4>
                        <ul className="space-y-2">
                          {selectedChannel.successFactors.map((factor, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-700">
                              <span className="text-blue-600 font-bold mt-0.5">→</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    {/* Content Tab */}
                    <TabsContent value="content" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-slate-600 text-sm mb-1">콘텐츠 스타일</div>
                          <div className="font-semibold text-slate-900">{selectedChannel.contentStyle}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-slate-600 text-sm mb-1">참여도</div>
                          <div className="font-semibold text-slate-900">{selectedChannel.engagementRate}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-600 text-sm mb-2">주요 기법</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedChannel.techniques.map((technique, idx) => (
                            <Badge key={idx} variant="outline" className="border-blue-200">
                              {technique}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-600 text-sm mb-1">타겟 오디언스</div>
                        <p className="text-slate-900">{selectedChannel.targetAudience}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Success Factors */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                공통 성공 요인
              </CardTitle>
              <CardDescription>모든 채널이 공유하는 전략</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.commonSuccessFactors.map((factor, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-emerald-600 font-bold text-lg">✓</span>
                    <span className="text-slate-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Trends */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                주요 트렌드
              </CardTitle>
              <CardDescription>클래식 음악 산업의 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.keyTrends.map((trend, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-purple-600 font-bold text-lg">→</span>
                    <span className="text-slate-700">{trend}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Failure Factors */}
        <Card className="border-slate-200 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg text-red-900 flex items-center gap-2">
              <span className="text-red-600">⚠</span>
              주의할 점 - 실패 요인
            </CardTitle>
            <CardDescription className="text-red-700">피해야 할 실수들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.failureFactors.map((factor, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-white rounded-lg border border-red-100">
                  <span className="text-red-600 font-bold text-lg">✗</span>
                  <span className="text-slate-700">{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white mt-12">
        <div className="container py-8 text-center text-slate-600">
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
