"use client";

import { Bell, ChevronRight, Search } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/shared/ui/badge";
import { Calendar } from "@/shared/ui/calendar";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { CheckboxGroup } from "@/shared/ui/checkbox-group";
import { Chip } from "@/shared/ui/chip";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { IconButton } from "@/shared/ui/icon-button";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { TextField } from "@/shared/ui/text-field";

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
  const [nickname, setNickname] = useState("모락이");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [interests, setInterests] = useState<string[]>(["STUDY"]);
  const [date, setDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const all = terms.a && terms.b;
  const some = terms.a || terms.b;

  const toggleChip = (label: string) =>
    setChips((prev) =>
      prev.includes(label) ? prev.filter((chip) => chip !== label) : [...prev, label],
    );

  return (
    <main className="bg-background-primary flex flex-col gap-8 px-4 py-6">
      <h1 className="text-title-3 font-title text-fg-primary">모락 디자인 시스템</h1>

      <Section title="Spinner · Skeleton">
        <div className="flex items-center gap-4">
          <Spinner />
          <Spinner size={48} />
          <Spinner size={24} />
          <Skeleton className="h-6 w-32" />
        </div>
      </Section>

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

      <Separator />

      <Section title="TextField">
        <TextField required>
          <TextField.Label>닉네임</TextField.Label>
          <TextField.Input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            placeholder="닉네임을 입력해 주세요"
          />
          <TextField.Footer>
            <TextField.Helper>한글·영문·숫자 2~12자</TextField.Helper>
            <TextField.Counter />
          </TextField.Footer>
        </TextField>
        <TextField status="error">
          <TextField.Label>관련 링크</TextField.Label>
          <TextField.Input defaultValue="abc" />
          <TextField.Footer>
            <TextField.Helper>링크 형식이 올바르지 않아요.</TextField.Helper>
          </TextField.Footer>
        </TextField>
        <TextField>
          <TextField.Label>한 줄 소개</TextField.Label>
          <TextField.Textarea rows={3} maxLength={30} placeholder="팀원에게 나를 소개해 주세요" />
          <TextField.Footer>
            <TextField.Counter />
          </TextField.Footer>
        </TextField>
        <TextField disabled>
          <TextField.Label>비활성</TextField.Label>
          <TextField.Input placeholder="입력할 수 없어요" />
        </TextField>
      </Section>

      <Separator />

      <Section title="SegmentedControl">
        <p id="visibility-label" className="text-label-md font-label-strong text-fg-primary">
          공개 설정
        </p>
        <SegmentedControl
          aria-labelledby="visibility-label"
          value={visibility}
          onValueChange={setVisibility}
          className="w-[102px]"
        >
          <SegmentedControl.Item value="PUBLIC">공개</SegmentedControl.Item>
          <SegmentedControl.Item value="PRIVATE">비공개</SegmentedControl.Item>
        </SegmentedControl>
      </Section>

      <Separator />

      <Section title="CheckboxGroup">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-label-md font-label-strong text-fg-primary">관심 분야</legend>
          <CheckboxGroup
            options={[
              { value: "STUDY", label: "공부" },
              { value: "EXERCISE", label: "운동" },
              { value: "READING", label: "독서" },
            ]}
            value={interests}
            onChange={setInterests}
          />
        </fieldset>
      </Section>

      <Separator />

      <Section title="Tabs">
        <Tabs defaultValue="intro">
          <TabsList>
            <TabsTrigger value="cert">인증</TabsTrigger>
            <TabsTrigger value="members">팀원</TabsTrigger>
            <TabsTrigger value="intro">소개</TabsTrigger>
          </TabsList>
          <TabsContent value="cert" className="text-body-sm text-fg-secondary py-4">
            인증 내용
          </TabsContent>
          <TabsContent value="members" className="text-body-sm text-fg-secondary py-4">
            팀원 내용
          </TabsContent>
          <TabsContent value="intro" className="text-body-sm text-fg-secondary py-4">
            소개 내용
          </TabsContent>
        </Tabs>
      </Section>

      <Separator />

      <Section title="Calendar">
        {/* 달력은 렌더링 중에 오늘 날짜를 읽어서, 누른 뒤에만 그린다(cacheComponents 미리 렌더링 에러 방지). */}
        {showCalendar ? (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={{ before: new Date(2026, 10, 17) }}
            defaultMonth={new Date(2026, 10, 1)}
          />
        ) : (
          <Button variant="outline" size="md" onClick={() => setShowCalendar(true)}>
            달력 열기
          </Button>
        )}
      </Section>

      <Section title="ConfirmDialog">
        <Button variant="outline" size="md" onClick={() => setShowDialog(true)}>
          모달 열기
        </Button>
        <ConfirmDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          title="알림을 받아보시겠어요?"
          description="챌린지 인증 시간과 팀원 소식을 알림으로 알려드려요."
          cancelLabel="다음에"
          onConfirm={() => setShowDialog(false)}
        />
      </Section>
    </main>
  );
}
