import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("로그인 성공");
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("회원가입 성공! 자동으로 로그인됩니다.");
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      if (password !== confirmPassword) {
        toast.error("비밀번호가 일치하지 않습니다");
        return;
      }
      registerMutation.mutate({ username, name, password });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === "login" ? "로그인" : "회원가입"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "아이디와 비밀번호를 입력해주세요"
                : "새 계정을 만들어주세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  autoComplete="username"
                />
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={4}
                    autoComplete="new-password"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "로그인" : "회원가입"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  계정이 없으신가요?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => {
                      setMode("register");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    회원가입
                  </button>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => {
                      setMode("login");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    로그인
                  </button>
                </>
              )}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <a href={getLoginUrl()} className="block">
              <Button variant="outline" className="w-full">
                Manus 계정으로 로그인
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
