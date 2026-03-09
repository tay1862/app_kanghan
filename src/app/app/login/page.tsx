"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
      } else {
        router.push("/app/dashboard");
        router.refresh();
      }
    } catch {
      setError("ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-light via-neutral-50 to-secondary-light p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <Image
              src="/logo.png"
              alt="Kanghan Logo"
              width={64}
              height={64}
              priority
            />
            <div className="text-center">
              <h1 className="text-xl font-bold text-neutral-900">
                Kanghan Valley
              </h1>
              <p className="text-xs text-neutral-500">
                Resort & Camping Management
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="ຊື່ຜູ້ໃຊ້"
              placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />

            <div className="relative">
              <Input
                label="ລະຫັດຜ່ານ"
                type={showPassword ? "text" : "password"}
                placeholder="ປ້ອນລະຫັດຜ່ານ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-neutral-400 hover:text-neutral-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="mt-2 w-full"
              size="lg"
            >
              <LogIn className="h-4 w-4" />
              ເຂົ້າສູ່ລະບົບ
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400">
          Kanghan Valley Resort & Camping
        </p>
      </div>
    </div>
  );
}
