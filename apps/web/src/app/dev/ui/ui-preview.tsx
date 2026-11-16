"use client";

import { Bell, ChevronRight, Search } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Chip } from "@/shared/ui/chip";
import { IconButton } from "@/shared/ui/icon-button";
import { Separator } from "@/shared/ui/separator";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-1 font-title text-fg-primary">{title}</h2>
      {children}
    </section>
  );
}

export default function UiPreview() {
  const [chips, setChips] = useState<string[]>(["진행 중"]);
  const [terms, setTerms] = useState({ a: false, b: true });
  const all = terms.a && terms.b;
  const some = terms.a || terms.b;

  const toggleChip = (label: string) =>
    setChips((prev) =>
      prev.includes(label) ? prev.filter((chip) => chip !== label) : [...prev, label],
    );

  return (
    <main className="bg-background-primary flex flex-col gap-8 px-4 py-6">
      <h1 className="text-title-3 font-title text-fg-primary">모락 디자인 시스템</h1>

      <Section title="Button">
        {(["primary", "subtle", "outline"] as const).map((variant) => (
          <div key={variant} className="flex flex-col gap-2">
            <p className="text-label-sm font-label-normal text-fg-tertiary">{variant}</p>
            <Button variant={variant} fullWidth>
              챌린지 참여하기
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant={variant} size="md">
                <Search aria-hidden />
                md
              </Button>
              <Button variant={variant} size="sm">
                sm
                <ChevronRight aria-hidden />
              </Button>
              <Button variant={variant} size="md" disabled>
                비활성
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <IconButton aria-label="알림" size="sm">
            <Bell aria-hidden />
          </IconButton>
          <IconButton aria-label="알림">
            <Bell aria-hidden />
          </IconButton>
          <IconButton aria-label="알림" size="lg">
            <Bell aria-hidden />
          </IconButton>
        </div>
      </Section>

      <Separator />

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          {(["brand", "subtle", "neutral", "inverse", "outline"] as const).map((variant) => (
            <Badge key={variant} variant={variant}>
              D-3
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["brand", "subtle", "neutral", "inverse", "outline"] as const).map((variant) => (
            <Badge key={variant} variant={variant} size="sm">
              진행 중
            </Badge>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          {["진행 중", "운동", "독서"].map((label) => (
            <Chip key={label} selected={chips.includes(label)} onClick={() => toggleChip(label)}>
              {label}
            </Chip>
          ))}
          <Chip disabled>비활성</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip size="sm">작은 칩</Chip>
          <Chip size="sm" selected>
            선택됨
          </Chip>
        </div>
      </Section>

      <Separator />

      <Section title="Checkbox">
        <Checkbox
          label="전체동의"
          checked={all ? true : some ? "indeterminate" : false}
          onCheckedChange={(checked) => setTerms({ a: checked === true, b: checked === true })}
        />
        <Checkbox
          label="[필수] 이용약관"
          checked={terms.a}
          onCheckedChange={(checked) => setTerms((prev) => ({ ...prev, a: checked === true }))}
        />
        <Checkbox
          label="[필수] 개인정보 수집·이용"
          checked={terms.b}
          onCheckedChange={(checked) => setTerms((prev) => ({ ...prev, b: checked === true }))}
        />
        <Checkbox label="비활성" disabled />
      </Section>
    </main>
  );
}
